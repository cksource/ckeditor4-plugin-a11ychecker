
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
		var that = this;

		for ( var i in ViewerController.prototype ) {
			ViewerControllerMockup.prototype[ i ] = mocking.spy();
		}

		mocking.mockProperty( 'viewer.panel.hide', this );
		mocking.mockProperty( 'viewer.navigation.parts.next.focus', this );

		this.showIssue = mocking.spy( function( issues, cfg ) {
			if ( cfg && cfg.callback ) {
				cfg.callback.call( that );
			}
		} );
	}

	ViewerControllerMockup.prototype = {};
	ViewerControllerMockup.prototype.constructor = ViewerControllerMockup;

	return ViewerControllerMockup;
} );