from datetime import datetime
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from opensearchpy import OpenSearch
from pydantic import BaseModel, Field

from app.config import settings


class LogCreate(BaseModel):
    """Model for creating a new log entry."""
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    level: Literal["INFO", "WARNING", "ERROR", "DEBUG"] = Field(..., description="Log level: INFO, WARNING, ERROR, or DEBUG")
    message: str = Field(..., description="Log message")
    service: str = Field(..., description="Service name")

    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2026-05-09T10:30:00Z",
                "level": "INFO",
                "message": "Application started",
                "service": "api"
            }
        }


class LogResponse(BaseModel):
    """Model for log response with OpenSearch ID."""
    id: str = Field(..., description="OpenSearch document ID")
    timestamp: str
    level: str
    message: str
    service: str

app = FastAPI(
    title="LogsStock API",
    description="FastAPI backend for LogsStock",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenSearch client (no auth assumed for local/dev)
es_client = OpenSearch(
    hosts=[{"host": settings.opensearch_host, "port": settings.opensearch_port}],
    timeout=30,
    max_retries=3,
    retry_on_timeout=True,
)


@app.on_event("startup")
async def startup_event():
    """Ensure the logs alias exists on startup."""
    try:
        # Check if the alias exists
        try:
            es_client.indices.get_alias(name="logs")
        except Exception:
            # Alias doesn't exist, we'll create it when first indices are created
            pass
    except Exception as e:
        print(f"Warning: Could not check logs alias on startup: {e}")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "environment": settings.env}


@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Welcome to LogsStock API"}


@app.post("/logs")
def create_log(payload: LogCreate):
    """Create a new log entry in OpenSearch.

    The log is indexed in an index named logs-YYYY.MM.DD based on the provided timestamp.
    Returns the created log with the OpenSearch-generated ID.
    """
    try:
        # Parse timestamp to get the date for index naming
        timestamp_obj = datetime.fromisoformat(payload.timestamp.replace('Z', '+00:00'))
        index_date = timestamp_obj.strftime('%Y.%m.%d')
        index_name = f"logs-{index_date}"

        # Ensure the index exists with proper mapping
        if not es_client.indices.exists(index=index_name):
            mapping = {
                "mappings": {
                    "properties": {
                        "timestamp": {"type": "date"},
                        "level": {"type": "keyword"},
                        "service": {"type": "keyword"},
                        "message": {"type": "text"},
                    }
                }
            }
            es_client.indices.create(index=index_name, body=mapping)

        # Prepare document
        doc = {
            "timestamp": payload.timestamp,
            "level": payload.level,
            "message": payload.message,
            "service": payload.service.lower(),
        }

        # Index in OpenSearch
        response = es_client.index(index=index_name, body=doc)
        doc_id = response.get("_id")
        
        # Ensure the alias exists and includes this index
        try:
            es_client.indices.put_alias(index=index_name, name="logs")
        except Exception:
            pass  # Alias might already exist
        
        # Refresh the index to make the new document immediately searchable
        es_client.indices.refresh(index=index_name)

        return LogResponse(
            id=doc_id,
            timestamp=payload.timestamp,
            level=payload.level,
            message=payload.message,
            service=payload.service,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid timestamp format: {e}")
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Failed to create log: {exc}")


@app.get("/logs/search")
def search_logs(
    q: str = Query("", description="Full-text query for message field"),
    level: Optional[Literal["INFO", "WARNING", "ERROR", "DEBUG"]] = Query(None, description="Exact level filter"),
    service: Optional[str] = Query(None, description="Exact service filter"),
    date_from: Optional[str] = Query(None, description="Start timestamp (ISO 8601)"),
    date_to: Optional[str] = Query(None, description="End timestamp (ISO 8601)"),
    page_num: int = Query(1, ge=1, description="Page number, 1-based"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """Search logs in OpenSearch.

    - `q` uses a `match` on the `message` field (full-text)
    - `level` and `service` use `term` filters (exact)
    - `date_from` and `date_to` filter by timestamp range
    Results are sorted by `timestamp` descending (most recent first).
    """
    max_result_window = 10000
    
    try:
        # Build OpenSearch query
        must_clauses = []
        filter_clauses = []

        if q:
            must_clauses.append({"match": {"message": {"query": q}}})

        if level:
            filter_clauses.append({"term": {"level": level}})

        if service:
            filter_clauses.append({"term": {"service": service.lower()}})

        # Add date range filter
        if date_from or date_to:
            range_filter = {"range": {"timestamp": {}}}
            if date_from:
                range_filter["range"]["timestamp"]["gte"] = date_from
            if date_to:
                range_filter["range"]["timestamp"]["lte"] = date_to
            filter_clauses.append(range_filter)

        if must_clauses or filter_clauses:
            bool_query = {"bool": {}}
            if must_clauses:
                bool_query["bool"]["must"] = must_clauses
            if filter_clauses:
                bool_query["bool"]["filter"] = filter_clauses
            query_body = {"query": bool_query}
        else:
            query_body = {"query": {"match_all": {}}}

        # sorting and pagination
        from_ = (page_num - 1) * page_size
        query_body["sort"] = [{"timestamp": {"order": "desc"}}]
        query_body["track_total_hits"] = True
        
        # Add aggregation for level counts
        query_body["aggs"] = {
            "level_distribution": {
                "terms": {
                    "field": "level",
                    "size": 4
                }
            }
        }

        try:
            resp = es_client.search(index="logs", body=query_body, from_=from_, size=page_size)
        except Exception as e:
            # If the alias doesn't exist, try with wildcard
            if "no such index" in str(e).lower() or "does not exist" in str(e).lower():
                resp = es_client.search(index="logs-*", body=query_body, from_=from_, size=page_size)
            else:
                raise

        # Extract total
        total_obj = resp.get("hits", {}).get("total", 0)
        if isinstance(total_obj, dict):
            total = total_obj.get("value", 0)
        else:
            total = total_obj

        # loaded is capped at max_result_window
        loaded = min(total, max_result_window)

        # Extract level counts from aggregation
        level_counts = {"INFO": 0, "WARNING": 0, "ERROR": 0, "DEBUG": 0}
        aggs = resp.get("aggregations", {})
        level_dist = aggs.get("level_distribution", {}).get("buckets", [])
        for bucket in level_dist:
            level = bucket.get("key", "")
            count = bucket.get("doc_count", 0)
            if level in level_counts:
                level_counts[level] = count

        results = []
        for hit in resp.get("hits", {}).get("hits", []):
            src = hit.get("_source", {})
            results.append(
                {
                    "id": hit.get("_id"),
                    "timestamp": src.get("timestamp"),
                    "level": src.get("level"),
                    "service": src.get("service"),
                    "message": src.get("message"),
                }
            )

        return {
            "total": total,
            "loaded": loaded,
            "page_num": page_num,
            "page_size": page_size,
            "results": results,
            "level_counts": level_counts,
        }

    except Exception as exc:  # pragma: no cover - surface errors to client
        raise HTTPException(status_code=503, detail=f"OpenSearch query failed: {exc}")
