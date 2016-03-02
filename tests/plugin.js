/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker */
/* bender-include: %TEST_DIR%_assets/jquery.min.js */

( function() {
	'use strict';

	bender.editor = {};

	bender.require( [ 'mocking' ], function( mocking ) {
		bender.test( {
			'test beforeInit synchronous methods': function() {
				// This test ensures that some of the methods are called synchronously,
				// otherwise weird things happen! (#50)
				var pluginMock = {
						commandRegister: mocking.spy(),
						guiRegister: mocking.spy(),
						beforeInit: bender.editor.plugins.a11ychecker.beforeInit,
						createTemporaryNamespace: mocking.spy()
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
				assert.areSame( 1, pluginMock.createTemporaryNamespace.callCount, 'createTemporaryNamespace() is called' );
			}
		} );
	} );
} )();