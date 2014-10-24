/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	/**
	 * The deflated {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewerListeningIndicator
	 * @constructor Creates a viewer's listening indicator instance.
	 * @param {Object} lang Localization `a11ychecker` property object from {@link CKEDITOR.editor#lang}.
	 */
	function ViewerListeningIndicator( lang ) {
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
		 * @property {CKEDITOR.dom.element} parts.testability Issue testability indicator.
		 */
		this.parts = {};

		// Build the description.
		this.build();

		/**
		 * @readonly
		 * @property {Object} lang Localization `a11ychecker` property object from {@link CKEDITOR.editor#lang}.
		 */
		this.lang = lang;

		/**
		 * Event fired when the "check" button is pressed.
		 *
		 * @event submit
		 */
	}

	ViewerListeningIndicator.prototype = {
		/**
		 * @property templateDefinitions Templates of the listening indicator. Automatically converted into {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.button
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_listening"></div>',

			button:
				'<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>'
		},

		/**
		 * Builds the UI of the listening indicator.
		 */
		build: function() {
			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				button: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: 'Check again',
					text: 'Check again'
				} ) )
			};

			this.parts.wrapper.append( this.parts.button );

			this.parts.button.on( 'click', function() {
				this.fire( 'check' );
			}, this );
		}
	};

	CKEDITOR.event.implementOn( ViewerListeningIndicator.prototype );

	return ViewerListeningIndicator;
} );