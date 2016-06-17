/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var AttributeRenameDefault,
			tests = {
				setUp: function() {
					AttributeRenameDefault = this.quickFixType;
				},

				'test AttributeRenameDefault.getProposedValue no alt': function() {
					var element = CKEDITOR.dom.element.createFromHtml( '<img title="bb" />' ),
						fixMockup = this._getIssueMockup( element );

					assert.areSame( 'bb', AttributeRenameDefault.prototype.getProposedValue.call( fixMockup ),
						'Invalid return value' );
				},

				'test AttributeRenameDefault.getProposedValue alt and title present': function() {
					var element = CKEDITOR.dom.element.createFromHtml( '<img alt="aa" title="bb" />' ),
						fixMockup = this._getIssueMockup( element );

					assert.areSame( 'aa', AttributeRenameDefault.prototype.getProposedValue.call( fixMockup ),
						'Invalid return value' );
				},

				_getIssueMockup: function( element ) {
					return {
						issue: {
							element: element
						},
						attributeTargetName: 'alt',
						attributeName: 'title'
					};
				}
			};

		quickFixTest( 'AttributeRenameDefault', tests );
	} );
} )();
