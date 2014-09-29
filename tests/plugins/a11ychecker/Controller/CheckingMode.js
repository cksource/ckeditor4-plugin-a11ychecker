/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'Controller', 'Controller/CheckingMode', 'helpers/sinon/sinon_amd.min' ], function( Controller, CheckingMode, sinon ) {
		bender.test( {
			setUp: function() {
				this.controller = {
					editableDecorator: {
						markIssues: sinon.spy(),
						removeMarkup: sinon.spy()
					},
					viewerController: {
						hide: sinon.spy()
					},
					issues: {
						resetFocus: sinon.spy()
					}
				};

				this.mock = new CheckingMode( this.controller );
			},

			'test init': function() {
				var editableDecorator = this.controller.editableDecorator;

				this.mock.init();

				assert.areEqual( 1, editableDecorator.markIssues.callCount,
					'editableDecorator.markIssues call count' );
			},

			'test close': function() {
				var editableDecorator = this.controller.editableDecorator;

				this.mock.close();

				assert.areEqual( 1, editableDecorator.removeMarkup.callCount,
					'editableDecorator.removeMarkup call count' );
				assert.areEqual( 1, this.controller.viewerController.hide.callCount,
					'viewerController.hide() call count' );
				assert.areEqual( 1, this.controller.issues.resetFocus.callCount,
					'issues.resetFocus() call count' );
			}
		} );

	} );
} )();