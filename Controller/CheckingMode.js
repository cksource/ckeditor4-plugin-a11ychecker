
define( function() {

	/**
	 * A controller mode for checking Accessibility issues. Presents all found issues
	 * to the editable.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.CheckingMode
	 * @constructor
	 */
	function CheckingMode( controller ) {
		/**
		 * @property {CKEDITOR.plugins.a11ychecker.Controller} controller
		 */
		this.controller = controller;
	}

	CheckingMode.prototype = {};
	CheckingMode.prototype.constructor = CheckingMode;

	/**
	 * Method to be called when controller enters this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.CheckingMode
	 */
	CheckingMode.prototype.init = function() {
	};

	/**
	 * Method to be called when controller leaves this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.CheckingMode
	 */
	CheckingMode.prototype.close = function() {
	};

	return CheckingMode;
} );