/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileoverview Contains EditableDecoratorMockup type.
 */

define( [ 'EditableDecorator' ], function( EditableDecorator ) {
	'use strict';

	/**
	 * A simplified type of EditableDecorator.
	 *
	 * Uses CKEDITOR.dom.element initance instead of read ediatble.
	 *
	 * It contain methods like loadContentFrom().
	 *
	 * @constructor
	 */
	function EditableDecoratorMockup() {
		// NOTE: we're intentionally skipping parent consturctor call.

		// An editor fake, we need to dummy restoreRealElement method and plugins prop.
		this.editor = {
			restoreRealElement: function() {
				return null;
			},
			plugins: {}
		};

		// Constructor will check for #fakeEditableContents, if it's not there it will create it here,
		// and append to body.
		if ( !CKEDITOR.document.getById( 'fakeEditableContents' ) ) {
			CKEDITOR.document.append( CKEDITOR.dom.element.createFromHtml( '<div id="fakeEditableContents"></div>' ) );
		}
	}

	EditableDecoratorMockup.prototype = new EditableDecorator();
	EditableDecoratorMockup.prototype.constructor = EditableDecoratorMockup;

	/**
	 * @returns {CKEDITOR.dom.element} Returns an element, which mimics {@link CKEDITOR.editable}.
	 */
	EditableDecoratorMockup.prototype.editable = function() {
		return CKEDITOR.document.getById( 'fakeEditableContents' );
	};

	/**
	 * Resets the content back to the original, placed in div#initialContent.
	 */
	EditableDecoratorMockup.prototype.resetContent = function() {
		this.loadContentFrom( 'initialContent' );
	};

	/**
	 * Sets editable content from element with given `id`.
	 *
	 * @param {String} id Target element id, which content will be copied.
	 */
	EditableDecoratorMockup.prototype.loadContentFrom = function( id ) {
		this.editable().setHtml( CKEDITOR.document.getById( id ).getHtml() );
	};

	return EditableDecoratorMockup;
} );
