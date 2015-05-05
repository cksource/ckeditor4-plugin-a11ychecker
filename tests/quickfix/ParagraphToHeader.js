/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ParagraphToHeader,
			tests = {
				setUp: function() {
					ParagraphToHeader = this.quickFixType;
				}
			};
		quickFixTest( 'ParagraphToHeader', tests );
	} );
} )();