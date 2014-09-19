/* bender-tags: a11ychecker,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	bender.editor = {
		config: {
			a11ychecker_engine: 'EngineMock'
		},
		startupData: '<p>foo</p>'
	};

	// Note that we have an extra (unused) requirement for 'EngineMock' and 'Controller' classes.
	// That way it will force them to be available for the editor, and we have sure that a11ychecker
	// plugin will be ready synchronously.
	require( [ 'ui/ViewerController', 'EngineMock', 'Controller', 'ui/ViewerController' ], function( ViewerController ) {

		bender.test( {
			'test initial focus': function() {
				var a11ychecker = this.editor._.a11ychecker;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				assert.isTrue( true );
			},

			'test next focus': function() {
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				a11ychecker.next( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();

						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( viewer.navigation.parts.next, activeElement, 'The "Next" button is focused' );
					} );
				} );

				wait();
			},

			'test prev focus': function() {
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				a11ychecker.prev( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();

						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( viewer.navigation.parts.previous, activeElement, 'The "Previous" button is focused' );
					} );
				} );

				wait();
			},

			'test navigation select change focus': function() {
				// After changing the navigation in the select, navigation should not be lost.
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.list;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );

				// Fake the value change.
				viewer.navigation.fire( 'change', 1 );

				window.setTimeout( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();
						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( expectedFocusElem, activeElement, 'The issue list is focused' );
					} );
				}, 300 );

				wait();
			}
		} );
	} );
} )();