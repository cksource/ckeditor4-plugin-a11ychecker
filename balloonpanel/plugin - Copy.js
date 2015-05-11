/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview BalloonPanel is a floating, balloon-shaped container capable of presenting
 * contents at the precise position in the document.
 */

( function() {
	'use strict';

	CKEDITOR.plugins.add( 'balloonpanel', {
		onLoad: function() {
			CKEDITOR.document.appendStyleSheet( this.path + 'skins/moono/balloonpanel.css' );
		}
	} );

	/**
	 * A class which represents a floating, balloon-shaped panel capable of holding defined
	 * contents, at the precise position in the document. It can be used to represent
	 * contextual data or forms i.e. related to an element in editor's editable.
	 *
	 *		// Create an instance of the panel.
	 *		var panel = new CKEDITOR.ui.balloonPanel( editor, {
	 *			title: 'My panel',
	 *			content: '<p>This is my panel</p>'
	 *		} );
	 *
	 *		// Attach the panel to an element in DOM and shows it immediately.
	 *		panel.attach( domElement );
	 *
	 * @class
	 * @since 4.5
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	CKEDITOR.ui.balloonPanel = function( editor, definition ) {
		/**
		 * The editor of this panel.
		 */
		this.editor = editor;

		CKEDITOR.tools.extend( this, {
			/**
			 * Default width of the panel.
			 */
			width: 360,

			/**
			 * Default height of the panel.
			 */
			height: 'auto',

			/**
			 * Default width of the triangle.
			 */
			triangleWidth: 20,

			/**
			 * Default height of the triangle.
			 */
			triangleHeight: 20,

			/**
			 * Default distance between the triangle and the vertical edge of the panel.
			 */
			triangleMinDistance: 40
		}, definition, true );

		/**
		 * Templates of UI elements in this panel.
		 * See {@link #templateDefinitions}, {@link #parts}.
		 */
		this.templates = {};

		for ( var t in this.templateDefinitions ) {
			this.templates[ t ] = new CKEDITOR.template( this.templateDefinitions[ t ] );
		}

		/**
		 * @property parts UI elements of the panel.
		 * @property {CKEDITOR.dom.element} parts.title Title bar of the panel.
		 * @property {CKEDITOR.dom.element} parts.close Close button.
		 * @property {CKEDITOR.dom.element} parts.content The element, which holds the contents of the panel.
		 * @property {CKEDITOR.dom.element} parts.panel The undermost element, which holds all other elements. The panel is positioned absolutely.
		 * @property {CKEDITOR.dom.element} parts.triangle Panel's triangle.
		 * @property {CKEDITOR.dom.element} parts.triangleOuter The outer element of the triangle.
		 * @property {CKEDITOR.dom.element} parts.triangleInner The inner element of the triangle.
		 */
		this.parts = {};

		/**
		 * Focusables in this panel.
		 * See {@link #registerFocusable}, {@link #deregisterFocusable} and {@link CKEDITOR.focusManager}.
		 */
		this.focusables = {};

		/**
		 * Event listeners associated with this panel, activated on panel show.
		 * See {@link #addShowListener}, {@link #activateShowListeners}, {@link #deactivateShowListeners}.
		 */
		this.showListeners = {};

		/**
		 * Event listeners associated with this panel, active as long as panel is shown.
		 * See {@link #addShowListener}, {@link #activateShowListeners}, {@link #deactivateShowListeners}.
		 */
		this.activeShowListeners = {};

		/**
		 * @property rect Contains panel properties as {@link #move}, {@link #resize},
		 * {@link #method-show} and {@link #method-hide} are called. It holds values and avoid unnecessary
		 * and expensive checks in the future.
		 *
		 * @property {Number} rect.width
		 * @property {Number} rect.height
		 * @property {Number} rect.top
		 * @property {Number} rect.left
		 * @property {Boolean} rect.visible
		 */
		this.rect = {
			visible: false
		};

		// Build the UI of the panel.
		this.build();

		// Handle panel destruction.
		editor.on( 'destroy', function() {
			this.destroy();
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
		 * @property templateDefinitions Templates of the panel. Automatically converted into {@link CKEDITOR.template} in panel's constructor.
		 * @property {String} templateDefinitions.panel Template of the panel's outmost container.
		 * @property {String} templateDefinitions.content Template of the panel's content container.
		 * @property {String} templateDefinitions.title Template of the panel's title bar.
		 * @property {String} templateDefinitions.close Template of the panel's close button.
		 * @property {String} templateDefinitions.triangleOuter Template of the panel's outer triangle.
		 * @property {String} templateDefinitions.triangleInner Template of the panel's inner triangle.
		 */
		templateDefinitions: {
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

			triangleOuter: '<span class="cke_balloon_triangle cke_balloon_triangle_outer"></span>',

			triangleInner: '<span class="cke_balloon_triangle cke_balloon_triangle_inner">&#8203;</span>'
		},

		/**
		 * Builds the UI of the panel.
		 */
		build: function() {
			var editor = this.editor;

			this.parts = {
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
					voiceLabel: editor.lang.editorPanel + ', ' + editor.name
				} ) ),

				content: CKEDITOR.dom.element.createFromHtml( this.templates.content.output( {
					content: this.content || ''
				} ) ),

				triangleOuter: CKEDITOR.dom.element.createFromHtml( this.templates.triangleOuter.output() ),

				triangleInner: CKEDITOR.dom.element.createFromHtml( this.templates.triangleInner.output() )
			};

			// Append UI elements to create a panel.
			this.parts.panel.append( this.parts.title, 1 );
			this.parts.panel.append( this.parts.close, 1 );
			this.parts.panel.append( this.parts.triangleOuter );
			this.parts.panel.append( this.parts.content );
			this.parts.triangleOuter.append( this.parts.triangleInner );

			// Register panel children to focusManager (prevent from blurring the editor).
			this.registerFocusable( this.parts.panel );
			this.registerFocusable( this.parts.close );

			// Panel title and close button are not to be selected.
			this.parts.title.unselectable();
			this.parts.close.unselectable();

			// Append the panel to the global document.
			CKEDITOR.document.getBody().append( this.parts.panel );

			// Set default dimensions of the panel.
			this.resize( this.width, this.height );

			// Activates listeners on panel show.
			// All listeners will be deactivated on panel hide.
			this.on( 'show', this.activateShowListeners, this );

			// Deactivate all listeners on panel hide.
			this.on( 'hide', this.deactivateShowListeners, this );
		},

		/**
		 * Shows the panel.
		 */
		show: function() {
			if ( this.rect.visible ) {
				return;
			}

			this.rect.visible = true;
			this.parts.panel.show();

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
			this.parts.panel.hide();

			this.fire( 'hide' );
		},

		/**
		 * Moves the focus back to editor's editable.
		 *
		 * @method blur
		 * @member CKEDITOR.ui.balloonPanel
		 */
		blur: function() {
			this.editor.focus();
		},

		/**
		 * Moves the **upper-left** panel corner to the specified absolute position.
		 *
		 * @param {Number} left
		 * @param {Number} top
		 * @param {Number} editorRect Editable rectangle, containing `left`, `top`, `right`, `bottom`,
		 * `width` and `height` properties.
		 */
		move: function( top, left, editorRect ) {
			this.rect.left = left;
			this.rect.top = top;

			this.parts.panel.setStyles( {
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
		 * @param {CKEDITOR.dom.element/Boolean} [focusElement] Element to be focused after panel
		 * is attached. By default `panel` property of {@link #parts} will be focused. You might specify element to be focused
		 * by passing any {@link CKEDITOR.dom.element} instance. You can also prevent changing focus at all, by setting it to `false`.
		 */
		attach: ( function() {
			var winGlobal, frame, editable, isInline;

			function rectIntersectArea( rect1, rect2 ) {
				var hOverlap = Math.max( 0, Math.min( rect1.right, rect2.right ) - Math.max( rect1.left, rect2.left ) ),
					vOverlap = Math.max( 0, Math.min( rect1.bottom, rect2.bottom ) - Math.max( rect1.top, rect2.top ) );

				return hOverlap * vOverlap;
			}

			function newPanelRect( top, left, panelWidth, panelHeight ) {
				var newRect = {
					top: top,
					left: left
				};

				newRect.right = newRect.left + panelWidth;
				newRect.bottom = newRect.top + panelHeight;

				return newRect;
			}

			// Returns element rect absolute to the top-most document, e.g. it considers
			// outer window scroll position, inner window scroll position (framed editor) and
			// frame position (framed editor) in the top-most document.
			function getAbsoluteRect( element ) {
				var elementRect = element.getClientRect(),
					winGlobalScroll = winGlobal.getScrollPosition(),
					frameRect;

				if ( isInline || element.equals( frame ) ) {
					elementRect.top = elementRect.top + winGlobalScroll.y;
					elementRect.left = elementRect.left + winGlobalScroll.x;
					elementRect.right = elementRect.left + elementRect.width;
					elementRect.bottom = elementRect.top + elementRect.height;
				} else {
					frameRect = frame.getClientRect();

					elementRect.top = frameRect.top + elementRect.top + winGlobalScroll.y;
					elementRect.left = frameRect.left + elementRect.left + winGlobalScroll.x;
					elementRect.right = elementRect.left + elementRect.width;
					elementRect.bottom = elementRect.top + elementRect.height;
				}

				return elementRect;
			}

			var triangleRelativePosition = {
				right: 'left',
				top: 'bottom',
				topLeft: 'bottomLeft',
				topRight: 'bottomRight',
				bottom: 'top',
				bottomLeft: 'topLeft',
				bottomRight: 'topRight',
				left: 'right'
			};

			return function( element, focusElement ) {
				this.show();

				this.fire( 'attach' );

				winGlobal = CKEDITOR.document.getWindow();
				frame = this.editor.window.getFrame();
				editable = this.editor.editable();
				isInline = editable.isInline();

				var panelWidth = this.getWidth(),
					panelHeight = this.getHeight(),

					elementRect = getAbsoluteRect( element ),
					editorRect = getAbsoluteRect( isInline ? editable : frame ),

					viewPaneSize = winGlobal.getViewPaneSize(),
					winGlobalScroll = winGlobal.getScrollPosition();

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

				// The area of the panel.
				var panelArea = panelWidth * panelHeight,
					alignments = this.getAlignments( elementRect, editorRect, panelWidth, panelHeight ),
					minDifferenceAlignment, alignmentRect, areaDifference;

				// Iterate over all possible alignments to find the optimal one.
				for ( var a in alignments ) {
					// Create a rect which would represent the panel in such alignment.
					alignmentRect = newPanelRect( alignments[ a ].top, alignments[ a ].left, panelWidth, panelHeight );

					// Calculate the difference between the area of the panel and intersection of allowed rect and alignment rect.
					// It is the area of the panel, which would be OUT of allowed rect if such alignment was used. Less is better.
					areaDifference = alignments[ a ].areaDifference = panelArea - rectIntersectArea( alignmentRect, allowedRect );

					// If the difference is 0, it means that the panel is fully within allowed rect. That's great!
					if ( areaDifference === 0 ) {
						minDifferenceAlignment = a;
						break;
					}

					// If there's no alignment of a minimal area difference, use the first available.
					if ( !minDifferenceAlignment ) {
						//minDifferenceAlignment = a;
					}

					// Determine the alignment of a minimal area difference. It will be used as a fallback
					// if no aligment provides a perfect fit into allowed rect.
					if ( minDifferenceAlignment && areaDifference < alignments[ minDifferenceAlignment ].areaDifference ) {
						minDifferenceAlignment = a;
					}
				}

				if ( !minDifferenceAlignment && this._isElementInViewport_internal ) {
					var overflowInfo = this._isElementInViewport_internal( element, element.getWindow() ),
						indexOf = CKEDITOR.tools.indexOf,
						minDifferenceAlignment = '';

					if ( overflowInfo.length ) {
						// left / right
						if ( indexOf( overflowInfo, 2 ) !== -1 ) {
						} else if ( indexOf( overflowInfo, 8 ) !== -1 ) {
						} else {
						}
					}
				}

				if ( !minDifferenceAlignment ) {
					console.log('szajse! not a good alignment');
					minDifferenceAlignment = CKEDITOR.tools.objectKeys( alignments )[ 0 ];
				}

				this.move( alignments[ minDifferenceAlignment ].top, alignments[ minDifferenceAlignment ].left, editorRect );

				minDifferenceAlignment = minDifferenceAlignment.split( ' ' );
				this.setTriangle( triangleRelativePosition[ minDifferenceAlignment[ 0 ] ], minDifferenceAlignment[ 1 ] );

				// Set focus to proper element.
				if ( focusElement !== false ) {
					( focusElement || this.parts.panel ).focus();
				}
			};
		} )(),

		getAlignments: function( elementRect, editorRect, panelWidth, panelHeight ) {
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
			return {
				'right vcenter': {
					top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
					left: elementRect.right + this.triangleWidth
				},
				'top hcenter': {
					top: elementRect.top - panelHeight - this.triangleHeight,
					left: elementRect.left + elementRect.width / 2 - panelWidth / 2
				},
				'top left': {
					top: elementRect.top - panelHeight - this.triangleHeight,
					left: elementRect.left + elementRect.width / 2 - this.triangleMinDistance
				},
				'top right': {
					top: elementRect.top - panelHeight - this.triangleHeight,
					left: elementRect.right - elementRect.width / 2 - panelWidth + this.triangleMinDistance
				},
				'bottom hcenter': {
					top: elementRect.bottom + this.triangleHeight,
					left: elementRect.left + elementRect.width / 2 - panelWidth / 2
				},
				'bottom left': {
					top: elementRect.bottom + this.triangleHeight,
					left: elementRect.left + elementRect.width / 2 - this.triangleMinDistance
				},
				'bottom right': {
					top: elementRect.bottom + this.triangleHeight,
					left: elementRect.right - elementRect.width / 2 - panelWidth + this.triangleMinDistance
				},
				'left vcenter': {
					top: elementRect.top + elementRect.height / 2 - panelHeight / 2,
					left: elementRect.left - panelWidth - this.triangleWidth
				}
			};
		},

		/**
		 * Resizes panel container to given dimensions. Use `'auto'` to
		 * make the dimensions of the panel flexible.
		 *
		 * @param {Number} width
		 * @param {Number} height
		 */
		resize: function( width, height ) {
			this.rect.width = width;
			this.rect.height = height;

			this.parts.panel.setStyles( {
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
			return this.rect.width === 'auto' ? this.parts.panel.getClientRect().width : this.rect.width;
		},

		/**
		 * Returns panel height.
		 *
		 * @returns {Number}
		 */
		getHeight: function() {
			return this.rect.height === 'auto' ? this.parts.panel.getClientRect().height : this.rect.height;
		},

		/**
		 * Changes the position of baloon's "triangle".
		 *
		 * @param {String} side One of 'left', 'right', 'top', 'bottom'.
		 */
		setTriangle: function( side, align ) {
			var outer = this.parts.triangleOuter,
				inner = this.parts.triangleInner;

			if ( this.triangleSide ) {
				outer.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
				outer.removeClass( 'cke_balloon_triangle_align_' + this.triangleAlign );
				inner.removeClass( 'cke_balloon_triangle_' + this.triangleSide );
			}

			this.triangleSide = side;
			this.triangleAlign = align;

			outer.addClass( 'cke_balloon_triangle_' + side );
			outer.addClass( 'cke_balloon_triangle_align_' + align );
			inner.addClass( 'cke_balloon_triangle_' + side );
		},

		/**
		 * Registers a new focusable element in editor's focusManager so the instance
		 * does not blur once child of the panel gains focus.
		 * See {@link #focusables}.
		 *
		 * @param {CKEDITOR.dom.element} element An element to be registered.
		 */
		registerFocusable: function( element ) {
			this.editor.focusManager.add( element );

			this.focusables[ element.getUniqueId() ] = element;
		},

		/**
		 * Deregisters element from editor's focusManager.
		 * See {@link #focusables}.
		 *
		 * @param {CKEDITOR.dom.element} element An element to be registered.
		 */
		deregisterFocusable: function( element ) {
			this.editor.focusManager.remove( element );

			delete this.focusables[ element.getUniqueId() ];
		},

		/**
		 * Adds event listener associated with this panel. Such listener
		 * will be activated on panel `show` and deactivated on panel `hide`.
		 * See {@link #showListeners}, {@link #activeShowListeners}, {@link #activateShowListeners},
		 * {@link #deactivateShowListeners}.
		 *
		 * @param {Function} listener A function that, if called, attaches the listener
		 * and returns listener object.
		 * @returns {Object} An object containing `removeListener` method that removes
		 * the listener from the collection.
		 */
		addShowListener: function( listener ) {
			var id = CKEDITOR.tools.getNextNumber();

			// Adds the listener to the register of on-show-activated listeners.
			this.showListeners[ id ] = listener;

			// Activate listener immediately if panel is already visible.
			if ( this.rect.visible ) {
				this.activateShowListener( id );
			}

			var that = this;

			return {
				removeListener: function() {
					that.removeShowListener( id );
				}
			};
		},

		/**
		 * Removes event listener associated with this panel visible state.
		 * See {@link #addShowListener}.
		 *
		 * @param {Number} id An id of the listener.
		 */
		removeShowListener: function( id ) {
			this.deactivateShowListener( id );
			delete this.showListeners[ id ];
		},

		/**
		 * Activates listener associated with this panel.
		 * See {@link #showListeners}, {@link #activeShowListeners}, {@link #deactivateShowListener},
		 * {@link #addShowListener}, {@link #removeShowListener}.
		 */
		activateShowListener: function( id ) {
			this.activeShowListeners[ id ] = this.showListeners[ id ].call( this );
		},

		/**
		 * Deactivates listener associated with this panel.
		 * See {@link #activateShowListener}.
		 */
		deactivateShowListener: function( id ) {
			if ( this.activeShowListeners[ id ] ) {
				this.activeShowListeners[ id ].removeListener();
			}

			delete this.activeShowListeners[ id ];
		},

		/**
		 * Activates all listeners associated with this panel.
		 * See {@link #showListeners}, {@link #activeShowListeners}, {@link #deactivateShowListeners},
		 * {@link #addShowListener}, {@link #removeShowListener}.
		 */
		activateShowListeners: function() {
			for ( var id in this.showListeners ) {
				this.activateShowListener( id );
			}
		},

		/**
		 * Removes all listeners associated with this panel.
		 * See {@link #activateShowListeners}.
		 */
		deactivateShowListeners: function() {
			for ( var id in this.activeShowListeners ) {
				this.deactivateShowListener( id );
			}
		},

		/**
		 * Destroys the panel by removing it from DOM and purging
		 * all associated listeners.
		 */
		destroy: function() {
			this.deactivateShowListeners();
			this.parts.panel.remove();
		},

		/**
		 * Sets panel's title.
		 *
		 * @param {String} title A new panel's title.
		 */
		setTitle: function( title ) {
			this.parts.title.setHtml( title );
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
} )();