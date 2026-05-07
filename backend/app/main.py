from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from opensearchpy import OpenSearch

from app.config import settings

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


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "environment": settings.env}


@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Welcome to LogsStock API"}


@app.get("/logs/search")
def search_logs(
    q: str = Query("", description="Full-text query for message field"),
    level: Optional[str] = Query(None, description="Exact level filter"),
    service: Optional[str] = Query(None, description="Exact service filter"),
    page_num: int = Query(1, ge=1, description="Page number, 1-based"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """Search logs in OpenSearch.

    - `q` uses a `match` on the `message` field (full-text)
    - `level` and `service` use `term` filters (exact)
    Results are sorted by `timestamp` descending (most recent first).
    """
    index = "logs-*"
    try:
        # Build OpenSearch query
        must_clauses = []
        filter_clauses = []

        if q:
            must_clauses.append({"match": {"message": {"query": q}}})

        if level:
            filter_clauses.append({"term": {"level": level}})

        if service:
            filter_clauses.append({"term": {"service": service}})

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

        resp = es_client.search(index=index, body=query_body, from_=from_, size=page_size)

        # Extract total
        total_obj = resp.get("hits", {}).get("total", 0)
        if isinstance(total_obj, dict):
            total = total_obj.get("value", 0)
        else:
            total = total_obj

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
            "page_num": page_num,
            "page_size": page_size,
            "results": results,
        }

    except Exception as exc:  # pragma: no cover - surface errors to client
        raise HTTPException(status_code=503, detail=f"OpenSearch query failed: {exc}")
