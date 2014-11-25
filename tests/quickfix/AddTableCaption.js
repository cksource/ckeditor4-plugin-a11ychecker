/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'helpers/QuickFixTest', 'mocking' ], function( QuickFixTest, mocking ) {
		var AddTableCaption,
			tests = {
				setUp: function() {
					AddTableCaption = this.quickFixType;
				},

				'test AddTableCaption.fix': function() {
					var element = CKEDITOR.document.getById( 'sampleTable' ),
						issueMockup = {
							element: element
						},
						fixMockup = new AddTableCaption( issueMockup ),
						callback = mocking.spy();

					fixMockup.fix( {
						caption: 'New Caption'
					}, callback );

					var captions = element.find( 'caption' );

					assert.areSame( 1, captions.count(), 'Caption element count in table' );
					assert.areSame( 'New Caption', captions.getItem( 0 ).getHtml(),
						'Caption element inner HTML' );

					// Ensure that it's the first child.
					assert.isTrue( element.getFirst().equals( captions.getItem( 0 ) ),
						'Caption is a first child' );

					// Checking the callback.
					assert.areSame( 1, callback.callCount, 'Callback was called' );
					mocking.assert.alwaysCalledWith( callback, fixMockup );
				},

				'test adds field to form': function() {
					// Ensure that this type adds a field to form.
					var fixMockup = {
							lang: {
								captionLabel: 'Caption'
							}
						},
						formMock = {
							setInputs: mocking.spy()
						},
						expectedInputs = {
							caption: {
								type: 'text',
								label: 'Caption'
							}
						};

					AddTableCaption.prototype.display.call( fixMockup, formMock );

					mocking.assert.calledWith( formMock.setInputs, expectedInputs );
					assert.isTrue( true );
				}
			};

		QuickFixTest( 'AddTableCaption', tests );
	} );
} )();