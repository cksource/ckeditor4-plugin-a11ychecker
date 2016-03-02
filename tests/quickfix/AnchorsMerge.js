/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var AnchorsMerge,
			tests = {
				setUp: function() {
					AnchorsMerge = this.quickFixType;
				},

				'test AnchorsMerge.fix': function() {
					var playground = CKEDITOR.document.getById( 'subsequentAnchors' ),
						fixMockup = {
							issue: {
								element: playground.findOne( 'a' )
							},
							fix: AnchorsMerge.prototype.fix
						},
						callback = mocking.spy();

					fixMockup.fix( {}, callback );

					var anchors = playground.find( 'a' );
					assert.areSame( 2, anchors.count(), 'Anchors count after the fix' );
					assert.areSame( 'abc', anchors.getItem( 0 ).getHtml(),
						'First anchor inner HTML after the fix' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				},

				'test AnchorsMerge.fix anchors separated': function() {
					var playground = CKEDITOR.document.getById( 'separatedAnchors' ),
						fixMockup = {
							issue: {
								element: playground.findOne( 'a' )
							},
							fix: AnchorsMerge.prototype.fix
						},
						callback = mocking.spy();

					fixMockup.fix( {}, callback );

					var anchors = playground.find( 'a' );
					assert.areSame( 2, anchors.count(), 'Anchors count after the fix' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				},

				'test AnchorsMerge.fix anchors separated with whitespace': function() {
					var playground = CKEDITOR.document.getById( 'anchorsWithWhitespace' ),
						fixMockup = {
							issue: {
								element: playground.findOne( 'a' )
							},
							fix: AnchorsMerge.prototype.fix
						},
						callback = mocking.spy();

					fixMockup.fix( {}, callback );

					var anchors = playground.find( 'a' );
					assert.areSame( 1, anchors.count(), 'Anchors count after the fix' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				},

				'test AnchorsMerge.fix anchors separated with new line': function() {
					var playground = CKEDITOR.document.getById( 'anchorsWithNL' ),
						fixMockup = {
							issue: {
								element: playground.findOne( 'a' )
							},
							fix: AnchorsMerge.prototype.fix
						},
						callback = mocking.spy();

					fixMockup.fix( {}, callback );

					var anchors = playground.find( 'a' );
					assert.areSame( 1, anchors.count(), 'Anchors count after the fix' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				}
			};

		quickFixTest( 'AnchorsMerge', tests );
	} );
} )();
