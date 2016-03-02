/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/ViewerForm', 'mocking' ], function( ViewerForm, mocking ) {
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
