
define( function() {

	/**
	 * Represents an issue list in a single Accessibility Checker instance. It keeps
	 * reference to all the {@link CKEDITOR.plugins.a11ychecker.Issue} instances, and
	 * manages the focused issue as well.
	 *
	 * **Focused issue** is the one that we're working on. It might be activated with a
	 * click, keyboard hotkey, etc.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.IssueList
	 * @constructor
	 */
	function IssueList() {
		this.list = [];
	}

	IssueList.prototype = {
		/**
		 * Array containing {@link CKEDITOR.plugins.a11ychecker.Issue} instances.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.IssueList
		 * @type {CKEDITOR.plugins.a11ychecker.Issue[]}
		 */
		list: [],

		/**
		 * Keeps currently focused issue index.
		 *
		 * If no issue is focused `currentIndex` will evaluate to `-1`.
		 *
		 * @property {Number} [currentIndex=-1]
		 * @member CKEDITOR.plugins.a11ychecker.IssueList
		 * @readonly
		 */
		currentIndex: -1
	};

	IssueList.prototype.constructor = IssueList;

	/**
	 * Executes `callback` on each contained Issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @param {Function} callback Function executed for each issue. Gets an `issue` as a first parameter.
	 */
	IssueList.prototype.each = function( callback ) {
		var list = this.list;

		if ( list.map ) {
			list.map( callback, this );
		} else {
			// Old IEs.
			for ( var i = 0, len = list.length; i < len; i++ ) {
				callback.call( this, list[ i ] );
			}
		}
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @returns {Number} Issues count.
	 */
	IssueList.prototype.count = function() {
		return this.list.length;
	};

	/**
	 * Adds an issue to the end of the list.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @param {CKEDITOR.plugins.a11ychecker} issue Issue to be added.
	 */
	IssueList.prototype.addItem = function( issue ) {
		this.list.push( issue );
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @param {Number} index 0-based index of item to be fetched.
	 * @returns {CKEDITOR.plugins.a11ychecker.Issue/null} Issue or `null` if not found.
	 */
	IssueList.prototype.getItem = function( issue ) {
		var ret = this.list[ issue ];
		return ret ? ret : null;
	};

	/**
	 * Clears the issues list.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 */
	IssueList.prototype.clear = function() {
		this.list.splice( 0, this.list.length );
		this.resetFocus();
	};

	/**
	 * Unsets the focused issue.
	 *
	 *		// Assuming we have focused Issue at index 1.
	 *		alert( list.currentIndex ); // Alerts '1'
	 *		list.resetFocus();
	 *		alert( list.currentIndex ); // Alerts '-1'
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 */
	IssueList.prototype.resetFocus = function() {
		this.currentIndex = -1;
	};

	/**
	 * Returns the focused issue or `null` if no issue is focuesd.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @returns {CKEDITOR.dom.element/null} Focused issue or `null` if no issue is focuesd
	 */
	IssueList.prototype.getFocused = function() {
		if ( this.currentIndex != -1 ) {
			return this.getItem( this.currentIndex );
		} else {
			return null;
		}
	};

	/**
	 * Moves focus to Issue at given index.
	 *
	 * @todo: I think its name should be changed, moveTo is not really intuitive.
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @param {Number} index - 0 based index
	 * @returns {Boolean} Returns `false` when item with given index was not found, `true` otherwise.
	 */
	IssueList.prototype.moveTo = function( index ) {
		// If given index is invalid, lets do early return.
		if ( !this.getItem( index ) ) {
			return false;
		}
		//var prevFocused = this.getFocused();

		//if ( prevFocused && this.editor ) {
		//	this.editor._.a11ychecker.ui.unmarkFocus( prevFocused );
		//}

		this.currentIndex = index;

		//if ( this.editor ) {
		//	this.editor._.a11ychecker.ui.markFocus( this.getFocused() );
		//}

		return true;
	};

	/**
	 * Moves focus to the next issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 */
	IssueList.prototype.next = function() {
		if ( !this.count() ) {
			return null;
		}

		// If we have no more item to iterate with.
		if ( this.currentIndex + 1 > this.count() -1 ) {
			// We're moving to first item if we're at the end of the list,
			// and list contains some issues.
			if ( this.currentIndex !== 0 ) {
				this.moveTo( 0 );
			}
		} else {
			// And the default behaviour.
			this.moveTo( this.currentIndex + 1 );
		}

		return this.getFocused();
	};

	/**
	 * Moves focus to the previous issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 */
	IssueList.prototype.prev = function() {
		if ( !this.count() ) {
			return null;
		}

		var maxIndex = this.count() - 1;

		// If we have first focused, or no item focused at all.
		if ( this.currentIndex === 0 || this.currentIndex == -1 ) {
			// Ensure that currently focused item is not the last one.
			if ( this.currentIndex != maxIndex ){
				this.moveTo( maxIndex );
			}
		} else {
			// For each other situation.
			this.moveTo( this.currentIndex - 1 );
		}

		return this.getFocused();
	};

	/**
	 * Returns {@link CKEDITOR.plugins.a11ychecker.Issue} object by element.
	 *
	 * @param {CKEDITOR.dom.element} element Element in the {@link CKEDITOR.editable},
	 * associated with Accessibility issue.
	 * @returns {CKEDITOR.plugins.a11ychecker.Issue/null} Matched object, or `null`
	 * if no matching issue was found.
	 */
	IssueList.prototype.getIssueByElement = function( element ) {
		var ret = null;

		this.each( function( curIssue ) {
			if ( curIssue.element.equals( element ) ) {
				ret = curIssue;
			}
		} );

		return ret;
	};

	/**
	 * Returns element from the issue at given index.
	 *
	 * @todo: Drop this method.
	 * @deprecated Function is only added for compatibility with older interface. Use {@link #getItem} instead.
	 * @member CKEDITOR.plugins.a11ychecker.IssueList
	 * @returns {CKEDITOR.dom.element}
	 */
	IssueList.prototype.getIssueByIndex = function( index ) {
		var issue = this.getItem( index );
		return issue.element;
	};

	return IssueList;
} );