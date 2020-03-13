#!/usr/bin/env bash

# Use file directory rather than working directory.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# Update the Resources folder.
rm -rf '../Resources'
if ! [ -x "$(command -v rclone)" ]; then
    ./rclone.exe copy homelearning: '../Resources'
else
    rclone copy homelearning: '../Resources'
fi

# Regenerate the hierarchy.
bash ./generate_hierarchy.sh

# Push any changes to git.
git pull
git add '../.'
git commit -m "`date`"
git push
