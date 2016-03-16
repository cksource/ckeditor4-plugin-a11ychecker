/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * A class which represents the mode of {@link CKEDITOR.plugins.a11ychecker.viewerForm}.
	 *
	 * *Note*: The panel is built upon the {@link CKEDITOR.ui.panel}.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerMode
	 * @constructor Creates a viewerMode instance.
	 * @param {CKEDITOR.plugins.a11ychecker.viewer} viewer The viewer instance that mode
	 * will be attached to.
	 * @param {Object} definition An object containing mode definition. See
	 * {@link CKEDITOR.plugins.a11ychecker.viewerMode.definition}.
	 */
	function ViewerMode( viewer, definition ) {
		/**
		 * The viewer of this mode.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.viewer}
		 */
		this.viewer = viewer;

		// Copy all definition properties to this object.
		CKEDITOR.tools.extend( this, definition );

		/**
		 * Listeners associated with this mode.
		 */
		this.panelShowListeners = this.panelShowListeners( viewer );

		/**
		 * Active listeners associated with this mode.
		 */
		this.activePanelShowlisteners = [];
	}

	ViewerMode.prototype = {
		/**
		 * Activates the mode.
		 */
		enterMode: function() {
			if ( this.init ) {
				this.init( this.viewer );
			}
			this.addPanelShowListeners();
		},

		/**
		 * Leaves the mode.
		 */
		leaveMode: function() {
			if ( this.close ) {
				this.close( this.viewer );
			}
			this.removePanelShowListeners();
		},

		/**
		 * Adds event listener associated with a mode.
		 * See {@link CKEDITOR.plugins.a11ychecker.viewerMode.definition#panelShowListeners}.
		 *
		 * @param {Object} listener An object containing the `removeListener`.
		 */
		addPanelShowListener: function( listener ) {
			this.activePanelShowlisteners.push( listener );
		},

		/**
		 * Adds event listener associated with a mode.
		 * See {@link CKEDITOR.plugins.a11ychecker.viewerMode.definition#panelShowListeners}.
		 *
		 * @param {Object} listener An object containing the `removeListener`.
		 */
		addPanelShowListeners: function( listener ) {
			if ( !this.panelShowListeners ) {
				return;
			}

			for ( var i = 0; i < this.panelShowListeners.length; i++ ) {
				this.addPanelShowListener(
					this.viewer.panel.addShowListener( this.panelShowListeners[ i ] )
				);
			}
		},

		/**
		 * Removes all listeners associated with this Viewer.
		 * See {@link CKEDITOR.plugins.a11ychecker.viewerMode.definition#panelShowListeners}.
		 */
		removePanelShowListeners: function() {
			var l;
			while ( ( l = this.activePanelShowlisteners.pop() ) ) {
				l.removeListener();
			}
		},
	};

	/**
	 * The definition of a viewer mode.
	 *
	 * This virtual class illustrates the properties that developers can use to define and create
	 * viewer modes.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.viewerMode.definition
	 */

	/**
	 * A function called when viewer enters the mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.viewerMode.definition
	 * @property {Function} init
	 */

	/**
	 * A function called when viewer leaves the mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.viewerMode.definition
	 * @property {Function} close
	 */

	/**
	 * A function that returns an array of listeners, which are specific
	 * for that mode and will be attached on {@link CKEDITOR.ui.balloonPanel#event-show} and
	 * detached on {@link CKEDITOR.ui.balloonPanel#event-hide}. Those listeners are also
	 * deactivated and detached if the mode of the viewer changes.
	 * See {@link CKEDITOR.ui.balloonPanel#addShowListener}.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.viewerMode.definition
	 * @property {Function} panelShowListeners
	 */

	return ViewerMode;
} );