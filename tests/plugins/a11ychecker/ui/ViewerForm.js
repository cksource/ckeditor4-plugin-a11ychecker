/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerForm', 'helpers/sinon/sinon_amd.min' ], function( ViewerForm, sinon ) {
		bender.test( {
			'test ViewerForm.hide': function() {
				var formMockup = getViewerFormMockup(),
					addClass = sinon.spy();

				formMockup.parts.wrapper.addClass = addClass;
				formMockup.hide = ViewerForm.prototype.hide;

				formMockup.hide();

				assert.areSame( 1, addClass.callCount, 'wrapper.addClass count' );
				assert.areSame( 'hidden', addClass.args[ 0 ][ 0 ], 'wrapper.addClass first argument' );
			},

			'test ViewerForm.show': function() {
				var formMockup = getViewerFormMockup(),
					removeClass = sinon.spy();

				formMockup.parts.wrapper.removeClass = removeClass;
				formMockup.show = ViewerForm.prototype.show;

				formMockup.show();

				assert.areSame( 1, removeClass.callCount, 'wrapper.removeClass count' );
				assert.areSame( 'hidden', removeClass.args[ 0 ][ 0 ], 'wrapper.removeClass first argument' );
			}
		} );

		function getViewerFormMockup() {
			return {
				parts: {
					wrapper: {

					}
				}
			};
		}
	} );
} )();