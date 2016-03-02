/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/ViewerNavigation', 'mocking' ], function( ViewerNavigation, mocking ) {
		bender.test( {
			'test ViewerNavigation.update': function() {
				// Checks if ViewerNavigation.update calls setText on counter elemnt.
				// First we need to mock a counter template.
				var template = {
						output: mocking.spy( function() {
							return 'foobarbaz';
						} )
					},
					mock = {
						update: ViewerNavigation.prototype.update,
						lang: {
							testability: {
								0.5: 'foo'
							}
						},
						parts: {
							wrapper: CKEDITOR.dom.element.createFromHtml( '<div/>' )
						}
					},
					counterSetText = mocking.mockProperty( 'parts.counter.setText', mock );

				mocking.mockProperty( 'templates.counterText', mock, template );

				mock.update( 2, 10, 0.5 );
				// Note that 2 should be increased to 3, since it's assumed to be 0-based.
				assert.areSame( 1, template.output.callCount, 'template.output call count' );
				mocking.assert.calledWith( template.output, {
					current: 3,
					total: 10,
					testability: 'foo'
				} );

				// Ensure that wrapper.setText was called.
				mocking.assert.calledWith( counterSetText, 'foobarbaz' );
			}
		} );
	} );
} )();
