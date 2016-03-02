/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

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
		var controller = this.controller,
			editor = controller.editor;

		if ( editor ) {
			// Editor might not be available in tests.
			editor.fire( 'lockSnapshot', { dontUpdate: true } );
		}

		if ( controller.issues ) {
			controller.editableDecorator.markIssues( controller.issues );
		}

		if ( CKEDITOR.env.chrome && controller.editor ) {
			this._storedSel = controller.editor.getSelection().createBookmarks();
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

		this.controller.editor.fire( 'unlockSnapshot' );
	};

	/**
	 * This method is solely created for Chromium bug (433303) described in #39.
	 *
	 * Unsets previously stored selection.
	 *
	 * It might be needed eg. when user is about to change caret position explicitly.
	 * If we wouldn't revert it, it would be restored when mode is closed.
	 */
	CheckingMode.prototype.unsetStoredSelection = function() {
		var bookmark = this._storedSel;
		if ( bookmark ) {
			this.removeBookmark( bookmark );
			this._storedSel = null;
		}
	};

	/**
	 * A helper function for removing bookmark instanced with sel.createBookmark().
	 *
	 * @param {Object} bookmark
	 */
	CheckingMode.prototype.removeBookmark = function( bookmark ) {
		// We don't really need to worry whether it's serializable or not,
		// because we're not using serialization.
		for ( var i = 0; i < bookmark.length; i++ ) {
			var range = bookmark[ i ];
			range.startNode.remove();
			if ( range.endNode ) {
				range.endNode.remove();
			}
		}
	};

	return CheckingMode;
} );
