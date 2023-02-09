/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

define( function() {
	'use strict';

	/**
	 * A mode indicating that Accessibility Checker is busy. Used mainly to indicate
	 * that issue searching is in progress, and engine has not returned any results yet.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.BusyMode
	 * @constructor
	 */
	function BusyMode( controller ) {
		/**
		 * @property {CKEDITOR.plugins.a11ychecker.Controller} controller
		 */
		this.controller = controller;
	}

	BusyMode.prototype = {};
	BusyMode.prototype.constructor = BusyMode;

	/**
	 * Method to be called when controller enters this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.BusyMode
	 */
	BusyMode.prototype.init = function() {
		this.controller.editor.editable().addClass( 'cke_loading' );
	};

	/**
	 * Method to be called when controller leaves this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.BusyMode
	 */
	BusyMode.prototype.close = function() {
		this.controller.editor.editable().removeClass( 'cke_loading' );
	};

	return BusyMode;
} );
