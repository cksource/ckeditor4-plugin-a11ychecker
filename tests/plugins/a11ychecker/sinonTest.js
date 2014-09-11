/* bender-tags: editor,unit */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js, %TEST_DIR%_helpers/sinon/sinon-1.10.2.js */

( function() {
	'use strict';

	require( [ 'Issue', 'helpers/sinon/sinon_amd.min', 'helpers/sinon/Mockup' ], function( Issue, sinon_amd, Mockup ) {

		console.log( Mockup );

		var testObject = {
			Mockup: Mockup,
			'test integr': function() {
				function myTestedFunction( arg ) {
					return 5;
				}

				//var mock = sinon.spy( myTestedFunction );
				//
				//mock.call( document, 'foo' );
				//mock.call( document, 'foo' );
				////mock.callCount( 3 );
				//debugger;
				//assert.isTrue( mock.calledOnce, 'Function is called once' );

				var mock = new this.Mockup( myTestedFunction );
			}
		};

		bender.test( testObject );
	} );
} )();