/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,sourcearea */
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

	require( [ 'helpers/sinon/sinon_amd.min', 'Controller', 'ui/ViewerController', 'EngineMock', 'EngineDefault' ], function( sinon, Controller ) {
		bender.test( {
			'test non inited plugin .close()': function() {
				// When plugin is not inited its .close() call shouldn't throw any
				// exception.
				this.editor._.a11ychecker.close();
				// No exceptions, all fine.
				assert.isTrue( true );
			},

			'test non inited plugin .next()': function() {
				// When plugin is not inited its .next() call shouldn't throw any
				// exception.
				this.editor.execCommand( 'a11ychecker.next' );
				// No exceptions, all fine.
				assert.isTrue( true );
			},

			'test non inited plugin .prev()': function() {
				// When plugin is not inited its .prev() call shouldn't throw any
				// exception.
				this.editor.execCommand( 'a11ychecker.prev' );
				// No exceptions, all fine.
				assert.isTrue( true );
			},

			'test change to sourcemode': function() {
				var a11ychecker = this.editor._.a11ychecker;

				try {
					sinon.spy( a11ychecker, 'close' );

					this.editor.execCommand( 'source' );

					assert.areEqual( 1, a11ychecker.close.callCount, 'a11ychecker.close call count' );
				} catch( e ) {
					throw e;
				} finally {
					a11ychecker.close.restore();
				}
			},

			'test editor blur': function() {
				// Bluring the editor should call Controller.close().
				var a11ychecker = this.editor._.a11ychecker;

				try {
					a11ychecker.close = sinon.spy( a11ychecker, 'close' );

					this.editor.fire( 'blur' );

					assert.areEqual( 1, a11ychecker.close.callCount, 'a11ychecker.close call count' );
				} catch( e ) {
					throw e;
				} finally {
					a11ychecker.close.restore();
				}
			}
		} );
	} );
} )();