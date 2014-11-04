CKEditor Accessibility Checker
==================================================

# Overview

This package contains Accessibility Checker distribution version.

## Requirements

* CKEditor **4.3.0** or later
* jQuery **1.x** in order to run [Quail](http://quailjs.org/)

## Installation

Distribution version of Accessibility Checker comes as a `a11ychecker.zip` file.

This archive contains following plugins, each in a separate directory:

* `a11ychecker` - The core Accessibility Checker providing all the essential components.
* `a11ycheckerquail` - Provides a Quail support for Accessibility Checker.
* `balloonpanel` - Provides a Graphical User Interface element used in plugin.

### Installation Steps

* Download `a11ychecker.zip` file to the `ckeditor/plugins` directory.
* Use "extract here" option on the archive, so that the directories are extracted directly into plugins directory.

That's it, at this point you can either open our sample from `a11ycheckerquail/dev/sample.html` and see how it works for you.

You can also add Accessibility Checker to any of your CKEditor instances by using `config.extraPlugins` property. Eg.

```javascript
config.extraPlugins = 'a11ycheckerquail';
```

**Keep in mind that Quail has a jQuery dependency.** It requires you to have a global variable `jQuery` containing jQuery 1.x. We ship our sample with jQuery, but we don't load it automatically with Accessibility Checker.

### Limitations

**Running on local filesystem:** you can't run Accessibility Checker on local filesystem, since Quail uses `XMLHttpRequest` for fetching its resources. This is not allowed while working with `file://` scheme.

# Where Do I Start?

You should use `plugins/a11ycheckerquail/dev/sample.html` sample to test the Accessibility Checker (eg. [ckeditor.dev](http://ckeditor.dev/plugins/a11ycheckerquail/dev/sample.html)).

Other samples will not work because of RequireJS dependency, which is not a part of standard CKEditor distribution.
