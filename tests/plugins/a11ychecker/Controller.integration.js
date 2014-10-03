/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

/**
 * @fileoverview Integration tests for Controller class.
 */

( function() {
	'use strict';

	bender.editor = {
		config: {
			a11ychecker_engine: 'EngineMock'
		},
		startupData: '<p>foo</p>'
	};

	require( [ 'Controller' ], function( Controller ) {
		bender.test( {
			'test non inited plugin .close()': function() {
				// When plugin is not inited its .close() call shouldn't throw any
				// exception.
				this.editor._.a11ychecker.close();
				// No exceptions, all fine.
				assert.isTrue( true );
			}
		} );
	} );
} )();