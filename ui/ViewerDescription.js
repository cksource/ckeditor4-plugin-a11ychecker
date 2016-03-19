/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * The description area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerDescription
	 * @mixins CKEDITOR.event
	 * @constructor Creates a viewer's description instance.
	 * @param {CKEDITOR.plugins.a11ychecker.viewer} viewer The viewer instance that the object
	 * will be attached to.
	 */
	function ViewerDescription( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.viewer}
		 */
		this.viewer = viewer;

		/**
		 * Templates of UI elements in this description.
		 * See {@link #templateDefinitions}, {@link #parts}.
		 */
		this.templates = {};

		for ( var t in this.templateDefinitions ) {
			this.templates[ t ] = new CKEDITOR.template( this.templateDefinitions[ t ] );
		}

		/**
		 * @property parts UI elements of the description.
		 * @property {CKEDITOR.dom.element} parts.wrapper Wrapper of the description.
		 * @property {CKEDITOR.dom.element} parts.title Title of the issue.
		 * @property {CKEDITOR.dom.element} parts.info Information about the issue.
		 */
		this.parts = {};

		/**
		 * @readonly
		 * @property {Object} lang Lang object obtained from {@link CKEDITOR.plugins.a11ychecker.viewer#lang}.
		 *
		 * It's mapped simply for code readability, to avoid long property access chains.
		 */
		this.lang = viewer.editor.lang.a11ychecker;

		// Build the description.
		this.build();
	}

	ViewerDescription.prototype = {
		/**
		 * @property templateDefinitions Templates of the description. Automatically converted into
		 * {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.title
		 * @property {String} templateDefinitions.info
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_desc_wrapper"></div>',

			title: '<strong class="cke_a11yc_ui_desc_title" aria-live="polite"></strong>',

			info: '<p class="cke_a11yc_ui_desc_info" aria-live="polite"></p>'
		},

		/**
		 * Sets the new title of the issue.
		 *
		 * @param {String} text
		 */
		setTitle: function( text ) {
			this.parts.title.setHtml( text );
		},

		/**
		 * Sets the info of the issue.
		 *
		 * @param {String} text
		 */
		setInfo: function( text ) {
			this.parts.info.setHtml( text );
		},

		/**
		 * Builds the UI of the description.
		 */
		build: function() {
			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				title: CKEDITOR.dom.element.createFromHtml( this.templates.title.output() ),

				info: CKEDITOR.dom.element.createFromHtml( this.templates.info.output() )
			};

			this.parts.title.appendTo( this.parts.wrapper );
			this.parts.info.appendTo( this.parts.wrapper );
		}
	};

	CKEDITOR.event.implementOn( ViewerDescription.prototype );

	return ViewerDescription;
} );