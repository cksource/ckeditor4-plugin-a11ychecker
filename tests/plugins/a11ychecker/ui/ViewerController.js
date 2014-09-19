/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerController', 'helpers/sinon/sinon_amd.min' ], function( ViewerController, sinon ) {

		bender.test( {
			'test ViewerController.showIssue calls callback': function() {
				var mockup = getViewerControllerMockup(),
					params = {
						callback: function() {
							var that = this;
							resume( function() {
								// Callback was called, so it's fine.
								assert.areSame( that, mockup, 'ViewerController object is given as a this obj' );
							} );
						}
					};

				mockup.showIssue = ViewerController.prototype.showIssue;

				mockup.showIssue( getIssueMockup(), params );
				wait();
			},

			'test ViewerController.showIssue fires event': function() {
				// Ensure that event is fired after calling showIssue() with
				// param.event.
				var mockup = getViewerControllerMockup(),
					params = {
						event: 'foo',
						callback: function() {
							resume( function() {
								assert.areSame( 1, mockup.fire.callCount, 'mockup.fire() call count' );
								arrayAssert.itemsAreSame( [ 'foo' ], mockup.fire.args[ 0 ], 'mockup.fire() params' );
							} );
						}
					};

				mockup.showIssue = ViewerController.prototype.showIssue;
				mockup.fire = sinon.spy();

				mockup.showIssue( getIssueMockup(), params );
				wait();
			}
		} );

		// Returns a mockup of a ViewerController instance.
		function getViewerControllerMockup() {
			return {
				viewer: {
					panel:
						{
							attach: function() {}
						}
				},
				fire: function(){}
			};
		}

		// Returns a mockup of a Issue instance.
		function getIssueMockup() {
			return {
				element: {
					scrollIntoView: function(){}
				}
			};
		}
	} );
} )();