#!/usr/bin/env bash
# Keep Google Drive and Git in sync.

# Operate from the script's directory rather than cwd.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# rclone isn't in our Windows PATH, update the resources folder.
rm -rf '../Resources'
if [ -x "$(command -v rclone)" ]; then
    rclone copy homelearning: '../Resources'
else
    ./rclone.exe copy homelearning: '../Resources'
fi

# Regenerate the resources hierarchy.
bash ./generate_hierarchy.sh

# Update git.
git pull
git add '../.'
git commit -m "`date`"
git push
