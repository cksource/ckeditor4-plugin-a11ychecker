
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixRepository.get( 'Base', function( Base ) {
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

		CKEDITOR.plugins.a11ychecker.quickFixRepository.register( 'Manual', Manual );
	} );
}() );