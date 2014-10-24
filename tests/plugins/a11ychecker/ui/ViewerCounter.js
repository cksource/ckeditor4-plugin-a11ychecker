/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerCounter', 'mocking' ], function( ViewerCounter, mocking ) {
		bender.test( {
			'test ViewerCounter constructor': function() {
				var template = 'foo',
					mock = new ViewerCounter( template );

				assert.isInstanceOf( CKEDITOR.template, mock.template, 'Template object created' );
				assert.isInstanceOf( CKEDITOR.dom.element, mock.wrapper, 'Wrapper created' );
			},

			'test ViewerCounter.update': function() {
				var template = {
						output: mocking.spy( function() {
							return 'foobarbaz';
						} )
					},
					wrapper = {
						setText: mocking.spy()
					},
					mock = {
						wrapper: wrapper,
						template: template,
						update: ViewerCounter.prototype.update
					};

				mock.update( 2, 10 );
				// Note that 2 should be increased to 3, since it's assumed to be 0-based.
				assert.areSame( 1, template.output.callCount, 'template.output call count' );
				mocking.assert.calledWith( template.output, {
					current: 3,
					total: 10
				} );

				// Ensure that wrapper.setText was called.
				mocking.assert.calledWith( wrapper.setText, 'foobarbaz' );
			}
		} );
	} );
} )();