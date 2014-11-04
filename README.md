CKEditor Accessibility checker
==================================================

## Overview

This repository contains the development version of Accessibility checker plugin for CKEditor.

### Requirements

* CKEditor **4.3.0** or later

### Installation

#### Distribution Version

Distribution version of Accessibility Checker comes as a `a11ychecker.zip` file.

This archive contains following plugins, each in a separate directory:

* `a11ychecker` - The core Accessibility Checker providing all the essential components.
* `a11ycheckerquail` - Provides a Quail support for Accessibility Checker.
* `balloonpanel` - Provides a Graphical User Interface element used in plugin.

##### Installation Steps

* Download `a11ychecker.zip` file to the `ckeditor/plugins` directory.
* Use "extract here" option on the archive, so that the directories are extracted directly into plugins directory.

That's it, at this point you can either open our sample from `a11ycheckerquail/dev/sample.html` and see how it works for you.

You can also add Accessibility Checker to any of your CKEditor instances by using `config.extraPlugins` property. Eg.

```javascript
config.extraPlugins = 'a11ycheckerquail';
```

**Keep in mind that Quail has a jQuery dependency.** It requires you to have a global variable `jQuery` containing jQuery 1.x. We ship our sample with jQuery, but we don't load it automatically with Accessibility Checker.

##### Limitations

**Running on local filesystem:** you can't run Accessibility Checker on local filesystem, since Quail uses `XMLHttpRequest` for fetching its resources. This is not allowed while working with `file://` scheme.

#### Development Version

If you're not interested in developing core Accessibility Checker features, feel free to skip this section.

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone -b dev git@github.com:cksource/ckeditor-plugin-a11ychecker.git a11ychecker
```

##### Checkout A11ychecker Quail Adapter

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path.
cd $CKEDITOR_DEV_PATH/plugins
git clone git@github.com:cksource/ckeditor-plugin-a11ycheckerquail.git a11ycheckerquail
```

##### Checkout balloon plugin

```bash
git clone git@github.com:cksource/ckeditor-plugin-balloonpanel.git balloonpanel
```

### Where Do I Start?

You should use `plugins/a11ycheckerquail/dev/sample.html` sample to test the Accessibility Checker (eg. [ckeditor.dev](http://ckeditor.dev/plugins/a11ycheckerquail/dev/sample.html)).

Other samples will not work because of RequireJS dependency, which is not a part of standard CKEditor distribution.

### Tests Installation

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
