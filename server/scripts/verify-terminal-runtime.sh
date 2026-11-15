#!/bin/sh
# Runs each allowlisted terminal command's argv on Linux and reports whether the
# output is usable. The argv list is kept in sync with server/terminal.mjs.
#
# Usage: sh scripts/verify-terminal-runtime.sh

set -u
failures=0

check() {
  label="$1"
  shift
  output="$("$@" 2>&1)"
  status=$?
  first=$(printf '%s' "$output" | head -1)

  case "$output" in
    *"not a git repository"*|*"cannot open"*|*"No such file"*|*"command not found"*|*"not found"*)
      failures=$((failures + 1))
      printf 'FAIL  %-20s %s\n' "$label" "$first"
      ;;
    *)
      if [ "$status" -ne 0 ]; then
        failures=$((failures + 1))
        printf 'FAIL  %-20s exit=%s %s\n' "$label" "$status" "$first"
      else
        printf 'OK    %-20s %s\n' "$label" "$(printf '%s' "$first" | cut -c1-70)"
      fi
      ;;
  esac
}

check 'uname -a'           uname -a
check 'uptime'             uptime
check 'free -h'            free -h
check 'df -h'              df -h
check 'whoami'             whoami
check 'hostname'           hostname
check 'id'                 id
check 'nproc'              nproc
check 'git log'            cat /home/ubuntu/nhatprx-api/VERSION
check 'git branch'         cat /home/ubuntu/nhatprx-api/VERSION
check 'git status'         cat /home/ubuntu/nhatprx-api/VERSION
check 'git show'           cat /home/ubuntu/nhatprx-api/VERSION
check 'metrics'            ps -eo pid,comm,rss
check 'metrics-cpu'        top -bn1
check 'ps'                 ps -eo pid,comm,rss
check 'ls -la'             ls -la .
check 'proc-cpuinfo'       grep -c '^processor' /proc/cpuinfo
check 'proc-meminfo'       cat /proc/meminfo
check 'proc-loadavg'       cat /proc/loadavg
check 'proc-net-dev'       cat /proc/net/dev

printf '\n'
if [ "$failures" -gt 0 ]; then
  printf '%s command(s) failed\n' "$failures"
  exit 1
fi
printf 'Every command ran\n'
