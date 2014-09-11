
define( [ 'quickfix/Base' ], function( Base ) {
	/**
	 * Base class for the manual fixes.
	 *
	 * @constructor
	 */
	function Manual( issue ) {
		Base.call( this, issue );
		this.auto = false;
	}

	Manual.prototype = new Base();
	Manual.prototype.constructor = Manual;

	return Manual;
} );