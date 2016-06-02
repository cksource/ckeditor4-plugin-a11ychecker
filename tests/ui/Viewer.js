/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-ckeditor-plugins: a11ychecker,toolbar,undo */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/Viewer', 'ui/ViewerDescription', 'mocking', 'EngineMock', 'testSuite', 'helpers/keyEvent' ], function( Viewer, ViewerDescription, mocking, EngineMock, testSuite, keyEvent ) {
		testSuite.useEngine( EngineMock );

		bender.editors = {
			classic: {
				name: 'editor1',
				startupData: '<p>foo</p>'
			},
			inline: {
				name: 'editor2',
				creator: 'inline',
				startupData: '<p>foo</p>'
			}
		};

		var tests = {
			tearDown: function() {
				// For each test a11ychecker needs to be closed.
				// Note that we have 2 editor instances, but only 1 can be enabled at
				// a time.
				function cleanupAC( editor ) {
					var a11ychecker = editor._.a11ychecker;

					if ( a11ychecker.issues && a11ychecker.issues.getFocused() ) {
						// @todo: it might be worth to investigate what's causing wrong selection if we won't call resetFocus().
						a11ychecker.issues.resetFocus();
					}

					a11ychecker.close();
				}

				cleanupAC( this.editors.classic );
				cleanupAC( this.editors.inline );
			},

			'test Viewer.setupDescription': function() {
				var mock = {
						setupDescription: Viewer.prototype.setupDescription
					},
					a11ycheckerLang = {},
					appendMock = mocking.spy();

				// Set the editor with a lang property.
				mocking.mockProperty( 'editor.lang.a11ychecker', mock, a11ycheckerLang );
				mocking.mockProperty( 'panel.parts.content.append', mock, appendMock );
				mocking.mockProperty( 'panel.registerFocusable', mock );

				mock.setupDescription();

				// Ensure that description object was created.
				assert.isInstanceOf( ViewerDescription, mock.description, 'description property type' );
				assert.areSame( a11ycheckerLang, mock.description.lang, 'description.lang inited properly' );

				// Ensure that append method was called for elem in panel.parts.
				assert.areSame( 1, appendMock.callCount, 'panel.parts.content.append call count' );
				mocking.assert.alwaysCalledWith( appendMock, mock.description.parts.wrapper );
			},
			'test Viewer close with hotkey': function( editor ) {
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					closeButton = viewer.panel.parts.close;

				viewer.panel.blur = mocking.spy();
				viewer.panel.hide = mocking.spy();

				a11ychecker.exec();

				closeButton.fire( 'keydown', keyEvent.getKeyEvent( 32 ) );

				assert.isTrue( viewer.panel.blur.called );
				assert.isTrue( viewer.panel.hide.called );
			}
		};

		testSuite.testEditors( bender.editors, tests );
	} );
} )();
