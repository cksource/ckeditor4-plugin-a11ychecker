/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * The generic class of {@link CKEDITOR.plugins.a11ychecker.viewerForm} input.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerInput
	 * @constructor Creates an input instance.
	 * @param {String} name Input name.
	 * @param {Object} definition Input definition.
	 */
	function ViewerInput( name, definition ) {
		if ( definition ) {
			CKEDITOR.tools.extend( this, definition, true );

			this.name = name;
			this.id = CKEDITOR.tools.getNextId() + '_input';
			this.wrapper = CKEDITOR.dom.element.createFromHtml( this.wrapperTemplate.output( {
				label: this.label,
				id: this.id
			} ) );
		}
	}

	ViewerInput.prototype = {
		/**
		 * Template of input's wrapper.
		 *
		 * @property {CKEDITOR.template} wrapperTemplate
		 */
		wrapperTemplate: new CKEDITOR.template(
			'<div role="presentation" class="cke_a11yc_ui_input_wrapper">' +
				'<label class="cke_a11yc_ui_input_label" id="{id}_label" for="{id}">{label}</label>' +
			'</div>' ),

		/**
		 * Gets the value of the input.
		 */
		getValue: function() {
			return this.input.getValue();
		},

		/**
		 * Sets the value of the input.
		 *
		 * @param {String} value
		 */
		setValue: function( value ) {
			this.input.setValue( value );
		},

		/**
		 * Sets the initial value of the input.
		 * The value is provided in input's definition.
		 */
		setInitialValue: function() {
			if ( this.value !== undefined ) {
				this.setValue( this.value );
			}
		},

		/**
		 * Removes input from DOM.
		 */
		remove: function() {
			this.wrapper.remove();
		}
	};

	return ViewerInput;
} );