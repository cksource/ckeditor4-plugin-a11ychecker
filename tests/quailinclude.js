/* bender-tags: unit,1.0.1,204 */

( function() {
	'use strict';

	bender.editors = {
		pathDefined: {
			config: {
				language: 'en',
				a11ychecker_quailPath: 'test/path'
			}
		},
		pathNotDefined: {
			config: {
				language: 'en'
			}
		}
	};

	CKEDITOR.plugins.a11ychecker = {
		Engine: {}
	};

	define( 'window', [], function() {
		return {
			jQuery: {
				fn: {}
			}
		};
	} );

	define( 'EngineQuail', [], function() {} );

	define( 'callback', [], function() {
		return function() {
			resume( function() {
				assert.isTrue( true );
			} );
		};
	} );


	function mockLoad( success, onEnd ) {
		CKEDITOR.scriptLoader.load = function( path, callback ) {
			try {
				callback( success ? [ path ] : [] );
			} catch ( e ) {
				onEnd( e );
				return;
			}
			onEnd( null );
		};
	}

	bender.test( {
		'test loading Quail from the path defined in the config': function() {
			var editor = this.editors.pathDefined;
			define( 'editor', [], function() {
				return editor;
			} );


			var load = CKEDITOR.scriptLoader.load;
			CKEDITOR.scriptLoader.load = sinon.spy();

			require( [ 'quailInclude' ], function( quailInclude ) {
				resume( function() {
					assert.isTrue( CKEDITOR.scriptLoader.load.calledWith( [ 'test/path' ] ) );

					// Cleanup after the test.
					CKEDITOR.scriptLoader.load = load;
					requirejs.undef( 'quailInclude' );
					requirejs.undef( 'editor' );
				} );
			} );

			wait();
		},
		'test loading Quail from the default path': function() {
			var editor = this.editors.pathNotDefined;
			define( 'editor', [], function() {
				return editor;
			} );

			var load = CKEDITOR.scriptLoader.load;
			CKEDITOR.scriptLoader.load = sinon.spy();

			require( [ 'quailInclude' ], function( quailInclude ) {
				resume( function() {
					assert.isTrue( CKEDITOR.scriptLoader.load.calledWith( [ 'plugins/a11ychecker/libs/quail/quail.jquery.min.js' ] ) );

					CKEDITOR.scriptLoader.load = load;
					requirejs.undef( 'quailInclude' );
					requirejs.undef( 'editor' );

				} );
			} );

			wait();
		},
		'test wrong Quail path throws exception': function() {
			var editor = this.editors.pathNotDefined;
			define( 'editor', [], function() {
				return editor;
			} );

			mockLoad( false, function( error ) {
				resume( function() {
					assert.isObject( error );
					assert.areEqual( 'Could not load Quail', error.message );
				} );
			} );

			require( [ 'quailInclude' ], function( quailInclude ) {} );

			wait();
		}
	} );

} )();
