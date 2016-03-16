/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.ui.ViewerFocusManager
	 * @constructor
	 */
	function ViewerFocusManager() {
		/**
		 * @property {CKEDITOR.dom.element[]} A list of focusable elements.
		 */
		this.list = [];
	}

	ViewerFocusManager.prototype = {};
	ViewerFocusManager.prototype.constructor = ViewerFocusManager;

	/**
	 * @returns {Number} Number of elements in focus manager.
	 */
	ViewerFocusManager.prototype.count = function() {
		return this.list.length;
	};

	/**
	 * Adds element to the focusable list.
	 *
	 * @param {CKEDITOR.dom.element} element
	 */
	ViewerFocusManager.prototype.addItem = function( element ) {
		element.on( 'keydown', this.keyDownListener, this );

		this.list.push( element );

		// This might be resource consuming, we should execute _sort as long
		// as it returns 1 and move inserted element upwards the list.
		// But now KISS.
		this.sort();
	};

	/**
	 * @param index {Number/CKEDITOR.dom.element} Index or element to be removed from focus list.
	 */
	ViewerFocusManager.prototype.removeItem = function( index ) {
		if ( typeof index != 'number' ) {
			index = CKEDITOR.tools.indexOf( this.list, index );
		}

		this.list[ index ].removeListener( 'keydown', this.keyDownListener );

		this.list.splice( index, 1 );
	};

	/**
	 * Returns element at given index.
	 *
	 * @returns {CKEDITOR.dom.element/undefined} Returns requrested element or `undefined` if
	 * not found.
	 */
	ViewerFocusManager.prototype.getItem = function( index ) {
		return this.list[ index ];
	};

	/**
	 * @private
	 */
	ViewerFocusManager.prototype.keyDownListener = function( evt ) {
		var index = CKEDITOR.tools.indexOf( this.list, evt.sender ),
			key = evt.data.getKey(),
			keystroke = evt.data.getKeystroke();

		// Early return if:
		// Event source elem is not in this.list.
		// List contains only 1 element.
		// Pressed key is not a Tab.
		if ( index === -1 || this.list.length === 1 || key != 9 /* Tab */ ) {
			return ;
		}

		var shiftPressed = keystroke & CKEDITOR.SHIFT,
			nextItem = shiftPressed ? this.getPrev( index ) : this.getNext( index );

		// If every focusable element is not visible it's possible that undefined will be returned.
		if ( nextItem ) {
			nextItem.focus();
			evt.data.preventDefault( 1 );
			evt.data.stopPropagation();
		}
	};

	/**
	 * Returns next focusable element in list.
	 *
	 * First element will be returned when end is reached.
	 *
	 *		// Assuming that focusMgr has 3 elements.
	 *		focusMgr.getNext(); // Returns first item.
	 *		focusMgr.getNext( 0 ); // Returns second item.
	 *		focusMgr.getNext( 2 ); // Returns first item.
	 *
	 * @param {Number} [startIndex] If given, next item according to that index will be returned.
	 * @return {CKEDITOR.dom.element\undefined} Next node, or `undefined` if list is empty.
	 */
	ViewerFocusManager.prototype.getNext = function( startIndex ) {
		var pickedIndex = 0,
			listSize = this.list.length,
			ret;

		if ( typeof startIndex == 'number' && ( startIndex + 1 ) < listSize ) {
			pickedIndex = startIndex + 1;
		}

		ret = this.getItem( pickedIndex );

		// Following loop will make sure that no visible element is returned.
		var i,
			nextIndex;
		// We can use for loop, since in worst case scenario it will be listSize - 1 iterations.
		for ( i = 1; i < listSize - 1 && !ret.isVisible(); i++ ) {
			nextIndex = pickedIndex + i;
			if ( nextIndex >= listSize ) {
				nextIndex -= listSize;
			}

			ret = this.getItem( nextIndex );
		}

		if ( i == listSize - 1 && !ret.isVisible() ) {
			// Edge case, last iteration still might return invisible elemnt, check
			// that.
			return undefined;
		}

		return ret;
	};

	/**
	 * Returns previous focusable element in list.
	 *
	 * Last element will be returned when called with `0` index.
	 *
	 * Works the same way as {@link #next}.
	 *
	 * @param {Number} [startIndex] If given, previous item according to that index will be returned.
	 * @return {CKEDITOR.dom.element\undefined} Previous node, or `undefined` if list is empty.
	 */
	ViewerFocusManager.prototype.getPrev = function( startIndex ) {
		var listSize = this.list.length,
			pickedIndex = listSize - 1,
			ret;

		if ( typeof startIndex == 'number' && startIndex > 0 ) {
			pickedIndex = startIndex - 1;
		}

		ret = this.getItem( pickedIndex );

		// Following loop will make sure that no visible element is returned.
		// Basically reverted logic from getNext().
		var i,
			nextIndex;
		// We can use for loop, since in worst case scenario it will be listSize - 1 iterations.
		for ( i = 1; i < listSize - 1 && !ret.isVisible(); i++ ) {
			nextIndex = pickedIndex - i;
			if ( nextIndex < 0 ) {
				nextIndex = listSize + nextIndex;
			}

			ret = this.getItem( nextIndex );
		}

		if ( i == listSize - 1 && !ret.isVisible() ) {
			// Edge case, last iteration still might return invisible elemnt, check
			// that.
			return undefined;
		}

		return ret;
	};

	/**
	 * Sorts elements contained in {@link #list} array.
	 */
	ViewerFocusManager.prototype.sort = function() {
		this.list.sort( this._sort );
	};

	/**
	 * Sorting algorithm used in {@link #sort} method.
	 *
	 * It sorts list elements by their DOM position.
	 *
	 * @private
	 * @param {CKEDITOR.dom.element} a First sort argument.
	 * @param {CKEDITOR.dom.element} b Second sort argument.
	 * @returns {Number}
	 */
	ViewerFocusManager.prototype._sort = function( a, b ) {
		var ret = 0;

		// If a is following b in DOM tree, then we mark b as earlier.
		if ( a.getPosition( b ) & CKEDITOR.POSITION_FOLLOWING ) {
			ret = 1;
		} else {
			ret = -1;
		}

		return ret;
	};


	return ViewerFocusManager;
} );