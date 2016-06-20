/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var AttributeRename,
			tests = {
				setUp: function() {
					AttributeRename = this.quickFixType;
				},

				'test AttributeRename.fix': function() {
					var element = CKEDITOR.dom.element.createFromHtml( '<img title="aa" />' ),
						issueMockup = {
							element: element
						},
						fixMockup = new AttributeRename( issueMockup ),
						callback = mocking.spy();

					fixMockup.fix( {
						value: 'aa'
					}, callback );

					assert.areSame( 'aa', element.getAttribute( 'alt' ), 'Target attribtue value' );
					assert.isFalse( element.hasAttribute( 'title' ), 'Old attribute removed' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				},

				'test AttributeRename.fix existing attr': function() {
					// Ensure that no problem occurs if given attribute already exists.
					var element = CKEDITOR.dom.element.createFromHtml( '<img title="aa" alt="bb" />' ),
						issueMockup = {
							element: element
						},
						fixMockup = new AttributeRename( issueMockup ),
						callback = mocking.spy();

					fixMockup.fix( {
						value: 'aa'
					}, callback );

					assert.areSame( 'aa', element.getAttribute( 'alt' ), 'Target attribtue value' );
				},

				'test attribute override': function() {
					// Ensure that attribute names are not hardcoded.
					var element = CKEDITOR.dom.element.createFromHtml( '<img foo="a" />' ),
						issueMockup = {
							element: element
						},
						fixMockup = new AttributeRename( issueMockup ),
						callback = mocking.spy();

					fixMockup.attributeName = 'foo';
					fixMockup.attributeTargetName = 'bar';

					fixMockup.fix( {
						value: 'a'
					}, callback );

					assert.areSame( 'a', element.getAttribute( 'bar' ), 'Target attribtue value' );
					assert.isFalse( element.hasAttribute( 'foo' ), 'Old attribute removed' );
				},

				'test adds field to form': function() {
					// Ensure that this type adds a field to form.
					var fixMockup = {
							getProposedValue: mocking.stub().returns( 'foo' )
						},
						formMock = {
							setInputs: mocking.spy()
						},
						expectedInputs = {
							value: {
								type: 'text',
								label: 'Value',
								value: 'foo'
							}
						};

					AttributeRename.prototype.display.call( fixMockup, formMock );

					mocking.assert.calledWith( formMock.setInputs, expectedInputs );
					assert.areSame( 1, fixMockup.getProposedValue.callCount, 'getProposedValue call count' );
				}
			};

		quickFixTest( 'AttributeRename', tests );
	} );
} )();
