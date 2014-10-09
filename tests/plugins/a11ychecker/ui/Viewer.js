/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/Viewer', 'ui/ViewerDescription', 'mocking' ], function( Viewer, ViewerDescription, mocking ) {

		bender.test( {
			'test Viewer.setupDescription': function() {
				var mock = {
						setupDescription: Viewer.prototype.setupDescription
					},
					a11ycheckerLang = {},
					appendMock = mocking.spy();

				// Set the editor with a lang property.
				mocking.mockProperty( 'editor.lang.a11ychecker', mock, a11ycheckerLang );
				mocking.mockProperty( 'panel.parts.content.append', mock, appendMock );

				mock.setupDescription();

				// Ensure that description object was created.
				assert.isInstanceOf( ViewerDescription, mock.description, 'description property type' );
				assert.areSame( a11ycheckerLang, mock.description.lang, 'description.lang inited properly' );

				// Ensure that append method was called for elem in panel.parts.
				assert.areSame( 1, appendMock.callCount, 'panel.parts.content.append call count' );
				mocking.assert.alwaysCalledWith( appendMock, mock.description.parts.wrapper );
			}
		} );
	} );
} )();