/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/ViewerController', 'mocking' ], function( ViewerController, mocking ) {

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
				mockup.fire = mocking.spy();

				mockup.showIssue( getIssueMockup(), params );
				wait();
			}
		} );

		// Returns a mockup of a ViewerController instance.
		function getViewerControllerMockup() {
			var ret = {
				viewer: {
					panel:
						{
							attach: function() {
							}
						}
				},
				fire: function() {
				}
			};

			mocking.mockProperty( 'editor.window.once', ret, function() {
				// This is needed because of #51.
				return {
					removeListener: mocking.spy()
				};
			} );

			return ret;
		}

		// Returns a mockup of a Issue instance.
		function getIssueMockup() {
			return {
				element: {
					scrollIntoView: function() {
					}
				}
			};
		}
	} );
} )();
