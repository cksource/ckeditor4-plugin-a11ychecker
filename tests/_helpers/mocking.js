/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/**
 * @fileoverview A module that will make mocking function / objects easier.
 */

define( function() {
	'use strict';

	var ret = {
		sinon: sinon,
		spy: sinon.spy,
		stub: sinon.stub,
		assert: sinon.assert
	};

	/**
	 * Creates a property within given `object`.
	 *
	 * If no value is given an instance of `sinon.spy()` will be used.
	 *
	 * This method is especially useful to create a deeply nested properties instead
	 * of making large amount of object literals.
	 *
	 *		var editorMock = {};
	 *		// Sets the editorMock.lang.myCustomPlugin.colors to given literal.
	 *		mocking.mockProperty( 'lang.myCustomPlugin.colors', editorMock, {
	 *			red: 'rot',
	 *			blue: 'blau',
	 *			green: 'grün'
	 *		} );
	 *		// Sets editorMock.focusManager.add to sinon.spy() object.
	 *		var addSpy = mocking.mockProperty( 'focusManager.add', editorMock );
	 *
	 * @param {String} propertyPath A dot separated property path, eg. `foo.baz.bar`.
	 * @param {Object} oject An object for which property has to be set.
	 * @param {Mixed} value
	 * @returns {Mixed} Returns assigned value.
	 */
	ret.mockProperty = function( propertyPath, object, value ) {
		var members = propertyPath.split('.'),
			propertyName = members.pop(),
			curScope = object;

		value = value || sinon.spy();

		if ( members.length ) {
			for ( var i = 0; i < members.length; i++ ) {
				var inspectedProperty = members[ i ];

				if ( !curScope[ inspectedProperty ] ) {
					curScope[ inspectedProperty ] = {};
				}

				curScope = curScope[ inspectedProperty ];
			}
		}

		curScope[ propertyName ] = value;

		return curScope[ propertyName ];
	};

	return ret;
} );
