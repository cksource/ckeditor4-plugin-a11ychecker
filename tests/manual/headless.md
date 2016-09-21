@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,list,link,format,image,table,floatingspace

## Headless testing

Pressing "Check accessibility" button will update "Save" button next to it. Pressing the button should not cause any AC UI to appear.

### Counting issues

1. Press "Check accessibility" button.
	* After a moment (async) next button's text should be updated to "Save (disabled, 3 issues remaining)".
	* No user interface should appear.

### No issues

1. Focus editor editable.
1. Select all text and remove the content.
1. Press "Check accessibility" button.
	* After a moment (async) next button's text should be updated to "Save".
	* No user interface should appear.