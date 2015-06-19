/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
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
				var pluginMock = this._getPluginMock(),
					editorMock = this._getEditorMock();

				pluginMock.beforeInit( editorMock );

				assert.areSame( 1, pluginMock.commandRegister.callCount, 'commandRegister() is called' );
				assert.areSame( 1, pluginMock.guiRegister.callCount, 'guiRegister() is called' );
				assert.areSame( 1, pluginMock.createTemporaryNamespace.callCount, 'createTemporaryNamespace() is called' );
			},

			'test QuickFix namespace fires event': function() {
				var staticEventFire = sinon.stub( CKEDITOR.plugins.a11ychecker, 'fire' ),
					pluginMock = this._getPluginMock(),
					// We'll replace quickFixRepo with a undefined value.
					initQuickFix = CKEDITOR.plugins.a11ychecker.quickFixes,
					replacedmentQuickFix = {},
					requireMock = sinon.stub( window, 'require', function( deps, fn ) {
						fn( sinon.stub().returns( replacedmentQuickFix ) );
					} );

				CKEDITOR.plugins.a11ychecker.quickFixes = undefined;
				pluginMock.initQuickFixRepo = bender.editor.plugins.a11ychecker.initQuickFixRepo;

				pluginMock.initQuickFixRepo();

				// Return original values.
				CKEDITOR.plugins.a11ychecker.quickFixes = initQuickFix;
				staticEventFire.restore();
				requireMock.restore();

				assert.areSame( 1, staticEventFire.callCount, 'CKEDITOR.plugins.a11ychecker.fire call count' );
				sinon.assert.calledWith( staticEventFire, 'quickFixesReady' );
			},

			'test QuickFix does not fire event if repo is loaded': function() {
				var staticEventFire = sinon.stub( CKEDITOR.plugins.a11ychecker, 'fire' ),
					pluginMock = this._getPluginMock(),
					// We'll replace quickFixRepo with a undefined value.
					initQuickFix = CKEDITOR.plugins.a11ychecker.quickFixes,
					replacedmentQuickFix = {},
					requireMock = sinon.stub( window, 'require', function( deps, fn ) {
						fn( sinon.stub().returns( replacedmentQuickFix ) );
					} );

				// Lets pretend repo is already there.
				CKEDITOR.plugins.a11ychecker.quickFixes = {};
				pluginMock.initQuickFixRepo = bender.editor.plugins.a11ychecker.initQuickFixRepo;

				pluginMock.initQuickFixRepo();

				// Return original values.
				CKEDITOR.plugins.a11ychecker.quickFixes = initQuickFix;
				staticEventFire.restore();
				requireMock.restore();

				assert.areSame( 0, staticEventFire.callCount, 'CKEDITOR.plugins.a11ychecker.fire call count' );
			},

			_getPluginMock: function() {
				return {
					commandRegister: mocking.spy(),
					guiRegister: mocking.spy(),
					beforeInit: bender.editor.plugins.a11ychecker.beforeInit,
					createTemporaryNamespace: mocking.spy(),
					initQuickFixRepo: mocking.spy()
				};
			},

			_getEditorMock: function() {
				return {
					once: mocking.spy(),
					config: {
						a11ychecker_noIgnoreData: true
					}
				};
			}
		} );
	} );
} )();