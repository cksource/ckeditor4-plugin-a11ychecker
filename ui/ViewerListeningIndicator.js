/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * The deflated {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerListeningIndicator
	 * @constructor Creates a viewer's listening indicator instance.
	 * @param {Object} lang Localization `a11ychecker` property object from {@link CKEDITOR.editor#lang}.
	 */
	function ViewerListeningIndicator( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.viewer}
		 */
		this.viewer = viewer;

		/**
		 * Templates of UI elements in this indicator.
		 * See {@link #templateDefinitions}, {@link #parts}.
		 */
		this.templates = {};

		for ( var t in this.templateDefinitions ) {
			this.templates[ t ] = new CKEDITOR.template( this.templateDefinitions[ t ] );
		}

		/**
		 * @property parts UI elements of the indicator.
		 * @property {CKEDITOR.dom.element} parts.wrapper Wrapper of the indicator.
		 * @property {CKEDITOR.dom.element} parts.info Information about the listening mode.
		 * @property {CKEDITOR.dom.element} parts.button Button to leave the listening mode.
		 */
		this.parts = {};

		// Build the indicator.
		this.build();

		/**
		 * Event fired when the "check" button is pressed.
		 *
		 * @event submit
		 */
	}

	ViewerListeningIndicator.prototype = {
		/**
		 * @property templateDefinitions Templates of the listening indicator. Automatically
		 * converted into {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.info
		 * @property {String} templateDefinitions.button
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_listening"></div>',

			info: '<p>{text}</p>',

			button:
				'<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>'
		},

		/**
		 * Builds the UI of the listening indicator.
		 */
		build: function() {
			var lang = this.viewer.editor.lang.a11ychecker;

			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				info: CKEDITOR.dom.element.createFromHtml( this.templates.info.output( {
					text: lang.listeningInfo
				} ) ),

				button: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: lang.listeningCheckAgain,
					text: lang.listeningCheckAgain
				} ) )
			};

			this.parts.wrapper.append( this.parts.info );
			this.parts.wrapper.append( this.parts.button );

			this.parts.button.on( 'click', function() {
				this.fire( 'check' );
			}, this );
		}
	};

	CKEDITOR.event.implementOn( ViewerListeningIndicator.prototype );

	return ViewerListeningIndicator;
} );