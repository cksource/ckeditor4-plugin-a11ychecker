/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/ViewerInputs' ], function( ViewerInputs ) {
	'use strict';

	/**
	 * Quick Fix area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerForm
	 * @mixins CKEDITOR.event
	 * @constructor Creates a Quick Fix form instance.
	 * @param {CKEDITOR.plugins.a11ychecker.viewer} viewer The viewer instance that the object
	 * will be attached to.
	 */
	function ViewerForm( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.viewer}
		 */
		this.viewer = viewer;

		/**
		 * Templates of UI elements in this form.
		 * See {@link #templateDefinitions}, {@link #parts}.
		 */
		this.templates = {};

		for ( var t in this.templateDefinitions ) {
			this.templates[ t ] = new CKEDITOR.template( this.templateDefinitions[ t ] );
		}

		/**
		 * Inputs of this form. See {@link CKEDITOR.plugins.a11ychecker.viewerInput}.
		 */
		this.inputs = {};

		/**
		 * @property parts UI elements of the form.
		 * @property {CKEDITOR.dom.element} parts.wrapper Form wrapper.
		 * @property {CKEDITOR.dom.element} parts.fieldset Form fieldset.
		 * @property {CKEDITOR.dom.element} parts.actionset Form actionset, a place to put buttons.
		 * @property {CKEDITOR.dom.element} parts.quickfixButton Quick Fix button.
		 * @property {CKEDITOR.dom.element} parts.ignoreButton Ignore button.
		 */
		this.parts = {};

		// Build the form.
		this.build();

		/**
		 * Event fired when the form is submitted.
		 *
		 * @event submit
		 */

		/**
		 * Event fired when the issue is ignored.
		 *
		 * @event ignore
		 */
	}

	ViewerForm.prototype = {
		/**
		 * @property templateDefinitions Templates of the form. Automatically converted into
		 * {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.fieldset
		 * @property {String} templateDefinitions.actionset
		 * @property {String} templateDefinitions.buttonWrapper
		 * @property {String} templateDefinitions.quickfixButton
		 * @property {String} templateDefinitions.ignoreButton
		 */
		templateDefinitions: {
			wrapper: '<div role="presentation" class="cke_a11yc_ui_form"></div>',

			fieldset: '<div role="presentation" class="cke_a11yc_ui_form_fieldset"></div>',

			actionset: '<div role="presentation" class="cke_a11yc_ui_form_actionset"></div>',

			buttonWrapper: '<div class="cke_a11yc_ui_button_wrapper {class}"></div>',

			button:
				'<a href="javascript:void(0)" hidefocus="true" class="cke_a11yc_ui_button {class}" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>'
		},

		/**
		 * Adds a new input to the fieldset.
		 *
		 * @method addInput
		 * @param {String} name
		 * @param {Object} definition
		 */
		addInput: function( name, definition ) {
			this.inputs[ name ] = new ViewerInputs[ CKEDITOR.tools.capitalize( definition.type ) ]( name, definition );
			this.inputs[ name ].wrapper.appendTo( this.parts.fieldset );

			this.fire( 'addInput', this.inputs[ name ] );
		},

		/**
		 * Removes the input from the fieldset.
		 *
		 * @method removeInput
		 */
		removeInput: function( name ) {
			this.inputs[ name ].remove();

			this.fire( 'removeInput', this.inputs[ name ] );

			this.inputs[ name ] = null;
		},

		/**
		 * Adds multiple inputs to the fieldset according to the definition.
		 *
		 * @method setInputs
		 * @param {Object} definition
		 */
		setInputs: function( definition ) {
			this.removeInputs();
			this.inputs = {};

			for ( var name in definition ) {
				this.addInput( name, definition[ name ] );
			}
		},

		/**
		 * Removes all inputs from the fieldset.
		 *
		 * @method removeInputs
		 */
		removeInputs: function() {
			for ( var name in this.inputs ) {
				this.removeInput( name );
			}
		},

		/**
		 * Retrieves inputs' data of the form.
		 *
		 * @returns {Object}
		 */
		serialize: function() {
			var data = {};

			for ( var i in this.inputs ) {
				data[ i ] = this.inputs[ i ].getValue();
			}

			return data;
		},

		/**
		 * Builds the UI of the form.
		 */
		build: function() {
			var lang = this.viewer.editor.lang.a11ychecker;

			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				fieldset: CKEDITOR.dom.element.createFromHtml( this.templates.fieldset.output() ),

				actionset: CKEDITOR.dom.element.createFromHtml( this.templates.actionset.output() ),

				quickfixButton: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: lang.quickFixButtonTitle,
					text: lang.quickFixButton,
					'class': 'cke_a11yc_ui_button_ok'
				} ) ),

				ignoreButton: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: lang.ignoreBtnTitle,
					text: lang.ignoreBtn,
					'class': 'cke_a11yc_ui_button_ignore'
				} ) )
			};

			this.parts.fieldset.appendTo( this.parts.wrapper );
			this.parts.actionset.appendTo( this.parts.wrapper );

			var quickfixButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output( {
					'class': 'cke_a11yc_ui_button_ok_wrapper'
				} ) ),
				ignoreButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output( {
					'class': 'cke_a11yc_ui_button_ignore_wrapper'
				} ) );

			this.parts.quickfixButton.appendTo( quickfixButtonWrapper );
			this.parts.ignoreButton.appendTo( ignoreButtonWrapper );

			quickfixButtonWrapper.appendTo( this.parts.actionset );
			ignoreButtonWrapper.appendTo( this.parts.actionset );

			// Quick Fix: click.
			this.parts.quickfixButton.on( 'click', function( evt ) {
				this.fire( 'submit' );
				evt.data.preventDefault();
			}, this );

			// Quick Fix: enter.
			this.parts.fieldset.on( 'keydown', keyListener( 13, function( evt ) {
				this.fire( 'submit' );
			} ), this );

			// Quick Fix: space.
			this.parts.quickfixButton.on( 'keydown', keyListener( 32, function( evt ) {
				this.fire( 'submit' );
			} ), this );

			// Ignore: click.
			this.parts.ignoreButton.on( 'click', function( evt ) {
				this.fire( 'ignore' );
				evt.data.preventDefault();
			}, this );

			// Ignore: space.
			// Space key should trigger ignore event too.
			// There is no need to support enter, as browsers will trigger click event.
			this.parts.ignoreButton.on( 'keydown', function( evt ) {
				if ( evt.data.getKeystroke() == 32 ) {
					evt.data.preventDefault();
					this.fire( 'ignore' );
				}
			}, this );
		},

		/**
		 * Ensures that form is visible.
		 */
		show: function() {
			this.parts.fieldset.show();
			this.parts.quickfixButton.show();
		},

		/**
		 * Hides the form.
		 */
		hide: function() {
			this.parts.fieldset.hide();
			this.parts.quickfixButton.hide();
		},

		/**
		 * Sets the state of "Ignore" button.
		 *
		 * @param {Boolean} isIgnored Bool telling whether issue is ignored or not.
		 */
		setIgnored: function( isIgnored ) {
			var button = this.parts.ignoreButton;

			button.getFirst().setHtml( this.viewer.editor.lang.a11ychecker[ isIgnored ? 'stopIgnoreBtn' : 'ignoreBtn' ] );
			button.setAttribute( 'aria-pressed', isIgnored );
		}
	};

	function keyListener( keystroke, callback ) {
		return function( evt ) {
			var pressed = evt.data.getKeystroke(),
				ckTools = CKEDITOR.tools,
				keyMatched = ckTools.isArray( keystroke ) ?
					ckTools.indexOf( keystroke, pressed ) !== -1 :
					pressed == keystroke;

			if ( keyMatched ) {
				callback.call( this, evt );
				evt.data.preventDefault();
			}
		};
	}

	CKEDITOR.event.implementOn( ViewerForm.prototype );

	return ViewerForm;
} );