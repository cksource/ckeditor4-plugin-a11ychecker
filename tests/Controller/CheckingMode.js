/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */

( function() {
	'use strict';

	bender.require( [ 'Controller', 'Controller/CheckingMode', 'mocking' ], function( Controller, CheckingMode, mocking ) {
		bender.test( {
			setUp: function() {
				this.controller = {
					editableDecorator: {
						markIssues: mocking.spy(),
						removeMarkup: mocking.spy()
					}
				};

				mocking.mockProperty( 'issues.resetFocus', this.controller );
				mocking.mockProperty( 'viewerController.viewer.panel.hide', this.controller );
				mocking.mockProperty( 'editor.fire', this.controller );

				this.mock = new CheckingMode( this.controller );
			},

			'test init': function() {
				var editableDecorator = this.controller.editableDecorator;

				if ( CKEDITOR.env.chrome ) {
					// A patch needed for chrome workaround introduced in #39.
					mocking.mockProperty( 'editor.getSelection', this.controller, mocking.spy( function() {
						return {
							createBookmarks: mocking.spy()
						};
					} ) );
				}

				this.mock.init();

				assert.areEqual( 1, editableDecorator.markIssues.callCount,
					'editableDecorator.markIssues call count' );
			},

			'test close': function() {
				var editableDecorator = this.controller.editableDecorator;

				this.mock.close();

				assert.areEqual( 1, editableDecorator.removeMarkup.callCount,
					'editableDecorator.removeMarkup call count' );
				assert.areEqual( 1, this.controller.viewerController.viewer.panel.hide.callCount,
					'viewerController.hide() call count' );
				assert.areEqual( 1, this.controller.issues.resetFocus.callCount,
					'issues.resetFocus() call count' );
			}
		} );

	} );
} )();
