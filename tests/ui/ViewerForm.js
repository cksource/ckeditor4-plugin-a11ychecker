/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerForm', 'mocking' ], function( ViewerForm, mocking ) {
		bender.test( {
			'test ViewerForm.hide': function() {
				var formMockup = {};

				mocking.mockProperty( 'parts.fieldset.hide', formMockup );
				mocking.mockProperty( 'parts.quickfixButton.hide', formMockup );

				formMockup.hide = ViewerForm.prototype.hide;

				formMockup.hide();

				assert.areSame( 1, formMockup.parts.quickfixButton.hide.callCount, 'quickfixButton.hide call count' );
				assert.areSame( 1, formMockup.parts.fieldset.hide.callCount, 'fieldset.hide call count' );
			},

			'test ViewerForm.show': function() {
				var formMockup = {};

				mocking.mockProperty( 'parts.fieldset.show', formMockup );
				mocking.mockProperty( 'parts.quickfixButton.show', formMockup );
				formMockup.show = ViewerForm.prototype.show;

				formMockup.show();

				assert.areSame( 1, formMockup.parts.quickfixButton.show.callCount, 'quickfixButton.show count count' );
				assert.areSame( 1, formMockup.parts.fieldset.show.callCount, 'fieldset.show count count' );
			}
		} );
	} );
} )();