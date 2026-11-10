#!/bin/bash
# sync-osc.sh — pull OSC content from GitHub to NFS
# Place in devops crontab: 0-59/5 * * * * /home/devops/bin/sync-osc.sh
# A bare "* * * * *" is rejected by cronie -- Web-Ops #307. The leading
# "0-59/5" form is what is deployed and documented in AGENTS.md.
set -e
cd /data/sites/chancellery/osc/httpdocs
git fetch origin -q 2>/dev/null || exit 0
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null) || exit 0
[ "$LOCAL" = "$REMOTE" ] && exit 0
git reset --hard origin/main 2>/dev/null
echo "$(date -Is) OSC synced: $LOCAL -> $REMOTE"
