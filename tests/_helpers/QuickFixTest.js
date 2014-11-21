/**
 * @fileoverview This module contains a function handling QuickFix type loading.
 *
 * The problem with QuickFixes is that they don't use AMD. So function exposed by this module
 * will take:
 * * A QuickFix name as parameter.
 * * Tests object, optional (the one we pass to bender.test).
 * * Callback, optional - it will be called getting loaded type as a parameter.
 *
 * Function will assign type to the `quickFixType` property of tests object and automatically
 * start tests.
 */

define( [ 'mocking', 'QuickFix/Repository' ], function( mocking, Repository ) {
	return function( quickFixName, tests, callback ) {
		var appBaseDir = '/apps/ckeditor/plugins/a11ychecker/QuickFix/';

		// This function is used not really to mock, but to make sure that properties exists.
		mocking.mockProperty( 'CKEDITOR.plugins.a11ychecker.quickFixes', window, new Repository( appBaseDir ) );

		CKEDITOR.plugins.a11ychecker.quickFixes.get( quickFixName, function( QuickFixType ) {
			if ( tests ) {
				tests.quickFixType = QuickFixType;
				bender.test( tests );
			}

			if ( callback ) {
				callback( QuickFixType );
			}
		} );
	};
} );