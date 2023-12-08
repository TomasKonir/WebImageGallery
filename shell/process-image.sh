#!/bin/bash

EXTENSIONS="jpg jpeg tif tiff png"
SMALL_SIZE=1280
SMALL_QUALITY=85
THUMB_SIZE=128
THUMB_QUALITY=75

if [ "$1" ==  "" ]; then
	echo "filename missing"
	exit 1
fi

EXT=$(echo "${1##*.}" | tr "[:upper:]" "[:lower:]")
THUMB="${1%.*}"_thumbnail.webp
SMALL="${1%.*}"_small.webp
META="${1%.*}"_metadata.json

#check file exists
if [ ! -f "$1" ]; then
	echo "File: $1" not exists
	exit 2
fi

#check extension
EXT_OK=0
for i in $EXTENSIONS; do
	if [ "$i" == "$EXT" ]; then
		EXT_OK=1
		break
	fi
done
if [ $EXT_OK -ne 1 ]; then
	echo "$EXT is not allowed"
	exit 3
fi

MTIME_ORIG=$(stat -c %Y "$1")
#check mtime of file and metadata
if [ -f "$THUMB" ]; then
	MTIME_THUMB=$(stat -c %Y "$THUMB")
	if [ $MTIME_THUMB -eq $MTIME_ORIG ]; then
		exit 0
	fi
fi

#create small
convert -resize x$SMALL_SIZE -quality $SMALL_QUALITY -auto-orient "$1"[0] "$SMALL" 2>/dev/null
if [ ! -f "$SMALL" ]; then
	echo "Unable to create thumbnail from: $1 (maybe limits in /etc/ImageMagick-6/policy.xml)"
	convert -list resource
	exit 4
fi
exiftool -all= -overwrite_original "$SMALL" 2>/dev/null >/dev/null
touch --date="@$MTIME_ORIG" "$SMALL"

#create thumbnail
convert -resize x$THUMB_SIZE -quality $THUMB_QUALITY -auto-orient "$SMALL" "$THUMB" 2>/dev/null
if [ ! -f "$THUMB" ]; then
	echo "Unable to create thumbnail from: $1 (maybe limits in /etc/ImageMagick-6/policy.xml)"
	convert -list resource
	exit 4
fi
exiftool -all= -overwrite_original "$THUMB" 2>/dev/null >/dev/null
touch --date="@$MTIME_ORIG" "$THUMB"

#extract metadata
exiftool -j "$1" > "$META"
if [ $? -ne 0 ]; then
	rm "$META"
	echo "Unable to extract metadata from: $1"
	exit 5
fi
touch --date="@$MTIME_ORIG" "$META"

echo "OK ... $1"
