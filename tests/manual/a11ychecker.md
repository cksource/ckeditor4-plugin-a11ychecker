@bender-include: %TEST_DIR%../_assets/jquery.min.js
@bender-ui: collapsed
@bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo,wysiwygarea,clipboard,basicstyles,list,link,format,image,table,floatingspace,colorbutton,colordialog

Play around with Accessiblity Checker.

Some hints:

- Verify the position of popups. The pointy part of the popup should end at the border of the issue source element.
- As you scroll with balloon visible, it should scroll too, and should not get outside of the classic editor.
- When using quick fix confirm, that the described changes appear in the source.
- Check undo/redo integration.
- Instead of using "Quick fix", click on the issue source element to edit it manually. A popup should appear in the right-bottom
corner of the window.
- Ignore an issue, close the Accessibility Checker dialog and run AC again to find, if the issue is still ignored.
- Ensure that `esc` key closes the Accessiblity Checker balloon and puts selection on the issue source element.