/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	CKEDITOR.plugins.add( 'balloonpanel', {
		init: function( editor ) {

		}
	} );

	var templates = {
		panel:
			'<div' +
				' class="cke {id} cke_reset_all cke_chrome cke_balloon cke_editor_{name} cke_{langDir} ' + CKEDITOR.env.cssClass + '"' +
				' dir="{langDir}"' +
				' title="' + ( CKEDITOR.env.gecko ? ' ' : '' ) + '"' +
				' lang="{langCode}"' +
				' role="dialog"' +
				' style="{style}"' +
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

	for ( var t in templates )
		templates[ t ] = new CKEDITOR.template( templates[ t ] );

	var DEFAULT_WIDTH = 360,
		DEFAULT_HEIGHT = null,
		DEFAULT_LEFT = 0,
		DEFAULT_TOP = 0,
		TRIANGLE_HEIGHT = 20;

	CKEDITOR.ui.balloonPanel = function( editor, config ) {
		this.env = {
			editor: editor,
			winGlobal: CKEDITOR.document.getWindow()
		};

		editor.on( 'contentDom', function() {
			this.env.winEditor = editor.window;
			this.env.frame = this.env.winEditor.getFrame();
			this.env.inline = editor.editable().isInline();
		}, this );

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
				content: 'foo'
			} ) ),

			triangle: CKEDITOR.dom.element.createFromHtml( templates.triangle.output() )
		};

		this.ui.close.on( 'click', this.hide, this );
		editor.focusManager.add( this.ui.panel );

		this.ui.panel.append( this.ui.title, 1 );
		this.ui.panel.append( this.ui.close, 1 );
		this.ui.panel.append( this.ui.triangle );
		this.ui.panel.append( this.ui.content );

		this.rect = {};
		this.move( DEFAULT_LEFT, DEFAULT_TOP );
		this.resize( DEFAULT_WIDTH, DEFAULT_HEIGHT );

		CKEDITOR.document.getBody().append( this.ui.panel );
	};

	CKEDITOR.ui.balloonPanel.prototype = {
		show: function() {
			if ( this.rect.visible )
				return;

			this.ui.panel.show();
			this.rect.visible = true;
		},
		hide: function() {
			if ( !this.rect.visible )
				return;

			this.ui.panel.hide();
			this.rect.visible = false;
		},
		move: function( left, top ) {
			this.rect.left = left;
			this.rect.top = top;

			this.ui.panel.setStyles( {
				left: CKEDITOR.tools.cssLength( left ),
				top: CKEDITOR.tools.cssLength( top )
			} );
		},
		attach: function( element ) {
			var elementRect = getAbsoluteRect( element, this.env );

			var left = elementRect.left + elementRect.width / 2 - this.getWidth() / 2,
				top = elementRect.top - this.getHeight();

			this.move( left, top - TRIANGLE_HEIGHT );
		},
		resize: function( width, height ) {
			this.rect.width = width;
			this.rect.height = height;

			this.ui.panel.setStyles( {
				width: CKEDITOR.tools.cssLength( width ),
				height: CKEDITOR.tools.cssLength( height )
			} );
		},
		getWidth: function() {
			return this.rect.width === null ? this.ui.panel.getClientRect().width : this.rect.width;
		},
		getHeight: function() {
			return this.rect.height === null ? this.ui.panel.getClientRect().height : this.rect.height;
		}
	};

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
		}

		return elementRect;
	}
} )();