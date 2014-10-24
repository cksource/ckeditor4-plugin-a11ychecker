/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/ViewerInputs' ], function( ViewerInputs ) {
	/**
	 * The "quick fix" area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewerForm
	 * @mixins CKEDITOR.event
	 * @constructor Creates a "quick fix" form instance.
	 */
	function ViewerForm( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
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
		 * Inputs of this form. See {@link CKEDITOR.plugins.a11ychecker.viewer.input}.
		 */
		this.inputs = {};

		/**
		 * @property parts UI elements of the form.
		 * @property {CKEDITOR.dom.element} parts.wrapper Form wrapper.
		 * @property {CKEDITOR.dom.element} parts.fieldset Form fieldset.
		 * @property {CKEDITOR.dom.element} parts.button Form button.
		 */
		this.parts = {};

		// Build the form.
		this.build();

		/**
		 * Event fired when the form is submitted.
		 *
		 * @event submit
		 */
	};

	ViewerForm.prototype = {
		/**
		 * @property templateDefinitions Templates of the form. Automatically converted into {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.fieldset
		 * @property {String} templateDefinitions.button
		 */
		templateDefinitions: {
			wrapper: '<div role="presentation" class="cke_a11yc_ui_form"></div>',

			fieldset: '<div role="presentation" class="cke_a11yc_ui_form_fieldset"></div>',

			button:
				'<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button cke_a11yc_ui_button_ok" role="button">' +
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
			for ( var name in this.inputs )
				this.removeInput( name );
		},

		/**
		 * Retrieves inputs' data of the form.
		 *
		 * @returns {Object}
		 */
		serialize: function() {
			var data = {};

			for ( var i in this.inputs )
				data[ i ] = this.inputs[ i ].getValue();

			return data;
		},

		/**
		 * Builds the UI of the form.
		 */
		build: function() {
			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				fieldset: CKEDITOR.dom.element.createFromHtml( this.templates.fieldset.output() ),

				button: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: 'Quick fix',
					text: 'Quick fix'
				} ) ),
			};

			this.parts.fieldset.appendTo( this.parts.wrapper );
			this.parts.button.appendTo( this.parts.wrapper );

			this.parts.button.on( 'click', function( evt ) {
				this.fire( 'submit' );
				evt.data.preventDefault();
			}, this );

			// Enter.
			this.parts.wrapper.on( 'keydown', keyListener( 13, function( evt ) {
				this.fire( 'submit' );
			} ), this );

			// Space
			this.parts.button.on( 'keydown', keyListener( 32, function( evt ) {
				this.fire( 'submit' );
			} ), this );
		},

		/**
		 * Ensures that form is visible.
		 */
		show: function() {
			this.parts.wrapper.show();
		},

		/**
		 * Hides the form.
		 */
		hide: function() {
			this.parts.wrapper.hide();
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
		}
	}

	CKEDITOR.event.implementOn( ViewerForm.prototype );

	return ViewerForm;
} );