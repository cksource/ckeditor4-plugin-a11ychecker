/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'helpers/QuickFixTest', 'mocking' ], function( QuickFixTest, mocking ) {
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
				}
			};

		QuickFixTest( 'AnchorsMerge', tests );
	} );
} )();