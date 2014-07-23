CKEditor Accessibility checker
==================================================

## Overview

This repository contains the development version of Accessibility checker plugin for CKEditor.

### Installation

```bash
# Assuming that $CKEDITOR_DEV_PATH is your CKEditor path
cd $CKEDITOR_DEV_PATH/plugins
git clone git@github.com:cksource/ckeditor-a11ychecker.git a11ychecker
cd a11ychecker
bower install
# quail needs some manual attention
cd bower_components/quail
npm install
grunt build
```

### License

@todo
