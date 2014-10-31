/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'helpers/QuickFixTest' ], function( QuickFixTest ) {
		var tests = {
				setUp: function() {
					// Assign a QuickFix/Base class to more precise property.
					Base = this.quickFixType;
				},

				'test constructor': function() {
					var expectedIssue = {},
						fix = new Base( expectedIssue );

					assert.areSame( expectedIssue, fix.issue, 'Object has valid issue property' );
				},

				'test Base.validate': function() {
					// Lets simply check default return value, because there's no
					// special logic in Base.validate.
					var ret = Base.prototype.validate.call( {}, {} );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 0, ret.length, 'Return array length' );
				}
			},
			Base;

		QuickFixTest( 'Base', tests );
	} );
} )();