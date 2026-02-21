#!/usr/bin/env bash
set -e
DIR=${1:-./scraped}
ARCHIVE=${2:-./scraped/archive}
mkdir -p "$ARCHIVE"
node backend/scripts/seedProblems.js "$DIR" --archive-dir="$ARCHIVE"
