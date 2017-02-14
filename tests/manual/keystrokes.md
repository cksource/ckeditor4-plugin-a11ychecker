@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,list,link,format,image,table,floatingspace

# Custom Keystrokes

This test assigns custom keystrokes to AC commands.

Default keystrokes should be replaced with following:

```javascript
config.a11ychecker_keystrokes = {
	open: CKEDITOR.CTRL + CKEDITOR.ALT + 68, /*D*/
	next: CKEDITOR.CTRL + 68, /*D*/
	prev: CKEDITOR.CTRL + CKEDITOR.SHIFT + 68, /*D*/
	listen: CKEDITOR.SHIFT + 27, /*Esc*/
	close: 27 /*Esc*/
};
```