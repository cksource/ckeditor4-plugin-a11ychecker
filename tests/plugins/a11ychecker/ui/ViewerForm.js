/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerForm', 'mocking' ], function( ViewerForm, mocking ) {
		bender.test( {
			'test ViewerForm.hide': function() {
				var formMockup = {};

				mocking.mockProperty( 'parts.wrapper.hide', formMockup );

				formMockup.hide = ViewerForm.prototype.hide;

				formMockup.hide();

				assert.areSame( 1, formMockup.parts.wrapper.hide.callCount, 'wrapper.hide call count' );
			},

			'test ViewerForm.show': function() {
				var formMockup = {};

				mocking.mockProperty( 'parts.wrapper.show', formMockup );
				formMockup.show = ViewerForm.prototype.show;

				formMockup.show();

				assert.areSame( 1, formMockup.parts.wrapper.show.callCount, 'wrapper.show count count' );
			}
		} );
	} );
} )();