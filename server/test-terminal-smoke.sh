#!/usr/bin/env bash
# Smoke test for the public terminal endpoint on the EC2 node.
set -eu
BASE="http://127.0.0.1:8787/api/terminal/exec"

run() {
  printf '%s -> ' "$1"
  curl -s -X POST "$BASE" -H 'Content-Type: application/json' -d "{\"command\":\"$1\"}"
  printf '\n'
}

run uname -a
run free -h
run df -h
run uptime
run hostname
run systemctl-nhatprx
run nginx-status
run whoami
run 'ls -1 -la'
echo "--- rejections (expect errors) ---"
run 'rm -rf /'
run 'sudo'
run 'docker ps'
run 'uname; cat /etc/passwd'
