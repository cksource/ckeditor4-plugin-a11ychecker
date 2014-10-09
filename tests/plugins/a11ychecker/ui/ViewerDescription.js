/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/ViewerDescription', 'mocking' ], function( ViewerDescription, mocking ) {

		bender.test( {
			'test ViewerDescription.setTestability': function() {
				var testabilityEnum = {
						0: 'a',
						0.5: 'b',
						1: 'c'
					},
					mock = {
						setTestability: ViewerDescription.prototype.setTestability
					},
					partSetHtml = mocking.spy();

				mocking.mockProperty( 'lang.testability', mock, testabilityEnum );
				mocking.mockProperty( 'parts.testability.setHtml', mock, partSetHtml );

				function assertTestability( expected, testabilityValue ) {
					mock.setTestability( testabilityValue );
					assert.areEqual( 1, partSetHtml.callCount, 'parts.testability.setHtml call count' );
					mocking.assert.alwaysCalledWith( partSetHtml, expected );
					partSetHtml.reset();
				}

				assertTestability( 'a', 0 );
				assertTestability( 'b', 0.5 );
				assertTestability( 'c', 1 );
				assertTestability( 'a', undefined );
			}
		} );
	} );
} )();