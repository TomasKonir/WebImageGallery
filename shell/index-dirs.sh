#!/bin/bash

function processDir(){
	local COUNT=0
	local FIRST=1
	IFS=$'\n'
	for DIR in $(ls -d */ 2>/dev/null | tr -d "/" | sort); do 
		if [ $FIRST -eq 1 ]; then
			echo -en "$1\"$DIR\" : {"
			FIRST=0
		else
			echo -en ",$1\"$DIR\" : {"
		fi
		pushd "$DIR" >/dev/null
		processDir "$1  "
		if [ $? -eq 0 ]; then
			echo -en "\"_count\":$(find . -maxdepth 1 -type f | wc -l)"
			echo -en "$1}"
		else
			echo -en ",\"_count\":$(find . -maxdepth 1 -type f -name '*_thumbnail.webp' | wc -l)"
			echo -en "$1}"
		fi
		popd >/dev/null
		COUNT=$(($COUNT+1))
	done
	return $COUNT
}

echo -en "{" $(processDir) "}" | jq
