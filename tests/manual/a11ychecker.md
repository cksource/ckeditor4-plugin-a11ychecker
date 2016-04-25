@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,list,link,format,image,table

Check for accessibility issues.

- When using quick fix confirm, that the described changes appear in the source.
- At least once instead of using "quick fix" click on the offending piece of text and edit it manually.
A popup should appear in the right-bottom corner of the window.
- Check undo/redo integration.
- Ignore an issue, close the Accessibility Checker dialog and run AC again to find, if the issue is still ignored.
- Verify the position of popups. The pointy part of the popup should end at the border of the offending element.
