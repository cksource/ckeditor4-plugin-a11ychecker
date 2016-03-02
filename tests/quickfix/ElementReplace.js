/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ElementReplace,
			tests = {
				setUp: function() {
					ElementReplace = this.quickFixType;
				},

				'test ElementReplace to h1': function() {
					var wrapper = CKEDITOR.document.findOne( '#withParagraph' ),
						elem = wrapper.findOne( 'p' ),
						innerSpan = wrapper.findOne( '#containedSpan' ),
						fixMockup = {
							getTargetName: mocking.stub().returns( 'h1' ),
							issue: {
								element: elem
							},
							fix: ElementReplace.prototype.fix
						},
						callback = mocking.spy(),
						newElement;

					fixMockup.fix( {}, callback );
					newElement = wrapper.findOne( 'h1' );

					assert.isNull( elem.getParent(), 'Initial element was removed (has no parent)' );

					assert.isInstanceOf( CKEDITOR.dom.element, newElement, 'Invalid object found for h1 selector' );
					assert.areSame( newElement, innerSpan.getParent(), 'Inner span#containedSpan was not moved to the new element' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					assert.isTrue( callback.alwaysCalledWith( fixMockup ), 'Callback has QuickFix object as a first parameter' );
				},

				'test ElementReplace to div': function() {
					var wrapper = CKEDITOR.document.findOne( '#divConversion' ),
						fixMockup = {
							getTargetName: mocking.stub().returns( 'div' ),
							issue: {
								element: wrapper.findOne( 'p' )
							},
							fix: ElementReplace.prototype.fix
						};

					fixMockup.fix( {}, mocking.spy() );

					assert.areSame( 1, wrapper.find( 'div' ).count(), 'Div element created' );
				},

				'test ElementReplace position': function() {
					var wrapper = CKEDITOR.document.findOne( '#replacePosition' ),
						fixMockup = {
							getTargetName: mocking.stub().returns( 'h1' ),
							issue: {
								element: wrapper.findOne( 'p' )
							},
							fix: ElementReplace.prototype.fix
						},
						newElem;

					fixMockup.fix( {}, mocking.spy() );

					newElem = wrapper.findOne( 'h1' );

					assert.isNotNull( newElem, 'Element not found' );
					assert.areSame( 3, newElem.getIndex() );
				}
			};
		quickFixTest( 'ElementReplace', tests );
	} );
} )();
