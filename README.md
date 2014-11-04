CKEditor Accessibility Checker
==================================================

# Overview

This repository contains the development version of Accessibility checker plugin for CKEditor.

## Requirements

* CKEditor **4.3.0** or later
* jQuery **1.x** in order to run [Quail](http://quailjs.org/)

## Installation

### Development Version

If you're not interested in developing core Accessibility Checker features, feel free to skip this section.

```bash
 Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone -b dev git@github.com:cksource/ckeditor-plugin-a11ychecker.git a11ychecker
```

#### Checkout A11ychecker Quail Adapter

```bash
 Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone git@github.com:cksource/ckeditor-plugin-a11ycheckerquail.git a11ycheckerquail
```

#### Checkout balloon plugin

```bash
git clone git@github.com:cksource/ckeditor-plugin-balloonpanel.git balloonpanel
```

### Distribution Version

For more information about distribution version see [`DISTRIBUTION.md`](DISTRIBUTION.md) file.

## Where Do I Start?

You should use `plugins/a11ycheckerquail/dev/sample.html` sample to test the Accessibility Checker (eg. [ckeditor.dev](http://ckeditor.dev/plugins/a11ycheckerquail/dev/sample.html)).

Other samples will not work because of RequireJS dependency, which is not a part of standard CKEditor distribution.

## Tests Installation

Create a symbolic link

Linux:

```bash
ln -s $CKEDITOR_DEV_PATH/plugins/a11ychecker/tests/plugins/a11ychecker $CKEDITOR_DEV_PATH/tests/plugins/a11ychecker
```

Windows (run cli as administrator):

```bat
mklink /D "%CKEDITOR_DEV_PATH%/tests/plugins/a11ychecker" "%CKEDITOR_DEV_PATH%/plugins/a11ychecker/tests/plugins/a11ychecker"
```

## License

@todo
