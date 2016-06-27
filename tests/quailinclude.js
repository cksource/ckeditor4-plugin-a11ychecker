( function() {
	'use strict';

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
		return function() {};
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

	mockLoad( true, function() {} );

	bender.require( [ 'quailInclude' ], function( quailInclude ) {
		bender.test( {
			'test wrong Quail path throws exception': function() {
				mockLoad( false, function( error ) {
					assert.isObject( error );
					assert.areEqual( 'Could not load Quail', error.message );
				} );

				quailInclude();
			},
			'test correct Quail path does not throw exception': function() {
				mockLoad( true, function( error ) {
					assert.isNull( error );
				} );

				quailInclude();
			}
		} );
	} );
} )();
