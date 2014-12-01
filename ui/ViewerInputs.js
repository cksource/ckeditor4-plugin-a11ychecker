/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/ViewerInput' ], function( ViewerInput ) {
	'use strict';

	var ViewerInputs = {
		/**
		 * The text input of {@link CKEDITOR.plugins.a11ychecker.viewerForm}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewerInputs.text
		 * @extends CKEDITOR.plugins.a11ychecker.viewerInput
		 * @constructor Creates a text input instance.
		 */
		Text: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			this.input.appendTo( this.wrapper );

			this.setInitialValue();
		},

		/**
		 * The checkbox input of {@link CKEDITOR.plugins.a11ychecker.viewerForm}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewerInputs.checkbox
		 * @extends CKEDITOR.plugins.a11ychecker.viewerInput
		 * @constructor Creates a checkbox input instance.
		 */
		Checkbox: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			this.input.appendTo( this.wrapper );

			this.setInitialValue();
		},

		/**
		 * The select input of {@link CKEDITOR.plugins.a11ychecker.viewerForm}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewerInputs.select
		 * @extends CKEDITOR.plugins.a11ychecker.viewerInput
		 * @constructor Creates a select input instance.
		 */
		Select: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.options = {};

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			for ( var o in definition.options ) {
				this.options[ o ] = CKEDITOR.dom.element.createFromHtml( this.optionTemplate.output( {
					value: o,
					text: definition.options[ o ]
				} ) );

				this.options[ o ].appendTo( this.input );
			}

			this.input.appendTo( this.wrapper );

			this.setInitialValue();
		}
	};

	ViewerInputs.Text.prototype = CKEDITOR.tools.extend( new ViewerInput(), {
		/**
		 * @member CKEDITOR.plugins.a11ychecker.viewerInputs.text
		 * Template of the input.
		 */
		inputTemplate: new CKEDITOR.template(
			'<input class="cke_a11yc_ui_input cke_a11yc_ui_input_text" type="text" id={id}' +
			' aria-labelledby="id" aria-required="true">' )
	} );

	ViewerInputs.Checkbox.prototype = CKEDITOR.tools.extend( new ViewerInput(), {
		/**
		 * @member CKEDITOR.plugins.a11ychecker.viewerInputs.checkbox
		 * Template of the input.
		 */
		inputTemplate: new CKEDITOR.template(
			'<input class="cke_a11yc_ui_input cke_a11yc_ui_input_checkbox" type="checkbox"' +
			' id={id} aria-labelledby="id" aria-required="true">' ),

		getValue: function() {
			return this.input.$.checked;
		}
	}, true );

	ViewerInputs.Select.prototype = CKEDITOR.tools.extend( new ViewerInput(), {
		/**
		 * @member CKEDITOR.plugins.a11ychecker.viewerInputs.select
		 * Template of the input.
		 */
		inputTemplate: new CKEDITOR.template( '<select class="cke_a11yc_ui_input_select" id={id}' +
			' aria-labelledby="id" aria-required="true"></select>' ),

		/**
		 * @member CKEDITOR.plugins.a11ychecker.viewerInputs.select
		 * Template of the option.
		 */
		optionTemplate: new CKEDITOR.template( '<option value="{value}">{text}</select>' )
	} );

	return ViewerInputs;
} );