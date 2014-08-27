/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	'use strict';

	CKEDITOR.plugins.add( 'balloonpanel', {
		init: function( editor ) {

		}
	} );

	var DEFAULT_RECT_WIDTH = 360,
		DEFAULT_RECT_HEIGHT = null,
		DEFAULT_TRIANGLE_HEIGHT = 20,
		DEFAULT_TRIANGLE_WIDTH = 20,
		DEFAULT_TRIANGLE_GAP = DEFAULT_TRIANGLE_WIDTH / 2 + 30,

		TRIANGLE_RELATIVE = {
			right: 'left',
			top: 'bottom',
			topLeft: 'bottomLeft',
			topRight: 'bottomRight',
			bottom: 'top',
			bottomLeft: 'topLeft',
			bottomRight: 'topRight',
			left: 'right'
		};

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
		// Copy all definition properties to this object.
		if ( definition )
			CKEDITOR.tools.extend( this, definition );

		( function generateTemplates( templates ) {
			// Make each of template strings an instance of CKEDITOR.template.
			for ( var t in templates ) {
				if ( typeof templates[ t ] == 'string' )
					templates[ t ] = new CKEDITOR.template( templates[ t ] );
				else
					generateTemplates( templates[ t ] );
			}
		} )( this.templates );

		/**
		 * Focusables in this panel.
		 * See {@link #registerFocusable},
		 * {@link #deregisterFocusable}.
		 *
		 * @property {Object} focusables
		 */
		this.focusables = {};

		/**
		 * Event listeners associated with this panel.
		 * See {@link #addListener}, {@link #removeListeners}.
		 *
		 * @property {Array} listeners
		 */
		this.listeners = [];

		/**
		 * @property {Object} rect Contains panel properties as {@link #move}, {@link #resize},
		 * {@link #show} and {@link #hide} are called. It holds values and avoid unnecessary
		 * and expensive checks in the future.
		 *
		 * @property {Number} rect.width
		 * @property {Number} rect.height
		 * @property {Number} rect.top
		 * @property {Number} rect.left
		 * @property {Boolean} rect.visible
		 */
		this.rect = {};

		// Environmental references.
		this.env = {
			editor: editor,
			winGlobal: CKEDITOR.document.getWindow()
		};

		// Build the UI of the panel.
		this.build();

		// Environmental references that need to be updated with every contentDom
		// as i.e. the reference to a window or frame may change.
		// Note: This listener is not registered in #listeners as it's not supposed
		// to be attached and removed with every panel show or hide.
		editor.on( 'contentDom', function() {
			this.env.winEditor = editor.window;
			this.env.frame = this.env.winEditor.getFrame();
			this.env.inline = editor.editable().isInline();
			this.env.editable = editor.editable();
		}, this );

		// Add listeners associated with the panel on show.
		// All listeners will be removed on panel hide.
		this.on( 'show', function() {
			// Hide the panel once the closing X is clicked.
			this.addListener( this.ui.close.on( 'click', function( evt ) {
				this.blur();
				this.hide();
				evt.data.preventDefault();
			}, this ) );

			// Hide the panel on editor blur.
			this.addListener( editor.on( 'blur', function() {
				this.hide();
			}, this ) );

			// Hide the panel on editor resize.
			this.addListener( editor.on( 'resize', function() {
				this.blur();
				this.hide();
			}, this ) );

			// Hide the panel once blurred.
			this.addListener( this.ui.panel.on( 'blur', function( evt ) {
				var target = new CKEDITOR.dom.element( evt.data.$.relatedTarget || evt.data.$.toElement );

				// Make sure the focus has moved out of the panel.
				if ( !this.ui.panel.contains( target ) && !this.ui.panel.equals( target ) ) {
					this.hide();
				}
			}, this ) );

			this.addListener( this.ui.panel.on( 'keydown', function( evt ) {
				var keystroke = evt.data.getKeystroke();

				// Hide the panel on ESC key press.
				if ( keystroke == 27 ) {
					this.blur();
					this.hide();
					evt.data.preventDefault();
				}
			}, this ) );

			// Hide on window scroll.
			this.addListener( this.env.winEditor.on( 'scroll', function() {
				this.blur();
				this.hide();
			}, this ) );
		} );

		// Remove all listeners associated with the panel.
		this.on( 'hide', function() {
			this.removeListeners();
		} );

		// Handle panel destruction.
		editor.on( 'destroy', function() {
			this.removeListeners();
			this.ui.panel.remove();
		}, this );

		/**
		 * Event fired when panel is shown.
		 *
		 * @event show
		 */

		/**
		 * Event fired when panel is hidden.
		 *
		 * @event hide
		 */

		/**
		 * Event fired when panel is attached to an element.
		 *
		 * @event attach
		 */
	};

	CKEDITOR.ui.balloonPanel.prototype = {
		/**
		 * @property templates Templates of the panel. Automatically converted into {@link CKEDITOR.template} in panel's constructor.
		 * @property {String} templates.panel Template of the panel's outmost container.
		 * @property {String} templates.content Template of the panel's content container.
		 * @property {String} templates.title Template of the panel's title bar.
		 * @property {String} templates.close Template of the panel's close button.
		 * @property {String} templates.triangle Templates of the panel's triangle.
		 * @property {String} templates.triangle.outer Template of the panel's outer triangle.
		 * @property {String} templates.triangle.inner Template of the panel's inner triangle.
		 */
		templates: {
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

			content: '<div class="cke_balloon_content">{content}</div>',

			title: '<div class="cke_balloon_title" role="presentation">{title}</div>',

			close:
				'<a class="cke_balloon_close_button" href="javascript:void(0)" title="Close" role="button" tabindex="-1">' +
					'<span class="cke_label">X</span>' +
				'</a>',

			triangle: {
				outer: '<span class="cke_balloon_triangle cke_balloon_triangle_outer"></span>',

				inner: '<span class="cke_balloon_triangle cke_balloon_triangle_inner">&#8203;</span>'
			}
		},

		/**
		 * Builds the UI of the panel.
		 */
		build: function() {
			var editor = this.env.editor;

			/**
			 * @property ui UI elements of the panel.
			 * @property {CKEDITOR.dom.element} ui.title Title bar of the panel.
			 * @property {CKEDITOR.dom.element} ui.close Close button.
			 * @property {CKEDITOR.dom.element} ui.content The element, which holds the contents of the panel.
			 * @property {CKEDITOR.dom.element} ui.panel The undermost element, which holds all other elements. The panel is positioned absolutely.
			 * @property {CKEDITOR.dom.element} ui.triangle Panel's triangle.
			 * @property {CKEDITOR.dom.element} ui.triangle.outer The outer element of the triangle.
			 * @property {CKEDITOR.dom.element} ui.triangle.inner The inner element of the triangle.
			 */
			this.ui = {
				title: CKEDITOR.dom.element.createFromHtml( this.templates.title.output( {
					title: this.title
				} ) ),

				close: CKEDITOR.dom.element.createFromHtml( this.templates.close.output() ),

				panel: CKEDITOR.dom.element.createFromHtml( this.templates.panel.output( {
					id: editor.id,
					langDir: editor.lang.dir,
					langCode: editor.langCode,
					name: editor.name,
					style: 'display:none;',
					voiceLabel: editor.lang.editorPanel + ', ' + editor.name,
				} ) ),

				content: CKEDITOR.dom.element.createFromHtml( this.templates.content.output( {
					content: this.content || ''
				} ) ),

				triangle: {
					outer: CKEDITOR.dom.element.createFromHtml( this.templates.triangle.outer.output() ),

					inner: CKEDITOR.dom.element.createFromHtml( this.templates.triangle.inner.output() ),
				}
			};

			// Append UI elements to create a panel.
			this.ui.panel.append( this.ui.title, 1 );
			this.ui.panel.append( this.ui.close, 1 );
			this.ui.panel.append( this.ui.triangle.outer );
			this.ui.panel.append( this.ui.content );
			this.ui.triangle.outer.append( this.ui.triangle.inner );

			// Register panel children to focusManager (prevent from blurring the editor).
			this.registerFocusable( this.ui.panel );
			this.registerFocusable( this.ui.close );

			// Panel title and close button are not to be selected.
			this.ui.title.unselectable();
			this.ui.close.unselectable();

			// Append the panel to the global document.
			CKEDITOR.document.getBody().append( this.ui.panel );

			// Set default dimensions of the panel.
			this.resize( DEFAULT_RECT_WIDTH, DEFAULT_RECT_HEIGHT );
		},

		/**
		 * Shows the panel.
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
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		attach: ( function() {
			function rectIntersectArea( rect1, rect2 ) {
				var hOverlap = Math.max( 0, Math.min( rect1.right, rect2.right ) - Math.max( rect1.left, rect2.left ) ),
					vOverlap = Math.max( 0, Math.min( rect1.bottom, rect2.bottom ) - Math.max( rect1.top, rect2.top ) );

				return hOverlap * vOverlap;
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

				// This is the rect into which the panel should fit to remain
				// both within the visible area of the editor and the viewport, i.e.
				// the rect area covered by "#":
				//
				// 	[Viewport]
				// 	+-------------------------------------+
				// 	|                        [Editor]     |
				// 	|                        +--------------------+
				// 	|                        |############|       |
				// 	|                        |############|       |
				// 	|                        |############|       |
				// 	|                        +--------------------+
				// 	|                                     |
				// 	+-------------------------------------+
				var allowedRect = {
					top: Math.max( editorRect.top, winGlobalScroll.y ),
					left: Math.max( editorRect.left, winGlobalScroll.x ),
					right: Math.min( editorRect.right, viewPaneSize.width + winGlobalScroll.x ),
					bottom: Math.min( editorRect.bottom, viewPaneSize.height + winGlobalScroll.y )
				};

				// These are all possible alignments of the panel, relative to an element,
				// i.e panel aligned to the 'top center':
				//
				//	[Editor]
				//	+-------------------------------------+
				//	|         [Panel]                     |
				//	|         +-----------------+         |
				//	|         |                 |         |
				//	|  [El.]  +--------v--------+         |
				//	|  +-------------------------------+  |
				//	|  |                               |  |
				//	|  |                               |  |
				//	+--+-------------------------------+--+
				var alignments = {
					'right vcenter': {
						top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
						left: elementRect.right + DEFAULT_TRIANGLE_WIDTH
					},
					'top hcenter': {
						top: elementRect.top - panelHeight - DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - panelWidth / 2
					},
					'top left': {
						top: elementRect.top - panelHeight - DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - DEFAULT_TRIANGLE_GAP
					},
					'top right': {
						top: elementRect.top - panelHeight - DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.right - elementRect.width / 2 - panelWidth + DEFAULT_TRIANGLE_GAP
					},
					'bottom hcenter': {
						top: elementRect.bottom + DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - panelWidth / 2
					},
					'bottom left': {
						top: elementRect.bottom + DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.left + elementRect.width / 2 - DEFAULT_TRIANGLE_GAP
					},
					'bottom right': {
						top: elementRect.bottom + DEFAULT_TRIANGLE_HEIGHT,
						left: elementRect.right - elementRect.width / 2 - panelWidth + DEFAULT_TRIANGLE_GAP
					},
					'left vcenter': {
						top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
						left: elementRect.left - panelWidth - DEFAULT_TRIANGLE_WIDTH
					}
				};

				// The area of the panel.
				var panelArea = panelWidth * panelHeight,

					minDifferenceAlignment, alignmentRect, areaDifference;

				// Iterate over all possible alignments to find the optimal one.
				for ( var a in alignments ) {
					// Create a rect which would represent the panel in such alignment.
					alignmentRect = newPanelRect( alignments[ a ].top, alignments[ a ].left, panelWidth, panelHeight );

					// Calculate the difference between the area of the panel and intersection of allowed rect and alignment rect.
					// It is the area of the panel, which would be OUT of allowed rect if such alignment was used. Less is better.
					areaDifference = alignments[ a ].areaDifference = panelArea - rectIntersectArea( alignmentRect, allowedRect );

					// If the difference is 0, it means that the panel is fully within allowed rect. That's great!
					if ( areaDifference == 0 ) {
						minDifferenceAlignment = a;
						break;
					}

					// If there's no alignment of a minimal area difference, use the first available.
					if ( !minDifferenceAlignment )
						minDifferenceAlignment = a;

					// Determine the alignment of a minimal area difference. It will be used as a fallback
					// if no aligment provides a perfect fit into allowed rect.
					if ( areaDifference < alignments[ minDifferenceAlignment ].areaDifference )
						minDifferenceAlignment = a;
				}

				this.move( alignments[ minDifferenceAlignment ].top, alignments[ minDifferenceAlignment ].left );

				minDifferenceAlignment = minDifferenceAlignment.split( ' ' );
				this.setTriangle( TRIANGLE_RELATIVE[ minDifferenceAlignment[ 0 ] ], minDifferenceAlignment[ 1 ] );

				this.ui.panel.focus();
			};
		} )(),

		/**
		 * Resizes panel container to given dimensions.
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
		 * Returns panel height.
		 *
		 * @returns {Number}
		 */
		getHeight: function() {
			return this.rect.height === null ? this.ui.panel.getClientRect().height : this.rect.height;
		},

		/**
		 * Changes the position of baloon's "triangle".
		 *
		 * @param {String} side One of 'left', 'right', 'top', 'bottom'.
		 */
		setTriangle: function( side, align ) {
			if ( this.triangleSide ) {
				this.ui.triangle.outer.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
				this.ui.triangle.outer.removeClass( 'cke_balloon_triangle_align_' + this.triangleAlign );
				this.ui.triangle.inner.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
			}

			this.triangleSide = side;
			this.triangleAlign = align;

			this.ui.triangle.outer.addClass( 'cke_balloon_triangle_' + side );
			this.ui.triangle.outer.addClass( 'cke_balloon_triangle_align_' + align );
			this.ui.triangle.inner.addClass( 'cke_balloon_triangle_' + side );
		},

		/**
		 * Registers a new focusable element in editor's focusManager so the instance
		 * does not blur once child of the panel gains focus.
		 * See {@link #focusables}.
		 *
		 * @param {CKEDITOR.dom.element} element An element to be registered.
		 */
		registerFocusable: function( element ) {
			this.env.editor.focusManager.add( element );

			this.focusables[ element.getUniqueId() ] = element;
		},

		/**
		 * Deregisters element from editor's focusManager.
		 * See {@link #focusables}.
		 *
		 * @param {CKEDITOR.dom.element} element An element to be registered.
		 */
		deregisterFocusable: function( element ) {
			this.env.editor.focusManager.remove( element );

			delete this.focusables[ element.getUniqueId() ];
		},

		/**
		 * Adds event listener associated with this panel.
		 * See {@link #listeners}.
		 *
		 * @param {Object} listener An object containing the `removeListener`.
		 */
		addListener: function( listener ) {
			this.listeners.push( listener );
		},

		/**
		 * Removes all event listeners associated with this panel.
		 * See {@link #listeners}.
		 */
		removeListeners: function() {
			var l;
			while ( ( l = this.listeners.pop() ) ) {
				l.removeListener();
			}
		}
	};

	CKEDITOR.event.implementOn( CKEDITOR.ui.balloonPanel.prototype );

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
	 * @member CKEDITOR.ui.balloonPanel.definition
	 * @property {String} title
	 */

	/**
	 * Static content of the panel.
	 *
	 * @member CKEDITOR.ui.balloonPanel.definition
	 * @property {String} content
	 */

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