@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,link,floatingspace,removeformat

# Process event

This test adds a totally custom checking rule to Accessibilty Checker.

1. Enable AC with toolbar button.

	## Expected

	AC finds "Prefer HTTPS links" and two "Avoid strongs" (custom) errors.

	## Unexpected

	AC finds no errors.

1. Close AC.
1. Select entire editor content.
1. Use remove formatting button.
1. Enable AC.

	## Expected

	AC does not report custom errors.

Repeat steps for the inline editor.