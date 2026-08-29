#!/bin/bash
# Watchdog: checks every 10s and restarts Next.js if port 3000 is not listening
while true; do
  if ! ss -tlnp | grep -q ':3000 '; then
    cd /home/z/my-project/user-project
    nohup node node_modules/.bin/next start -p 3000 >> /tmp/next-server.log 2>&1 &
    echo "[$(date)] Restarted Next.js (PID $!)" >> /tmp/watchdog.log
  fi
  sleep 10
  sleep $((RANDOM % 5))
done
