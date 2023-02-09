/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @fileoverview Contains ControllerMockup type.
 */

define( [ 'Controller', 'mock/IssueListMockup', 'mocking' ], function( Controller, IssueListMockup, mocking ) {
	'use strict';

	/**
	 * A simplified type of Controller.
	 *
	 * @constructor
	 */
	function ControllerMockup() {
		for ( var i in Controller.prototype ) {
			ControllerMockup.prototype[ i ] = mocking.spy();
		}

		Controller.call( this );

		this.issues = new IssueListMockup();

		this.viewerController = null;
	}

	ControllerMockup.prototype = {};
	ControllerMockup.prototype.constructor = ControllerMockup;

	return ControllerMockup;
} );
