/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'quickfix/LocalizedRepository', 'mocking' ], function( LocalizedRepository, mocking ) {
		
		// We need to imitate dev property.
		mocking.mockProperty( 'CKEDITOR.plugins.a11ychecker.dev', window, true );
		var scriptLoader = mocking.mockProperty( 'CKEDITOR.scriptLoader.load', window );
		
		bender.test( {
			setUp: function() {
				// Force to clear queue.
				( new LocalizedRepository() )._clearDeferredGetQueue();
			},
			
			'test deferGetCall': function() {
				var mock = new LocalizedRepository(),
					ret = mock.deferGetCall( 'foo', mocking.spy() );

				assert.isTrue( ret, 'Get call would be deferred' );
				assert.areSame( 1, mock._getDeferredGetCount(), 'Queue increased' );
				
				assert.areSame( 1, scriptLoader.callCount, 'scriptLoader.load was called' );
				scriptLoader.reset();
			},
			
			'test deferGetCall dict exists': function() {
				// Now dictionary exists, so get call should not be deferred.
				var mock = new LocalizedRepository(),
					ret;
				
				mock._langDictionary = {};

				ret = mock.deferGetCall( 'foo', mocking.spy() );

				assert.isFalse( ret, 'Get call would be deferred' );
				assert.areSame( 0, mock._getDeferredGetCount(), 'Queue remains the same' );
			},
			
			'test lang': function() {
				var mock = new LocalizedRepository(),
					dict = {
						foo: 'bar',
						baz: 0
					};
				
				mock.lang( dict );
				
				assert.areSame( dict, mock._langDictionary, 'Dictionary stored' );
			}
		} );
	} );
} )();