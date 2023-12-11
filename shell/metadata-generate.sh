#!/bin/bash

FILTER='{FileName : .FileName, CreateDate : .CreateDate, FileSize : .FileSize, ImageWidth : .ImageWidth, ImageHeight : .ImageHeight, MIMEType : .MIMEType, FileType : .FileType, FileModifyDate : .FileModifyDate, Orientation : .Orientation}'

if [ "$1" == "" ]; then
	echo "Folder missing"
	exit 1
fi

if [ ! -f "./process-image.sh" ]; then
	echo "Metadata generator missing"
	exit 2
fi

if [ ! -f "./index-dirs.sh" ]; then
	echo "Dir indexer missing"
	exit 2
fi

read -p "Clean previous data [y] or ENTER: " CLEAN
if [ "$CLEAN" == "y" ]; then
	echo Cleaning $1
	for i in '*_thumbnail.webp' '*_small.webp' '*_small.mp4' '*.json.gz' '*_metadata.json'; do
		find "$1" -type f -name $i | parallel --colsep '\n' rm
	done
fi

find "$1" -type f ! -name '*.json' ! -name '*_thumbnail.webp' ! -name '*_small.webp' ! -name '*.mp4' ! -name '*.gz' ! -name '*.sh' | sort | parallel --colsep '\n' ./process-image.sh
find "$1" -type f ! -name '*.json' ! -name '*_thumbnail.webp' ! -name '*_small.webp' ! -name '*_small.mp4' ! -name '*.gz' ! -name '*.sh' | sort | parallel -j 1 --colsep '\n' ./process-image.sh

find "$1" -type d | sort | while read DIR; do
	if [ $(find "$DIR" -maxdepth 1 -type f -name '*_metadata.json' | wc -l) -eq 0 ]; then
		continue
	fi
	echo "Creating index in: $DIR"
	jq -s 'add' "$DIR/"*_metadata.json | jq "[.[] | $FILTER]" | gzip -6 >"$DIR/index.json.gz"
done

D=$(pwd)
pushd "$1"
"$D"/index-dirs.sh | gzip -6 >dirs.json.gz
popd
