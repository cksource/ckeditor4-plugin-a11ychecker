CKEditor Accessibility Checker
==============================

# Overview

This repository contains the development version of the Accessibility Checker Plugin for CKEditor.

## Requirements

* CKEditor **4.3.0** or later.
* jQuery **1.x** in order to run [Quail](http://quailjs.org/).

## Installation

### Development Version

If you are not interested in developing core Accessibility Checker features, feel free to skip this section.

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone -b dev git@github.com:cksource/ckeditor-plugin-a11ychecker.git a11ychecker
```

#### Checkout the Balloon Plugin

```bash
git clone git@github.com:cksource/ckeditor-plugin-balloonpanel.git balloonpanel
```

#### Building Extra Stuff

You will also need to build the CSS, since we use LESS.

```bash
npm install
grunt build-css
```

**Pro tip:** You can also use `grunt watch:less`.

### Distribution Version

For more information about the distribution version see the [`DISTRIBUTION.md`](DISTRIBUTION.md) file.

### Building a Distribution Version

You can build a distribution package using [Grunt](http://gruntjs.com/).

Main changes in the distribution version:

* It does not use RequireJS, so all classes are inlined.
* It contains the `CKEDITOR.plugins.a11ychecker.rev` property with a revision hash.
* Quick-fixes are minified.
* It will automatically create a `zip` archive so that you can share it without publishing the code in a public repository.

To build Accessibility Checker go to the `a11ychecker` plugin directory and execute the following commands:

```bash
npm install
grunt build
```

Build files are put in the `build` directory of the `a11ychecker` plugin directory.

#### Building a Full Distribution

Since Accessibility Checker actually has a few dependencies, you might want to include all the dependent plugins just to make the installation process easier.

A `build-full` feature is available for this purpose. It will include dependent plugins in the `build` directory and create a `zip` archive.

```bash
npm install
grunt build-full
```

Another person might now simply get the `zip`, extract it to the `ckeditor/plugins` directory and everything is ready to go.

#### Including Different Quail Config

You might want to change default Quail guidelines config. Doing so, might have some benefit, in particular your AC distribution users won't need edit **config.js** on their own after your releases. You can do that by adding an extra CLI `--quail-config="foo.json"` parameter to the build command. It should point a JSON file that contains an array of strings. E.g.

```json
[
	"aAdjacentWithSameResourceShouldBeCombined",
	"documentVisualListsAreMarkedUp",
	"headerH1",
	"headerH2",
	"headerH3",
	"imgAltIsTooLong",
	"pNotUsedAsHeader"
]
```

Then you might include it into a build with:

```
grunt build-full --quail-config="_local/custom.json"
```

## Where Do I Start?

You should use the `plugins/a11ychecker/samples/index.html` sample to test Accessibility Checker (eg. [ckeditor.dev](http://ckeditor.dev/plugins/a11ychecker/samples/index.html)).

Other samples will not work because of the RequireJS dependency, which is not a part of the standard CKEditor distribution.

## Unit Testing

Accessibility Checker comes with custom `bender.js` configuration, because it requires some custom Bender plugins that CKEditor does not need. You should use `-c` CLI parameter to point the custom config file.

```bender server run -H 0.0.0.0 -c plugins/a11ychecker/bender.js```

Both unit tests and integration tests are placed in the `tests` directory.

## License

Copyright (c) 2015 CKSource - Frederico Knabben. All rights reserved.<br>
Licensed under the terms of the open source [GPL license](http://www.gnu.org/licenses/gpl-2.0.html).

See LICENSE.md for more information.
