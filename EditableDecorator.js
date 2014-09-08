
define( function() {
	'use strict';

	/**
	 * Encapsulates all the logic related to modification of issued elements within the
	 * {@link CKEDITOR.editable}.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.EditableDecorator
	 * @constructor
	 * @param {CKEDITOR.editor} editor
	 */
	function EditableDecorator( editor ) {
		this.editor = editor;
	}

	EditableDecorator.prototype = {};
	EditableDecorator.prototype.constructor = EditableDecorator;

	/**
	 * Attribute name used to mark elements, so A11y Checker can keep track of them, even after
	 * to HTML serialization.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME = 'quail-id';

	/**
	 * Fully qualified attribute name, including data prefix.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME_FULL = 'data-quail-id';

	/**
	 * @returns {CKEDITOR.editable/null} Returns associated editors `editable` element, or `null` if
	 * editable is not available.
	 */
	EditableDecorator.prototype.editable = function() {
		return this.editor.editable();
	};

	/**
	 * Adds an extra markuyp to elements inside the editable.
	 *
	 * We're adding `data-quail-id` attribute so we can identify nodes in (string HTML) output,
	 * and vice versa.
	 */
	EditableDecorator.prototype.applyMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects,
			lastId = 1;

		// Note: id 1 will be assigned to editable itself, which is fine.
		editable.forEach( function( element ) {
			// Assign lastId incremented by one.
			element.data( EditableDecorator.ID_ATTRIBUTE_NAME, lastId );

			// We also need to apply this attribute to fake elements.
			// Note: we're skipping this step in case of missing fakeobject plugin,
			// because there's really no reason to do that.
			if ( editorHasFakeobjectPlugin && isFakeElement( element ) ) {
				updateFakeobjectsAttribute( element, EditableDecorator.ID_ATTRIBUTE_NAME_FULL, lastId );
			}

			// Prepare id for next iteration.
			lastId += 1;

			return true;
		}, CKEDITOR.NODE_ELEMENT, false );
	};

	/**
	 * Cleans the editable from all extra markup applied by the EditableDecorator.
	 */
	EditableDecorator.prototype.removeMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects;

		// Removes all Accessibility Checker attributes from the editable element.
		editable.forEach( function( element ) {
			/**
			 * @todo: Why the hell do we check for removeAttribute here?
			 * Since it's an element it **must** contain removeAttribute.
			 */
			if ( element.removeAttribute ) {
				element.removeAttribute( EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}

			if ( editorHasFakeobjectPlugin && isFakeElement( element ) ) {
				removeFakeObjectAttribute( element, EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}
		}, CKEDITOR.NODE_ELEMENT, false );
	};

	/**
	 * Checks if given element is a fake element.
	 *
	 * @param {CKEDITOR.dom.element} element
	 * @returns {Boolean}
	 */
	function isFakeElement( element ) {
		return element.data( 'cke-real-node-type' ) !== null;
	}

	/**
	 * @todo: It would be perfect to refactor this function later on.
	 * Secondly: this function might reuse removeFakeObjectAttribute instead of doing it on its own.
	 *
	 * Adds an attribute to a fake object.
	 * @param	{CKEDITOR.dom.element}	element		Dom element of fakeobject.
	 * @param	{String}	attrName	Attribute name.
	 * @param	{Mixed}	attrValue	New value.
	 */
	function updateFakeobjectsAttribute( element, attrName, attrValue ) {
		attrValue = String( attrValue );

		// Note that we want to make sure that previous value is removed.
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			initialValue = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' ),
			newVal = initialValue.replace( /^(<\w+\s)/, '$1' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '" ' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	function removeFakeObjectAttribute( element, attrName ) {
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			newVal = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	return EditableDecorator;
} );