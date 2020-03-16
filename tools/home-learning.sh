#!/usr/bin/env bash
# Keep Google Drive and Git in sync.

# Operate from the script's directory rather than cwd.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# Update from remote first!
git pull

# rclone isn't in our Windows PATH, update the resources folder.
rm -rf '../Resources'
if [ -x "$(command -v rclone)" ]; then
    rclone copy homelearning: '../Resources'
else
    ./rclone.exe copy homelearning: '../Resources'
fi

# Regenerate the resources hierarchy.
bash ./generate_hierarchy.sh

# Alternative hierarchy layout using tree, GNU grep on macOS is ggrep.
if [ -x "$(command -v ggrep)" ]; then
	tree -H "" '../Resources/KS3' | ggrep -Pzo '(?s)<a.*<\/a><br>' > ../treeks3.html
	tree -H "" '../Resources/KS4' | ggrep -Pzo '(?s)<a.*<\/a><br>' > ../treeks4.html
else
	tree -H "" '../Resources/KS3' | grep -Pzo '(?s)<a.*<\/a><br>' > ../treeks3.html
	tree -H "" '../Resources/KS4' | grep -Pzo '(?s)<a.*<\/a><br>' > ../treeks4.html
fi

# Update git remote.
git add '../.'
git commit -m "`date`"
git push
