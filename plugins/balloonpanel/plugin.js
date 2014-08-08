/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	CKEDITOR.plugins.add( 'balloonpanel', {
		init: function( editor ) {

		}
	} );

	// Templates used by the plugin.
	var templates = {
		panel:
			'<div' +
				' class="cke {id} cke_reset_all cke_chrome cke_balloon cke_editor_{name} cke_{langDir} ' + CKEDITOR.env.cssClass + '"' +
				' dir="{langDir}"' +
				' title="' + ( CKEDITOR.env.gecko ? ' ' : '' ) + '"' +
				' lang="{langCode}"' +
				' role="dialog"' +
				' style="{style}"' +
				' tabindex="-1"' +	// Needed to make the panel focusable.
				' aria-labelledby="cke_{name}_arialbl"' +
			'></div>',

		content:
				'<div class="cke_balloon_content">{content}</div>',

		title:
			'<div class="cke_balloon_title" role="presentation">{title}</div>',

		close:
			'<a class="cke_balloon_close_button" href="javascript:void(0)" title="Close" role="button">' +
				'<span class="cke_label">X</span>' +
			'</a>',

		triangle:
			'<span class="cke_balloon_triangle cke_balloon_triangle_outer"><span class="cke_balloon_triangle cke_balloon_triangle_inner">&#8203;</span></span>'
	};

	// Make each of template strings an instance of CKEDITOR.template.
	for ( var t in templates )
		templates[ t ] = new CKEDITOR.template( templates[ t ] );

	var DEFAULT_WIDTH = 360,
		DEFAULT_HEIGHT = null,
		DEFAULT_LEFT = 0,
		DEFAULT_TOP = 0,
		TRIANGLE_HEIGHT = 20;

	/**
	 * A class which represents a floating, balloon-shaped panel capable of holding defined
	 * contents, at the precise position in the document. It can be used to represent
	 * contextual data or forms i.e. related to an element in editor's editable.
	 *
	 * @since 4.5
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} config An object containing panel configuration.
	 */
	CKEDITOR.ui.balloonPanel = function( editor, config ) {
		// Environmental references.
		this.env = {
			editor: editor,
			winGlobal: CKEDITOR.document.getWindow()
		};

		// Environmental references that need to be updated with every contentDom
		// as i.e. the reference to a window or frame may change.
		editor.on( 'contentDom', function() {
			this.env.winEditor = editor.window;
			this.env.frame = this.env.winEditor.getFrame();
			this.env.inline = editor.editable().isInline();
		}, this );

		/**
		 * UI elements of the panel.
		 *
		 * @readonly
		 * @property {Object} ui
		 */
		this.ui = {
			title: CKEDITOR.dom.element.createFromHtml( templates.title.output( {
				title: config.title
			} ) ),

			close: CKEDITOR.dom.element.createFromHtml( templates.close.output() ),

			panel: CKEDITOR.dom.element.createFromHtml( templates.panel.output( {
				id: editor.id,
				langDir: editor.lang.dir,
				langCode: editor.langCode,
				name: editor.name,
				style: 'display:none;',
				voiceLabel: editor.lang.editorPanel + ', ' + editor.name,
			} ) ),

			content: CKEDITOR.dom.element.createFromHtml( templates.content.output( {
				content: 'foo<input>'
			} ) ),

			triangle: CKEDITOR.dom.element.createFromHtml( templates.triangle.output() )
		};

		// Append UI elements to create a panel.
		this.ui.panel.append( this.ui.title, 1 );
		this.ui.panel.append( this.ui.close, 1 );
		this.ui.panel.append( this.ui.triangle );
		this.ui.panel.append( this.ui.content );

		// Hide the panel once the closing X is clicked.
		this.ui.close.on( 'click', this.hide, this );

		// Register panel children to focusManager (prevent from blurring the editor).
		editor.focusManager.add( this.ui.panel );
		this.ui.panel.forEach( function( element ) {
			editor.focusManager.add( element );
		} );

		// Panel title and close button are not to be selected.
		this.ui.title.unselectable();
		this.ui.close.unselectable();

		// Rect contains the following properties:
		// 		{ visible, width, height, top, left }
		// updated as balloonPanel.move|resize() are called.
		// It is used to cache values and avoid unnecessary
		// and expensive checks in the future.
		this.rect = {};

		// Move the panel and resize to default values.
		this.move( DEFAULT_LEFT, DEFAULT_TOP );
		this.resize( DEFAULT_WIDTH, DEFAULT_HEIGHT );

		// Append the panel to the global document.
		CKEDITOR.document.getBody().append( this.ui.panel );
	};

	CKEDITOR.ui.balloonPanel.prototype = {
		/**
		 * Shows the panel.
		 */
		show: function() {
			if ( this.rect.visible )
				return;

			this.ui.panel.show();
			this.rect.visible = true;
		},

		/**
		 * Hides the panel and moves the focus back to editable.
		 */
		hide: function() {
			if ( !this.rect.visible )
				return;

			this.ui.panel.hide();
			this.env.editor.focus();
			this.rect.visible = false;
		},

		/**
		 * Moves the **upper-left** panel corner to the specified absolute position.
		 *
		 * @param {Number} left
		 * @param {Number} top
		 */
		move: function( left, top ) {
			this.rect.left = left;
			this.rect.top = top;

			this.ui.panel.setStyles( {
				left: CKEDITOR.tools.cssLength( left ),
				top: CKEDITOR.tools.cssLength( top )
			} );
		},

		/**
		 * Places the panel next to a specified element so the tip of balloon's triangle
		 * touches that element. Once the panel is moved it gains focus.
		 *
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		attach: function( element ) {
			this.show();

			var elementRect = getAbsoluteRect( element, this.env );

			var left = elementRect.left + elementRect.width / 2 - this.getWidth() / 2,
				top = elementRect.top - this.getHeight();

			this.move( left, top - TRIANGLE_HEIGHT );
			this.ui.panel.focus();
		},

		/**
		 * Resizes panel container according to given dimensions.
		 *
		 * @param {Number} width
		 * @param {Number} height
		 */
		resize: function( width, height ) {
			this.rect.width = width;
			this.rect.height = height;

			this.ui.panel.setStyles( {
				width: CKEDITOR.tools.cssLength( width ),
				height: CKEDITOR.tools.cssLength( height )
			} );
		},

		/**
		 * Returns panel width.
		 *
		 * @returns {Number}
		 */
		getWidth: function() {
			return this.rect.width === null ? this.ui.panel.getClientRect().width : this.rect.width;
		},

		/**
		 * Returns panel Height.
		 *
		 * @returns {Number}
		 */
		getHeight: function() {
			return this.rect.height === null ? this.ui.panel.getClientRect().height : this.rect.height;
		}
	};

	// Returns element rect absolute to the top-most document, e.g. it considers
	// outer window scroll position, inner window scroll position (framed editor) and
	// frame position (framed editor) in the top-most document.
	function getAbsoluteRect( element, env ) {
		var elementRect = element.getClientRect(),
			winGlobalScroll = env.winGlobal.getScrollPosition();

		if ( env.inline ) {
			elementRect.top = elementRect.top + winGlobalScroll.y;
			elementRect.left = elementRect.left + winGlobalScroll.x;
		} else {
			var winEditorScroll = env.winEditor.getScrollPosition(),
				frameRect = env.frame.getClientRect();

			elementRect.top = frameRect.top + elementRect.top + winGlobalScroll.y;
			elementRect.left = frameRect.left + elementRect.left + winGlobalScroll.x;
			elementRect.right = elementRect.left + elementRect.width;
			elementRect.bottom = elementRect.top + elementRect.height;
		}

		return elementRect;
	}
} )();