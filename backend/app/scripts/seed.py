import os
import random
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

from opensearchpy import OpenSearch

from app.config import settings


def seed(should_seed: Optional[bool] = None) -> None:
    """Initialize OpenSearch index and optionally populate sample logs.

    - If `should_seed` is None, the function will read the `SEEDING` environment
      variable (case-insensitive) to decide.
    - Index name pattern: `logs-YYYY.MM.DD` and mapping:
        - `timestamp`: date
        - `level`: keyword
        - `service`: keyword
        - `message`: text
    """
    if should_seed is None:
        should_seed = os.getenv("SEEDING", "false").lower() == "true"

    print(f"seed.py: starting (SEEDING={should_seed})")

    host = settings.opensearch_host
    port = settings.opensearch_port
    client = OpenSearch(hosts=[{"host": host, "port": port}])

    date_str = datetime.now(timezone.utc).strftime("%Y.%m.%d")
    index_name = f"logs-{date_str}"

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

    if not client.indices.exists(index=index_name):
        print(f"Creating index {index_name} with mapping...")
        client.indices.create(index=index_name, body=mapping)
    else:
        print(f"Index {index_name} already exists")

    if not should_seed:
        print("SEEDING not enabled; skipping document population.")
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

    now = datetime.now(timezone.utc)
    for i in range(1, 21000):
        random_timestamp = now - timedelta(seconds=random.randint(0, 365 * 24 * 60 * 60))
        doc = {
            "timestamp": random_timestamp.isoformat(),
            "level": random.choices(sample_levels, weights=level_weights, k=1)[0],
            "service": random.choice(sample_services),
            "message": f"Sample log message #{i} for seeding",
        }
        client.index(index=index_name, body=doc)

    print("Seeding complete.")


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