#!/usr/bin/env bash
# Checks the host key pinning the way the deploy workflow does.
#
#   bash verify-host-key.sh [host] [pinned-value]
#
# The pinned value may be the bare fingerprint or the full ssh-keygen line.
set -euo pipefail

EC2_HOST="${1:-13.250.247.238}"
EC2_SSH_HOST_KEY="${2:-}"

if [ -z "$EC2_SSH_HOST_KEY" ]; then
  echo "::error::EC2_SSH_HOST_KEY secret is not set"
  exit 1
fi
EXPECTED_FINGERPRINT=$(printf '%s' "$EC2_SSH_HOST_KEY" | tr ' ' '\n' | grep -E '^SHA256:' | head -1)
HOST_KEYS=$(ssh-keyscan -H "$EC2_HOST" 2>/dev/null)
if [ -z "$HOST_KEYS" ]; then
  echo "::error::could not read the host key of $EC2_HOST"
  exit 1
fi
ACTUAL_FINGERPRINTS=$(printf '%s\n' "$HOST_KEYS" | ssh-keygen -lf - | awk '{print $2}')
if ! printf '%s\n' "$ACTUAL_FINGERPRINTS" | grep -qxF "$EXPECTED_FINGERPRINT"; then
  echo "::error::SSH host key mismatch for $EC2_HOST (expected $EXPECTED_FINGERPRINT, got $(printf '%s' "$ACTUAL_FINGERPRINTS" | tr '\n' ' '))"
  exit 1
fi
echo "host key pinned: $EXPECTED_FINGERPRINT"
