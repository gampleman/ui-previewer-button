all: build/artifacts/ui-previewer-button.xpi build/artifacts/ui-previewer-button.zip safari

SRC_JS = $(shell find src -type f -name '*.js')
SRC_ICONS = icons/Icon-16.png icons/Icon-32.png icons/Icon-48.png icons/Icon-64.png icons/Icon-96.png icons/Icon-128.png icons/Icon-256.png
FIREFOX_TARGET_JS = $(patsubst src/%, build/firefox/src/%, $(SRC_JS))
FIREFOX_ICONS = $(patsubst icons/%, build/firefox/icons/%, $(SRC_ICONS))

build/artifacts/ui-previewer-button.xpi: build/firefox/manifest.json $(FIREFOX_TARGET_JS) $(FIREFOX_ICONS) build/firefox/src/options/index.html build/firefox/src/options/icons.js
	@mkdir -p $(@D)
	@cd build/firefox; zip -r ui-previewer-button.xpi $(patsubst build/firefox/%, %, $^)
	@mv build/firefox/ui-previewer-button.xpi $@

CHROME_TARGET_JS = $(patsubst src/%, build/chrome/src/%, $(SRC_JS))
CHROME_ICONS = $(patsubst icons/%, build/chrome/icons/%, $(SRC_ICONS))

build/artifacts/ui-previewer-button.zip: build/chrome/manifest.json $(CHROME_TARGET_JS) $(CHROME_ICONS) build/chrome/src/options/index.html build/chrome/src/options/icons.js
	@mkdir -p $(@D)
	@cd build/chrome; zip -r ui-previewer-button.zip $(patsubst build/chrome/%, %, $^)
	@mv build/chrome/ui-previewer-button.zip $@

SAFARI_TARGET_JS = $(patsubst src/%, build/artifacts/ui-previewer-button.safariextension/src/%, $(SRC_JS))
SAFARI_ICONS = $(patsubst icons/%, build/artifacts/ui-previewer-button.safariextension/%, $(SRC_ICONS))
safari: build/artifacts/ui-previewer-button.safariextension/Info.plist $(SAFARI_TARGET_JS) $(SAFARI_ICONS) build/artifacts/ui-previewer-button.safariextension/src/options/index.html build/artifacts/ui-previewer-button.safariextension/src/options/icons.js build/artifacts/ui-previewer-button.safariextension/src/global.html

build/%/manifest.json: src/manifests/%.json
	@mkdir -p $(@D)
	cp $< $@

build/artifacts/ui-previewer-button.safariextension/Info.plist: src/manifests/safari.plist
	@mkdir -p $(@D)
	cp $< $@

build/firefox/src/%.js: src/%.js node_modules/.bin/uglifyjs
	@mkdir -p $(@D)
	node_modules/.bin/uglifyjs --screw-ie8 --beautify --define 'PLATFORM="firefox"' --comments all --compress=dead_code,keep_fnames,warnings=false --output $@ $<

build/chrome/src/%.js: src/%.js node_modules/.bin/uglifyjs
	@mkdir -p $(@D)
	uglifyjs --screw-ie8 --beautify --define 'PLATFORM="chrome"' --comments all --compress=dead_code,keep_fnames,warnings=false --output $@ $<

build/artifacts/ui-previewer-button.safariextension/src/%.js: src/%.js node_modules/.bin/uglifyjs
	@mkdir -p $(@D)
	uglifyjs --screw-ie8 --beautify --define 'PLATFORM="safari"' --comments all --compress=dead_code,keep_fnames,warnings=false --output $@ $<

build/firefox/icons/%.png: icons/%.png
	@mkdir -p $(@D)
	cp $< $@

build/chrome/icons/%.png: icons/%.png
	@mkdir -p $(@D)
	cp $< $@

build/artifacts/ui-previewer-button.safariextension/%.png: icons/%.png
	@mkdir -p $(@D)
	cp $< $@

build/%/options/index.html: src/options/index.html
	@mkdir -p $(@D)
	cp $< $@

build/%/options/icons.js: build/temp/icons.js
	@mkdir -p $(@D)
	cp $< $@

build/artifacts/ui-previewer-button.safariextension/src/global.html: src/global.html
	@mkdir -p $(@D)
	cp $< $@

build/temp/icons.js: $(wildcard icons/octicons/*.svg)
	@mkdir -p $(@D)
	./pack-icons.js $^ > $@

icons: sketchtool/bin/sketchtool icons/icon.sketch octicons-master
	cd icons; ../sketchtool/bin/sketchtool export artboards icon.sketch
	cp -R octicons-master/svg/ icons/octicons

octicons-master:
	curl -L --output octicons-master.zip -O https://github.com/github/octicons/archive/master.zip --silent
	unzip octicons-master.zip
	rm octicons-master.zip

sketchtool/bin/sketchtool:
	curl -L -O http://sketchtool.bohemiancoding.com/sketchtool-latest.zip --silent
	unzip sketchtool-latest.zip
	rm sketchtool-latest.zip

node_modules/.bin/uglifyjs:
	npm install

.PHONY: continuously icons safari clean clean-all
continuously:
	while true; do make -s; sleep 3; done

clean:
	rm -rf build/

clean-all: clean
	rm -rf node_modules
	rm -rf sketchtool
	rm -f icons/icon*.png
	rm -f icons/octicons
