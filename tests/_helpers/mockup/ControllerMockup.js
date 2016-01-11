/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
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