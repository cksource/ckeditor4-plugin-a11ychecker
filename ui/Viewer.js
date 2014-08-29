/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/ViewerDescription', 'ui/ViewerNavigation', 'ui/ViewerForm' ], function( ViewerDescription, ViewerNavigation, ViewerForm ) {
	/**
	 * A class which represents the end-user interface of a11ychecker. Viewer is a panel
	 * which allows to browse and fix issues in the contents.
	 *
	 * *Note*: The panel is built upon the {@link CKEDITOR.ui.panel}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer
	 * @constructor Creates a viewer instance.
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	function Viewer( editor, definition ) {
		/**
		 * The editor of this viewer.
		 */
		this.editor = editor;

		/**
		 * The {@link CKEDITOR.ui.panel} of this viewer.
		 */
		this.panel = new CKEDITOR.ui.balloonPanel( editor, definition );

		this.panel.on( 'show', function() {
			// Hide on iframe window's scroll.
			if ( !this.editor.editable().isInline() ) {
				this.addListener( this.editor.window.on( 'scroll', function() {
					this.blur();
					this.hide();
				}, this ) );
			}

			// Hide the panel on editor resize.
			this.addListener( editor.on( 'resize', function() {
				this.blur();
				this.hide();
			}, this ) );
		} );

		this.setupNavigation();
		this.setupDescription();
		this.setupForm();
	};

	Viewer.prototype = {
		/**
		 * Setups the navigation bar.
		 */
		setupNavigation: function() {
			this.navigation = new ViewerNavigation( this );

			// Register focusables.
			this.panel.registerFocusable( this.navigation.parts.previous );
			this.panel.registerFocusable( this.navigation.parts.list );
			this.panel.registerFocusable( this.navigation.parts.next );

			this.panel.parts.content.append( this.navigation.parts.wrapper );
		},

		/**
		 * Setups the description area.
		 */
		setupDescription: function() {
			this.description = new ViewerDescription();

			this.panel.parts.content.append( this.description.parts.wrapper );
		},

		/**
		 * Setups the "quick fix" form.
		 */
		setupForm: function() {
			this.form = new ViewerForm( this );

			this.form.on( 'addInput', function( evt ) {
				this.panel.registerFocusable( evt.data.input );
			}, this );

			this.form.on( 'removeInput', function( evt ) {
				this.panel.deregisterFocusable( evt.data.input );
			}, this );

			this.panel.registerFocusable( this.form.parts.button );
			this.panel.parts.content.append( this.form.parts.wrapper );
		}
	};

	return Viewer;
} );