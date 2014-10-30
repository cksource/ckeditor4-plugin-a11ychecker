/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	bender.editor = {};

	require( [ 'mocking' ], function( mocking ) {
		bender.test( {
			'test beforeInit synchronous methos': function() {
				// This test ensures that some of the methods are called synchronously,
				// otherwise weird things happen! (#50)
				var pluginMock = {
						commandRegister: mocking.spy(),
						guiRegister: mocking.spy(),
						beforeInit: bender.editor.plugins.a11ychecker.beforeInit
					},
					editorMock = {
						once: mocking.spy(),
						config: {
							a11ychecker_noIgnoreData: true
						}
					};

				pluginMock.beforeInit( editorMock );

				assert.areSame( 1, pluginMock.commandRegister.callCount, 'commandRegister() is called' );
				assert.areSame( 1, pluginMock.guiRegister.callCount, 'guiRegister() is called' );
			}
		} );
	} );
} )();