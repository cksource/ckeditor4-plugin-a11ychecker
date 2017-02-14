@bender-tags: tc, 1.1.1, 237
@bender-include: %TEST_DIR%../../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,basicstyles,format,floatingspace,colorbutton,colordialog

# colorFontContrast

1. Focus the first editor.
1. Click on the "Check Accessibility" button.

## Expected

* Accessibility Checker finds an error about font having an insufficient contrast ratio.
* Accessibility Checker reports **2** above errors.

Repeat steps for the second editor.