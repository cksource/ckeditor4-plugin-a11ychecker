
/**
 * @fileoverview Contains ControllerMockup type.
 */

define( [ 'Controller', 'mock/IssueListMockup', 'helpers/sinon/sinon_amd.min' ], function( Controller, IssueListMockup, sinon ) {
	/**
	 * A simplified type of Controller.
	 *
	 * @constructor
	 */
	function ControllerMockup() {
		for ( var i in Controller.prototype ) {
			ControllerMockup.prototype[ i ] = sinon.spy();
		}

		Controller.call( this );

		this.issues = new IssueListMockup();

		this.viewerController = null;
	}

	ControllerMockup.prototype = {};
	ControllerMockup.prototype.constructor = ControllerMockup;

	return ControllerMockup;
} );