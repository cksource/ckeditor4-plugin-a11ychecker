
define( function() {

	/**
	 * Represents an issue list in a single Accessibility Checker instance. It keeps
	 * reference to all the {@link CKEDITOR.plugins.a11ychecker.Issue} instances, and
	 * manages the focused issue as well.
	 *
	 * **Focused issue** is the one that we're workin on. It might be activated with a
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
	};

	return IssueList;
} );