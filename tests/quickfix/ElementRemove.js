/**
 * @license Copyright (c) 2014-2015, CKSource - Frederico Knabben. All rights reserved.
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ElementRemove,
			tests = {
				setUp: function() {
					ElementRemove = this.quickFixType;
				},

				'test ElementRemove.fix': function() {
					var imgElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
						fixMockup = {
							issue: {
								element: imgElement
							},
							fix: ElementRemove.prototype.fix
						},
						callback = mocking.spy();

					CKEDITOR.document.getBody().append( imgElement, callback );

					fixMockup.fix( {}, callback );

					assert.isNull( imgElement.getParent(), 'Element has no parent' );
					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					assert.isTrue( callback.alwaysCalledWith( fixMockup ), 'Callback has QuickFix object as a first parameter' );
				}
			};
		quickFixTest( 'ElementRemove', tests );
	} );
} )();