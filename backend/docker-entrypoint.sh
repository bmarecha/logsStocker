#!/bin/sh
set -e

SEED_MARKER="/seed-state/.seeded"

echo "docker-entrypoint: SEEDING=${SEEDING:-false}, marker=${SEED_MARKER}"

if [ "${SEEDING:-false}" = "true" ] && [ ! -f "$SEED_MARKER" ]; then
  echo "Seeding requested and no marker found. Running seed script..."
  python -m app.scripts.seed
  mkdir -p /seed-state
  touch "$SEED_MARKER"
else
  if [ "${SEEDING:-false}" != "true" ]; then
    echo "docker-entrypoint: skipping seed because SEEDING is not enabled"
  else
    echo "docker-entrypoint: skipping seed because marker already exists"
  fi
fi

exec "$@"