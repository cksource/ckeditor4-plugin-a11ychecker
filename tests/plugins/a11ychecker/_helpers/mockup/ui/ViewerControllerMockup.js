
/**
 * @fileoverview Contains ViewerControllerMockup type.
 */

define( [ 'ui/ViewerController', 'mocking' ], function( ViewerController, mocking ) {
	/**
	 * A simplified type of ViewerController.
	 *
	 * @constructor
	 */
	function ViewerControllerMockup() {
		for ( var i in ViewerController.prototype ) {
			ViewerControllerMockup.prototype[ i ] = mocking.spy();
		}

		mocking.mockProperty( 'viewer.panel.hide', this );
	}

	ViewerControllerMockup.prototype = {};
	ViewerControllerMockup.prototype.constructor = ViewerControllerMockup;

	return ViewerControllerMockup;
} );