CKEditor Accessibility checker
==================================================

## Overview

This repository contains the development version of Accessibility checker plugin for CKEditor.

### Requirements

* CKEditor **4.3.0** or later

### Installation

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path
cd $CKEDITOR_DEV_PATH/plugins
git clone -b dev git@github.com:cksource/ckeditor-a11ychecker.git a11ychecker
```

#### Checkout balloon plugin

```bash
git clone -b classRefact git@github.com:cksource/ckeditor-plugin-balloonpanel.git balloonpanel
```

### Where do I start?

You should use `plugins/a11ychecker/dev/sample.html` sample to test the Accessibility Checker (eg. [ckeditor.dev](http://ckeditor.dev/plugins/a11ychecker/dev/sample.html)).

Other samples will not work because of RequireJS dependency, which is not a part of standard CKEditor distribution.

### Tests installation

Create a symbolic link

Linux:

```bash
ln -s $CKEDITOR_DEV_PATH/plugins/a11ychecker/tests/plugins/a11ychecker $CKEDITOR_DEV_PATH/tests/plugins/a11ychecker
```

Windows (run cli as administrator):

```bat
mklink /D "%CKEDITOR_DEV_PATH%/tests/plugins/a11ychecker" "%CKEDITOR_DEV_PATH%/plugins/a11ychecker/tests/plugins/a11ychecker"
```

### License

@todo
