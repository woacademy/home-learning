#!/usr/bin/env bash
# Generate a basic index.html containing a file hierarchy.

# Use file directory rather than working directory.
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$PARENT_PATH"

# Don't expand null globs.
shopt -s nullglob

function remove_trailing_comma() {
	# Remove the trailing comma as it results in invalid JSON.
	# TODO: Drop this function and deal with this properly (jq?).
	if [[ "${json: -1}" = ',' ]]; then
		json=${json%?}
	fi
}

function scan_files() {
	# Create a files list.
	json="${json}\"files\":["

	local f;
	for f in "$1"/*; do
		if [[ -f $f ]]; then
			# Add each file to the list (both relative path and basename).
			json="${json}{\"filename\":\"$(basename -- "${f}")\",\"filepath\":\"${f}\"},"
		fi
	done

	# Trim and close the files list.
	remove_trailing_comma
	json="${json}],"
}

function scan_dir() {
	# Add each dir to the list (both relative path and basename).
	json="${json}{\"dirname\":\"$(basename -- "${1}")\",\"dirpath\":\"${1}\","
	scan_files "$1"

	# Create a dirs list.
	json="${json}\"dirs\":["

	local d;
	for d in "$1"/*/; do
		scan_dir "${d%/}"
	done

	# Trim and close the dirs list.
	remove_trailing_comma
	json="${json}]},"
}

# Create a blank JSON string and start the scan.
json=''
scan_dir '../Resources'

# Trim and output to hierarchy.json
remove_trailing_comma
echo "$json" > "../hierarchy.json"
