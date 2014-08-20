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

		triangle: {
			outer: '<span class="cke_balloon_triangle cke_balloon_triangle_outer"></span>',
			inner: '<span class="cke_balloon_triangle cke_balloon_triangle_inner">&#8203;</span>'
		}
	};

	( function generateTemplates( templates ) {
		// Make each of template strings an instance of CKEDITOR.template.
		for ( var t in templates ) {
			if ( typeof templates[ t ] == 'string' )
				templates[ t ] = new CKEDITOR.template( templates[ t ] );
			else
				generateTemplates( templates[ t ] );
		}
	} )( templates );

	var DEFAULT_RECT_WIDTH = 360,
		DEFAULT_RECT_HEIGHT = null,
		DEFAULT_RECT_LEFT = 0,
		DEFAULT_RECT_TOP = 0,
		DEFAULT_TRIANGLE_HEIGHT = 20,
		DEFAULT_TRIANGLE_WIDTH = 20,
		DEFAULT_TRIANGLE_SIDE = 'bottom',

		TRIANGLE_RELATIVE = { right: 'left', top: 'bottom', bottom: 'top', left: 'right' };

	/**
	 * A class which represents a floating, balloon-shaped panel capable of holding defined
	 * contents, at the precise position in the document. It can be used to represent
	 * contextual data or forms i.e. related to an element in editor's editable.
	 *
	 * @class
	 * @since 4.5
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	CKEDITOR.ui.balloonPanel = function( editor, definition ) {
		this.definition = definition;

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
			this.env.editable = editor.editable();
		}, this );

		this.ui = {
			/**
			 * Title bar of the panel.
			 *
			 * @readonly
			 * @member CKEDITOR.ui.balloonPanel.ui
			 * @property {CKEDITOR.dom.element} title
			 */
			title: CKEDITOR.dom.element.createFromHtml( templates.title.output( {
				title: definition.title
			} ) ),

			/**
			 * Close button.
			 *
			 * @readonly
			 * @member CKEDITOR.ui.balloonPanel.ui
			 * @property {CKEDITOR.dom.element} close
			 */
			close: CKEDITOR.dom.element.createFromHtml( templates.close.output() ),

			/**
			 * The undermost element, which holds all other elements.
			 * The panel is positioned absolutely.
			 *
			 * @readonly
			 * @member CKEDITOR.ui.balloonPanel.ui
			 * @property {CKEDITOR.dom.element} panel
			 */
			panel: CKEDITOR.dom.element.createFromHtml( templates.panel.output( {
				id: editor.id,
				langDir: editor.lang.dir,
				langCode: editor.langCode,
				name: editor.name,
				style: 'display:none;',
				voiceLabel: editor.lang.editorPanel + ', ' + editor.name,
			} ) ),

			/**
			 * The element, which holds the contents of the panel.
			 *
			 * @readonly
			 * @member CKEDITOR.ui.balloonPanel.ui
			 * @property {CKEDITOR.dom.element} content
			 */
			content: CKEDITOR.dom.element.createFromHtml( templates.content.output( {
				content: definition.content || ''
			} ) ),

			triangle: {
				/**
				 * The outer element of the triangle.
				 *
				 * @readonly
				 * @member CKEDITOR.ui.balloonPanel.ui.triangle
				 * @property {CKEDITOR.dom.element} outer
				 */
				outer: CKEDITOR.dom.element.createFromHtml( templates.triangle.outer.output() ),

				/**
				 * The inner element of the triangle.
				 *
				 * @readonly
				 * @member CKEDITOR.ui.balloonPanel.ui.triangle
				 * @property {CKEDITOR.dom.element} inner
				 */
				inner: CKEDITOR.dom.element.createFromHtml( templates.triangle.inner.output() ),
			}
		};

		// Append UI elements to create a panel.
		this.ui.panel.append( this.ui.title, 1 );
		this.ui.panel.append( this.ui.close, 1 );
		this.ui.panel.append( this.ui.triangle.outer );
		this.ui.panel.append( this.ui.content );
		this.ui.triangle.outer.append( this.ui.triangle.inner );

		// Register panel children to focusManager (prevent from blurring the editor).
		editor.focusManager.add( this.ui.panel );
		this.ui.panel.forEach( function( element ) {
			editor.focusManager.add( element );
		} );

		// Hide the panel once the closing X is clicked.
		this.ui.close.on( 'click', function( evt ) {
			this.blur();
			this.hide();
			evt.data.preventDefault();
		}, this );

		// Hide the panel on editor blur.
		editor.on( 'blur', function() {
			this.hide();
		}, this );

		// Hide the panel on editor resize.
		editor.on( 'resize', function() {
			this.blur();
			this.hide();
		}, this );

		// Hide the panel once blurred.
		this.ui.panel.on( 'blur', function( evt ) {
			var target = new CKEDITOR.dom.element( evt.data.$.relatedTarget || evt.data.$.toElement );

			// Make sure the focus has moved out of the panel.
			if ( !this.ui.panel.contains( target ) && !this.ui.panel.equals( target ) ) {
				this.hide();
			}
		}, this );

		this.ui.panel.on( 'keydown', function( evt ) {
			var keystroke = evt.data.getKeystroke();

			// Hide the panel on ESC key press.
			if ( keystroke == 27 ) {
				this.blur();
				this.hide();
				evt.data.preventDefault();
			}
		}, this );

		// Follow attached element on window scroll.
		editor.on( 'contentDom', function() {
			this.env.winEditor.on( 'scroll', function() {
				this.blur();
				this.hide();
			}, this );
		}, this );

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
		this.move( DEFAULT_RECT_TOP, DEFAULT_RECT_LEFT );
		this.resize( DEFAULT_RECT_WIDTH, DEFAULT_RECT_HEIGHT );
		this.triangle( DEFAULT_TRIANGLE_SIDE );

		// Append the panel to the global document.
		CKEDITOR.document.getBody().append( this.ui.panel );

		/**
		 * Event fired when panel is shown.
		 *
		 * @member CKEDITOR.ui.balloonPanel
		 * @event show
		 */

		/**
		 * Event fired when panel is hidden.
		 *
		 * @member CKEDITOR.ui.balloonPanel
		 * @event hide
		 */

		/**
		 * Event fired when panel is attached to an element.
		 *
		 * @member CKEDITOR.ui.balloonPanel
		 * @event attach
		 */
	};

	/**
	 * The definition of a balloon panel.
	 *
	 * This virtual class illustrates the properties that developers can use to define and create
	 * balloon panels.
	 *
	 *		CKEDITOR.ui.balloonPanel( editor, {
	 *			title: 'My panel',
	 *			onShow: function() {
	 *				...
	 *			}
	 *		} );
	 *
	 * @class CKEDITOR.ui.balloonPanel.definition
	 */

	/**
	 * Title of the panel.
	 *
	 * @readonly
	 * @member CKEDITOR.ui.balloonPanel.definition
	 * @property {String} title
	 */

	/**
	 * Static content of the panel.
	 *
	 * @readonly
	 * @member CKEDITOR.ui.balloonPanel.definition
	 * @property {String} content
	 */

	CKEDITOR.ui.balloonPanel.prototype = {
		/**
		 * Shows the panel.
		 *
		 * @method show
		 * @member CKEDITOR.ui.balloonPanel
		 */
		show: function() {
			if ( this.rect.visible ) {
				return;
			}

			this.rect.visible = true;
			this.ui.panel.show();

			this.fire( 'show' );
		},

		/**
		 * Hides the panel and moves the focus back to editable.
		 *
		 * @method hide
		 * @member CKEDITOR.ui.balloonPanel
		 */
		hide: function() {
			if ( !this.rect.visible ) {
				return;
			}

			this.rect.visible = false;
			this.ui.panel.hide();

			this.fire( 'hide' );
		},

		/**
		 * Moves the focus back to editor's editable.
		 *
		 * @method blur
		 * @member CKEDITOR.ui.balloonPanel
		 */
		blur: function() {
			this.env.editor.focus();
		},

		/**
		 * Moves the **upper-left** panel corner to the specified absolute position.
		 *
		 * @method move
		 * @member CKEDITOR.ui.balloonPanel
		 * @param {Number} left
		 * @param {Number} top
		 */
		move: function( top, left ) {
			this.rect.left = left;
			this.rect.top = top;

			this.ui.panel.setStyles( {
				left: CKEDITOR.tools.cssLength( left ),
				top: CKEDITOR.tools.cssLength( top )
			} );
		},

		/**
		 * Places the panel next to a specified element so the tip of balloon's triangle
		 * touches that element. Once the panel is attached it gains focus.
		 *
		 * @method attach
		 * @member CKEDITOR.ui.balloonPanel
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		attach: ( function() {
			function rectInZone( rect, allowedZone ) {
				if ( rect.top < allowedZone.top || rect.left < allowedZone.left || rect.right > allowedZone.right || rect.bottom > allowedZone.bottom )
					return false;

				return rect;
			}

			function newPanelRect( top, left, panelWidth, panelHeight ) {
				var newPanelRect = {
					top: top,
					left: left
				};

				newPanelRect.right = newPanelRect.left + panelWidth;
				newPanelRect.bottom = newPanelRect.top + panelHeight;

				return newPanelRect;
			}

			return function( element ) {
				this.show();

				this.fire( 'attach' );

				var panelWidth = this.getWidth(),
					panelHeight = this.getHeight(),

					viewPaneSize = this.env.winGlobal.getViewPaneSize(),
					elementRect = getAbsoluteRect( element, this.env ),
					winGlobalScroll = this.env.winGlobal.getScrollPosition(),
					editorRect = getAbsoluteRect( this.env.inline ? this.env.editable : this.env.frame, this.env );

				var allowedZone = {
					top: Math.max( editorRect.top, winGlobalScroll.y ),
					left: Math.max( editorRect.left, winGlobalScroll.x ),
					right: Math.min( editorRect.right, viewPaneSize.width + winGlobalScroll.x ),
					bottom: Math.min( editorRect.bottom, viewPaneSize.height + winGlobalScroll.y )
				};

				var alignments = {
					right: {
						top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
						left: elementRect.right + DEFAULT_TRIANGLE_WIDTH
					},
					top: {
						top: elementRect.top - panelHeight - DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - panelWidth / 2
					},
					bottom: {
						top: elementRect.bottom + DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - panelWidth / 2
					},
					left: {
						top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
						left: elementRect.left - panelWidth - DEFAULT_TRIANGLE_WIDTH
					}
				};

				var moved, rect;
				for ( var a in alignments ) {
					rect = newPanelRect( alignments[ a ].top, alignments[ a ].left, panelWidth, panelHeight );

					if ( rectInZone( rect, allowedZone ) ) {
						this.move( rect.top, rect.left );
						this.triangle( TRIANGLE_RELATIVE[ a ] );
						moved = 1;
						break;
					}
				}

				// Default fall back.
				// To-do: It got to be much smarter.
				if ( !moved ) {
					this.move( alignments.right.top, alignments.right.left );
					this.triangle( TRIANGLE_RELATIVE.right );
				}

				this.ui.panel.focus();
			};
		} )(),

		/**
		 * Resizes panel container to given dimensions.
		 *
		 * @method resize
		 * @member CKEDITOR.ui.balloonPanel
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
		 * @method getWidth
		 * @member CKEDITOR.ui.balloonPanel
		 * @returns {Number}
		 */
		getWidth: function() {
			return this.rect.width === null ? this.ui.panel.getClientRect().width : this.rect.width;
		},

		/**
		 * Returns panel height.
		 *
		 * @method getHeight
		 * @member CKEDITOR.ui.balloonPanel
		 * @returns {Number}
		 */
		getHeight: function() {
			return this.rect.height === null ? this.ui.panel.getClientRect().height : this.rect.height;
		},

		/**
		 * Changes the position of baloon's "triangle".
		 *
		 * @method triangle
		 * @member CKEDITOR.ui.balloonPanel
		 * @param {String} side One of 'left', 'right', 'top', 'bottom'.
		 */
		triangle: function( side ) {
			if ( this.triangleSide ) {
				this.ui.triangle.outer.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
				this.ui.triangle.inner.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
			}

			this.triangleSide = side;

			this.ui.triangle.outer.addClass( 'cke_balloon_triangle_' + side );
			this.ui.triangle.inner.addClass( 'cke_balloon_triangle_' + side );
		},

		/**
		 * Registers a new focusable element in editor's focusManager so the instance
		 * does not blur once child of the panel gains focus.
		 *
		 * @method focusable
		 * @member CKEDITOR.ui.balloonPanel
		 * @param {CKEDITOR.dom.element} element An element to be registered.
		 */
		focusable: function( element ) {
			this.env.editor.focusManager.add( element );
		}
	};

	CKEDITOR.event.implementOn( CKEDITOR.ui.balloonPanel.prototype );

	// Returns element rect absolute to the top-most document, e.g. it considers
	// outer window scroll position, inner window scroll position (framed editor) and
	// frame position (framed editor) in the top-most document.
	function getAbsoluteRect( element, env ) {
		var elementRect = element.getClientRect(),
			winGlobalScroll = env.winGlobal.getScrollPosition();

		if ( env.inline || element.equals( env.frame ) ) {
			elementRect.top = elementRect.top + winGlobalScroll.y;
			elementRect.left = elementRect.left + winGlobalScroll.x;
			elementRect.right = elementRect.left + elementRect.width;
			elementRect.bottom = elementRect.top + elementRect.height;
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