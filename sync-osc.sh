#!/bin/bash
# sync-osc.sh — pull OSC content from GitHub to NFS
# Place in devops crontab: * * * * * /home/devops/bin/sync-osc.sh
set -e
cd /data/sites/chancellery/osc/httpdocs
git fetch origin -q 2>/dev/null || exit 0
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null) || exit 0
[ "$LOCAL" = "$REMOTE" ] && exit 0
git reset --hard origin/main 2>/dev/null
echo "$(date -Is) OSC synced: $LOCAL -> $REMOTE"
