
define( function() {
	'use strict';

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
		this.controller.editor.fire( 'lockSnapshot', { dontUpdate: true } );

		if ( this.controller.issues ) {
			this.controller.editableDecorator.markIssues( this.controller.issues );
		}
	};

	/**
	 * Method to be called when controller leaves this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.CheckingMode
	 */
	CheckingMode.prototype.close = function() {
		var controller = this.controller;
		// Remove all the DOM changes applied by the EditableDecorator.
		controller.editableDecorator.removeMarkup();

		if ( controller.viewerController ) {
			controller.viewerController.viewer.panel.hide();
		}

		if ( controller.issues ) {
			controller.issues.resetFocus();
		}

		this.controller.editor.fire( 'unlockSnapshot' );
	};

	return CheckingMode;
} );