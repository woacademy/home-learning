#!/usr/bin/env bash

# Use file directory rather than working directory.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# Use a PAT to authentica with git.
git remote set-url origin https://woacademy:${LEONA_PAT}@github.com/woacademy/home-learning.git
