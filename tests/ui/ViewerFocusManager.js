/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/ViewerFocusManager' ], function( ViewerFocusManager ) {

		bender.test( {
			setUp: function() {
				this.mgr = new ViewerFocusManager();
			},

			'test ViewerFocusManager.count': function() {
				this.mgr.list = [ 1, 2 ];
				assert.areSame( 2, this.mgr.count(), 'Valid elements count returned' );
			},

			'test ViewerFocusManager.addItem': function() {
				var newElem = new CKEDITOR.dom.element( 'div' );
				this.mgr.addItem( newElem );
				assert.areSame( 1, this.mgr.list.length, 'List size increased' );
				assert.areSame( newElem, this.mgr.list[ 0 ], 'Valid value has been inserted' );
			},

			'test ViewerFocusManager.addItem adding key listener': function() {
				// addItem() should add a keydown listener to the element.
				var newElem = new CKEDITOR.dom.element( 'div' );
				newElem.on = sinon.spy();

				this.mgr.addItem( newElem );

				assert.areSame( 1, newElem.on.callCount, 'CKEDITOR.dom.element.on calls count' );
				assert.areSame( 'keydown', newElem.on.args[ 0 ][ 0 ], 'Added listener type' );
			},

			'test ViewerFocusManager.removeItem': function() {
				var list = this.mgr.list = [ new CKEDITOR.dom.element( 'div' ), new CKEDITOR.dom.element( 'span' ) ];
				this.mgr.removeItem( 1 );

				assert.areSame( 1, this.mgr.list.length, 'Not all items were removed' );
				assert.areSame( list[ 0 ], this.mgr.list[ 0 ], 'Correct element was removed' );
			},

			'test ViewerFocusManager.removeItem by elem': function() {
				var list = this.mgr.list = [ new CKEDITOR.dom.element( 'div' ), new CKEDITOR.dom.element( 'span' ) ];
				this.mgr.removeItem( list[ 1 ] );

				assert.areSame( 1, this.mgr.list.length, 'Not all items were removed' );
				assert.areSame( list[ 0 ], this.mgr.list[ 0 ], 'Correct element was removed' );
			},

			'test ViewerFocusManager.removeItem removes key listener': function() {
				var removeListener = sinon.spy();
				this.mgr.list = [ new CKEDITOR.dom.element( 'div' ) ];
				this.mgr.list[ 0 ].removeListener = removeListener;

				this.mgr.removeItem( 0 );

				assert.areSame( 1, removeListener.callCount, 'CKEDITOR.dom.element.removeListener calls count' );
				assert.areSame( 'keydown', removeListener.args[ 0 ][ 0 ], 'Removed listener type' );
				assert.areSame( this.mgr.keyDownListener, removeListener.args[ 0 ][ 1 ], 'Listener function' );
			},

			'test elemnts are kept in DOM order': function() {
				// If we'll add #input3 and #input2 the input #input2 should be placed
				// as first item, because it's a younger DOM child.
				var youngerChild = CKEDITOR.document.getById( 'input2' );
				this.mgr.addItem( CKEDITOR.document.getById( 'input3' ) );
				this.mgr.addItem( youngerChild );

				assert.areSame( youngerChild, this.mgr.getItem( 0 ), 'Younger DOM child is placed first' );
			},

			'test ViewerFocusManager.getNext': function() {
				// In this case we'll do multiple calls in same case to reduce TC count.
				var list = this.mgr.list = [ newElement( 'div' ), newElement( 'a' ) ];

				assert.areSame( list[ 0 ], this.mgr.getNext(), 'getNext() no param - return value' );
				assert.areSame( list[ 1 ], this.mgr.getNext( 0 ), 'getNext( 0 ) - return value' );
				// Index edge case.
				assert.areSame( list[ 0 ], this.mgr.getNext( 1 ), 'getNext( 1 ) - return value' );
				// Out of index boundary.
				assert.areSame( list[ 0 ], this.mgr.getNext( 2 ), 'getNext( 2 ) - return value' );
			},

			'test ViewerFocusManager.getNext skips hidden elem': function() {
				// getNext() should not return invisible elements.
				// The a element (index 1) will be invisible one.
				var list = this.mgr.list = [ newElement( 'div' ), newElement( 'a', false ), newElement( 'b' ) ];

				assert.areSame( list[ 2 ], this.mgr.getNext( 0 ) );
			},

			'test ViewerFocusManager.getNext only hidden elem': function() {
				// This list contains only invisible elements, so undefined should be returned.
				this.mgr.list = [ newElement( 'div', false ), newElement( 'a', false ) ];

				assert.areSame( undefined, this.mgr.getNext( 0 ) );
			},

			'test ViewerFocusManager.getPrev': function() {
				// In this case we'll do multiple calls in same case to reduce TC count.
				var list = this.mgr.list = [ newElement( 'div' ), newElement( 'a' ) ];

				assert.areSame( list[ 1 ], this.mgr.getPrev(), 'getPrev() no param - return value' );
				assert.areSame( list[ 1 ], this.mgr.getPrev( 0 ), 'getPrev( 0 ) - return value' );
				// Index edge case.
				assert.areSame( list[ 0 ], this.mgr.getPrev( 1 ), 'getPrev( 1 ) - return value' );
				// Out of index boundary.
				assert.areSame( list[ 1 ], this.mgr.getPrev( 2 ), 'getPrev( 2 ) - return value' );
			},

			'test ViewerFocusManager.getPrev skips hidden elem': function() {
				// getPrev() should not return invisible elements.
				// The a element (index 1) will be invisible one.
				var list = this.mgr.list = [ newElement( 'div' ), newElement( 'a', false ), newElement( 'b' ) ];

				assert.areSame( list[ 0 ], this.mgr.getPrev( 2 ) );
			},

			'test ViewerFocusManager.getPrev only hidden elem': function() {
				// This list contains only invisible elements, so undefined should be returned.
				this.mgr.list = [ newElement( 'div', false ), newElement( 'a', false ) ];

				assert.areSame( undefined, this.mgr.getPrev( 1 ) );
			},

			'test ViewerFocusManager._sort': function() {
				var input2 = CKEDITOR.document.getById( 'input2' ),
					input3 = CKEDITOR.document.getById( 'input3' ),
					_sort = ViewerFocusManager.prototype._sort;

				assert.areSame( -1, _sort( input2, input3 ), 'sort( input2, input3 )' );
				assert.areSame( 1, _sort( input3, input2 ), 'sort( input3, input2 )' );
			}
		} );

		// @param {Boolean} [fakeIsVisible=true] Overrides isVisible method to return true.
		function newElement( tagName, fakeIsVisible ) {
			if ( fakeIsVisible === undefined ) {
				fakeIsVisible = true;
			}

			var ret =  new CKEDITOR.dom.element( tagName );
			if ( fakeIsVisible ) {
				ret.isVisible = function() {
					return true;
				};
			}
			return ret;
		}

	} );
} )();
