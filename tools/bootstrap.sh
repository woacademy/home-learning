#!/usr/bin/env bash
# Bootstrap an environment on first use.

# Operate from the script's directory rather than cwd.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# Commit with the correct credentials.
git config user.name woacademy
git config user.email 36260671+woacademy@users.noreply.github.com

# Use a PAT to authentice with git.
git remote set-url origin https://woacademy:${LEONA_PAT}@github.com/woacademy/home-learning.git
