
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

		/**
		 * This property is solely for workarounding Chrome
		 * [#433303](https://code.google.com/p/chromium/issues/detail?id=433303) bug.
		 *
		 * It stores the selection before enabling CHECKING mode, so when mode is closed
		 * it can retrieve original selection.
		 *
		 * More details can be found in ticket #39.
		 *
		 * @property {null/Object} _storedSel
		 * @private
		 */
		this._storedSel = null;
	}

	CheckingMode.prototype = {};
	CheckingMode.prototype.constructor = CheckingMode;

	/**
	 * Method to be called when controller enters this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.CheckingMode
	 */
	CheckingMode.prototype.init = function() {
		if ( this.controller.issues ) {
			this.controller.editableDecorator.markIssues( this.controller.issues );
		}

		if ( CKEDITOR.env.chrome && this.controller.editor ) {
			this._storedSel = this.controller.editor.getSelection().createBookmarks2();
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

		if ( this._storedSel ) {
			this.controller.editor.getSelection().selectBookmarks( this._storedSel );
		}
	};

	return CheckingMode;
} );