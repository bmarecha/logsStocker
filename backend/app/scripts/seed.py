import os
import random
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

from opensearchpy import OpenSearch

from app.config import settings


def seed(should_seed: Optional[bool] = None) -> None:
    """Initialize OpenSearch indices and optionally populate sample logs.

    - If `should_seed` is None, the function will read the `SEEDING` environment
      variable (case-insensitive) to decide.
    - Index name pattern: `logs-YYYY.MM.DD` with mapping:
        - `timestamp`: date
        - `level`: keyword
        - `service`: keyword
        - `message`: text
    - Creates an alias `logs` pointing to all `logs-*` indices for unified querying.
    """
    if should_seed is None:
        should_seed = os.getenv("SEEDING", "false").lower() == "true"

    print(f"seed.py: starting (SEEDING={should_seed})")

    host = settings.opensearch_host
    port = settings.opensearch_port
    client = OpenSearch(hosts=[{"host": host, "port": port}])

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

    if not should_seed:
        print("SEEDING not enabled; skipping document population.")
        # Still ensure alias exists for querying
        _ensure_alias(client)
        return

    print("SEEDING enabled; inserting sample documents...")
    sample_levels = ["INFO", "WARNING", "ERROR", "DEBUG"]
    level_weights = [60, 25, 10, 5]
    sample_services = [
        "auth",
        "payments",
        "worker",
        "api",
        "frontend",
        "scheduler",
        "notifications",
        "search",
        "ingest",
        "audit",
    ]

    seeding_size = int(os.getenv("SEEDING_SIZE", "50"))
    print(f"Seeding {seeding_size} documents...")

    now = datetime.now(timezone.utc)
    created_indices = set()
    
    for i in range(1, seeding_size + 1):
        # Generate a timestamp spread over the past 365 days
        random_timestamp = now - timedelta(seconds=random.randint(0, 365 * 24 * 60 * 60))
        timestamp_str = random_timestamp.isoformat()
        
        # Determine the index name based on the document's timestamp
        index_date = random_timestamp.strftime('%Y.%m.%d')
        index_name = f"logs-{index_date}"
        
        # Create the index if it doesn't exist (with mapping)
        if index_name not in created_indices:
            if not client.indices.exists(index=index_name):
                print(f"Creating index {index_name} with mapping...")
                client.indices.create(index=index_name, body=mapping)
            created_indices.add(index_name)
        
        # Index the document
        doc = {
            "timestamp": timestamp_str,
            "level": random.choices(sample_levels, weights=level_weights, k=1)[0],
            "service": random.choice(sample_services),
            "message": f"Sample log message #{i} for seeding",
        }
        client.index(index=index_name, body=doc)

    print(f"Seeding complete. Inserted {seeding_size} documents across {len(created_indices)} indices.")
    
    # Create or update the alias to point to all logs-* indices
    _ensure_alias(client)


def _ensure_alias(client: OpenSearch) -> None:
    """Ensure the 'logs' alias exists and points to all logs-* indices."""
    alias_name = "logs"
    
    # Get all logs-* indices
    try:
        all_indices = client.indices.get(index="logs-*")
        logs_indices = list(all_indices.keys())
        print(f"Found {len(logs_indices)} logs-* indices: {logs_indices}")
    except Exception as e:
        print(f"Warning: Could not list logs-* indices: {e}")
        logs_indices = []
    
    if not logs_indices:
        print("No logs-* indices found; skipping alias creation")
        return
    
    # Add alias to each index (safe operation - won't fail if alias already exists)
    for idx in logs_indices:
        try:
            client.indices.put_alias(index=idx, name=alias_name)
            print(f"Added/ensured alias '{alias_name}' on index '{idx}'")
        except Exception as e:
            print(f"Warning: Failed to add alias '{alias_name}' to index '{idx}': {e}")


def main(argv: Optional[list] = None) -> None:
    argv = argv if argv is not None else sys.argv[1:]
    # allow optional flag --seed / --no-seed
    should_seed = None
    if "--seed" in argv:
        should_seed = True
    elif "--no-seed" in argv:
        should_seed = False

    seed(should_seed=should_seed)


if __name__ == "__main__":
    main()