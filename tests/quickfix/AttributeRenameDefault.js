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

				'test AttributeRenameDefault.display no alt': function() {
					var element = CKEDITOR.dom.element.createFromHtml( '<img title="aa" />' ),
						issueMockup = {
							element: element
						},
						formMock = {
							setInputs: function( value ) {
								this.value = value;
							}
						},
						fix = new AttributeRenameDefault( issueMockup );

					fix.display( formMock );

					assert.areEqual( 'aa', formMock.value.value.value );
				},

				'test AttributeRenameDefault.display alt': function() {
					var element = CKEDITOR.dom.element.createFromHtml( '<img alt="aa" title="bb" />' ),
						issueMockup = {
							element: element
						},
						formMock = {
							setInputs: function( value ) {
								this.value = value;
							}
						},
						fix = new AttributeRenameDefault( issueMockup );

					fix.display( formMock );

					assert.areEqual( 'aa', formMock.value.value.value );
				}
			};

		quickFixTest( 'AttributeRenameDefault', tests );
	} );
} )();
