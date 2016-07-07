CKEditor Accessibility Checker
==============================

# Overview

This repository contains the development version of the Accessibility Checker Plugin for CKEditor.

## Requirements

* CKEditor **4.3.0** or later.
* jQuery **1.x** or later in order to run [Quail](http://quailjs.org/).

## Browser Support

Accessibility Checker has [the same browser compatibility as CKEditor](http://docs.ckeditor.com/#!/guide/dev_browsers), with the following exceptions:

* Internet Explorer 8 is not supported.
* Internet Explorer 9 Quirks Mode is not supported.

## Installation

### Development Version

If you are not interested in developing core Accessibility Checker features, feel free to skip this section.

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone git@github.com:cksource/ckeditor-plugin-a11ychecker.git a11ychecker
```

#### Checkout the Balloon Plugin

```bash
git clone git@github.com:cksource/ckeditor-plugin-balloonpanel.git balloonpanel
```

#### Dependencies

##### Building CSS

You will also need to build the CSS, since we use LESS.

```bash
npm install
grunt build-css
```

**Pro tip:** You can also use `grunt watch:less`.

##### RequireJS

Note that developer version requires RequireJS, so make sure you have it loaded.

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

#### Including a Different Quail Configuration

You might want to change the default Quail guidelines configuration. Doing so might have some benefits. For example, the users of your Accessibility Checker distribution will not need to edit the ``config.js`` on their own after your releases. You can do that by adding an extra `--quail-config="foo.json"` CLI parameter to the build command. It should point to a JSON file that contains an array of strings. For example:

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

Then you might include it in the build with:

```
grunt build-full --quail-config="_local/custom.json"
```

#### Including a Different Quail Build

You can actually use a totally different custom Quail build. To do that, provide a path to your custom Quail build using the `--quail` option.

For example:

``bash
grunt build-full --quail=/libs/js/customQuailBuild`
``

## Where Do I Start?

Run Bender as described in [Unit Testing](#unit-testing) and open the [manual test](http://tests.ckeditor.dev:1030/plugins/a11ychecker/tests/manual/a11ychecker).

## Unit Testing

Accessibility Checker comes with custom `bender.js` configuration, because it requires some custom Bender plugins that CKEditor does not need. You should use the `-c` CLI parameter to point to the custom configuration file.

```bender server run -H 0.0.0.0 -c plugins/a11ychecker/bender.js```

Both unit tests and integration tests are placed in the `tests` directory.

## License

Copyright (c) 2014-2016 CKSource - Frederico Knabben. All rights reserved.<br>
Licensed under the terms of the [GNU General Public License Version 2 or later (the "GPL")](http://www.gnu.org/licenses/gpl.html).

See LICENSE.md for more information.
