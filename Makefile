all:
	mkdir -p build
	npm run build
	find build/ -name \*map | xargs rm
	find build/ -name \*LICENSE.txt | xargs rm
	gzip -6 -k build/static/js/*js
	gzip -6 -k build/static/css/*css
	gzip -6 -k build/*json
	gzip -6 -k build/*html
	gzip -6 -k build/static/media/*eot
	gzip -6 -k build/static/media/*ttf
	tar -c build | zstd -6 > release/final.tar.zst

install: all
	rsync -avpx --delete --exclude data build/ www.doma:/var/www/html/gallery/

