/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
