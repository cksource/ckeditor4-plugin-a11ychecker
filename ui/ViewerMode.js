/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	/**
	 * A class which represents the mode of {@link CKEDITOR.plugins.a11ychecker.viewerForm}.
	 *
	 * *Note*: The panel is built upon the {@link CKEDITOR.ui.panel}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewerMode
	 * @constructor Creates a viewerMode instance.
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing mode definition.
	 */
	function ViewerMode( viewer, definition ) {
		/**
		 * The viewer of this mode.
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
	};

	ViewerMode.prototype = {
		/**
		 * Activates the mode.
		 */
		enterMode: function() {
			this.enter && this.enter( this.viewer );
			this.addPanelShowListeners();
		},

		/**
		 * Leaves the mode.
		 */
		leaveMode: function() {
			this.leave && this.leave( this.viewer );
			this.removePanelShowListeners();
		},

		/**
		 * Adds event listener associated with a mode.
		 * See {@link #listeners}.
		 *
		 * @param {Object} listener An object containing the `removeListener`.
		 */
		addPanelShowListener: function( listener ) {
			this.activePanelShowlisteners.push( listener );
		},

		/**
		 * Adds event listener associated with a mode.
		 * See {@link #listeners}.
		 *
		 * @param {Object} listener An object containing the `removeListener`.
		 */
		addPanelShowListeners: function( listener ) {
			if ( !this.panelShowListeners )
				return;

			for ( var i = 0; i < this.panelShowListeners.length; i++ ) {
				this.addPanelShowListener(
					this.viewer.panel.addShowListener( this.panelShowListeners[ i ] )
				);
			}
		},

		/**
		 * Removes all listeners associated with this Viewer.
		 * See {@link #listeners}.
		 */
		removePanelShowListeners: function() {
			var l;
			while ( ( l = this.activePanelShowlisteners.pop() ) ) {
				l.removeListener();
			}
		},
	};

	return ViewerMode;
} );