/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'Controller' ], function( Controller ) {
		bender.test( {
			setUp: function() {
				this.mockup = getControllerMockup();
			},

			'test Controller.getTempOutput first call': function() {
				// Ensures that getTempOutput creates a new element if called for the first time.
				var ret = this.mockup.getTempOutput();
				assert.isInstanceOf( CKEDITOR.dom.element, ret, 'Returned value has a valid type' );
				assert.isNull( null, ret.getParent(), 'Element has no parent' );
			},

			'test Controller.getTempOutput multiple calls': function() {
				// Checks if getTempOutput will return diffrent DOM elements, when
				// by diffrent objects.
				// (Note we're using 2 diffrent Controller objects, so they're not the same!)
				var ret1 = this.mockup.getTempOutput(),
					ret2 = getControllerMockup().getTempOutput();

				assert.isInstanceOf( CKEDITOR.dom.element, ret2, 'ret2 has a valid type' );
				assert.areNotSame( ret1, ret2, 'Both return values should differ' );
			},

			'test Controller.getTempOutput subsequent calls': function() {
				// If getTempOutput will be called **by the same object** multiple times it
				// should return same DOM object.
				var ret1 = this.mockup.getTempOutput(),
					ret2 = this.mockup.getTempOutput();

				assert.areSame( ret1, ret2, 'Returned elements are the same' );
			},

			'test Controller.setEngine': function() {
				var newEngine = {};
				this.mockup.setEngine( newEngine );

				assert.areSame( newEngine, this.mockup.engine, 'Engine property was changed' );
			}
		} );

		function getControllerMockup() {
			return new Controller();
		}
	} );
} )();