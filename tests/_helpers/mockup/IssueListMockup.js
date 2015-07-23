/**
 * @license Copyright (c) 2014-2015, CKSource - Frederico Knabben. All rights reserved.
 */

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