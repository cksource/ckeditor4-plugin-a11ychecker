/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,newpage */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

/**
 * @fileoverview Integration tests for Controller class.
 */

( function() {
	'use strict';

	bender.editor = {
		startupData: '<p>foo</p>'
	};

	require( [ 'helpers/sinon/sinon_amd.min', 'Controller', 'EngineMock', 'ui/ViewerController', 'EngineDefault' ], function( sinon, Controller, EngineMock ) {
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
				var a11ychecker = this.editor._.a11ychecker,
					editor = this.editor;

				sinon.spy( a11ychecker, 'close' );

				editor.once( 'mode', function() {
					// Ensure that close was called.
					assert.areEqual( 1, a11ychecker.close.callCount, 'a11ychecker.close call count' );
					a11ychecker.close.restore();

					// Make sure that the editor is in wysiwyg as expected in later tests.
					// Now explaination for that: we need to listen to mode once again, since it will be
					// async, and ONLY THEN resume the tests.
					// Otherwise other tests are going to have invalid command.state (not refreshed).
					editor.once( 'mode', function() {
						resume();
					} );

					editor.setMode( 'wysiwyg' );
				} );

				// Switch to source view.
				this.editor.execCommand( 'source' );

				wait();
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
			},

			'test command sets listening mode': function() {
				var a11ychecker = this.editor._.a11ychecker;
				a11ychecker.setEngine( new EngineMock() );

				// This is needed due to the #51 fix.
				this.editor.window = CKEDITOR.document.getWindow();

				a11ychecker.exec();

				this.editor.execCommand( 'newpage' );

				assert.areSame( Controller.modes.LISTENING, a11ychecker.modeType, 'Listening mode is set' );
			}
		} );
	} );
} )();