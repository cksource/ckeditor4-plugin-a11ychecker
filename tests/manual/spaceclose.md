@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,toolbar,wysiwygarea,undo,image,floatingspace

1. Open Accesibility Checker.
2. Focus the close button ("X") by pressing `Shift+Tab` twice.
3. Press space.
	* Accesibility Checker should close entirely and the editor should gain focus.

Repeat for Esc or Enter key instead of space and also on the inline editor.
