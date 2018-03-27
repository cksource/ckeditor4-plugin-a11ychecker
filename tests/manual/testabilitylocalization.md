@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-tags: bug, 233
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,link,floatingspace,elementspath

# Testability localization

This AC instance uses German localization.

1. Focus the classic editor.
2. Enable Accessibility Checker.

	## Expected

	Error level issue is found. It's marked in the balloon by applying red background behind "Problem x von y" string.

	## Unexpected

	No color differentiation is visible.

3. Go to next accessibility issue (e.g. by next arrow).

	## Expected

	Warning level issue is found. It's marked in the balloon by applying yellow background behind "Problem x von y" string.

	## Unexpected

	No color differentiation is visible.

4. Go to next accessibility issue (e.g. by next arrow).

	## Expected

	Notice level issue is found. It's marked in the balloon by applying red background behind "Problem x von y" string.

	## Unexpected

	No color differentiation is visible.

5. Repeat above steps with the inline editor.