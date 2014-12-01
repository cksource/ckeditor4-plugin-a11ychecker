
/**
 * @fileoverview Contains IssueListMockup type.
 */

define( [ 'IssueList' ], function( IssueList ) {
	'use strict';

	/**
	 * A simplified type of IssueList.
	 *
	 * @constructor
	 */
	function IssueListMockup() {
		IssueList.call( this );
	}

	IssueListMockup.prototype = new IssueList();
	IssueListMockup.prototype.constructor = IssueListMockup;

	return IssueListMockup;
} );