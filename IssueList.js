
define( function() {

	/**
	 * A list of issues.
	 *
	 * @class
	 * @member {CKEDITOR.plugins.a11ychecker}
	 */
	function IssueList() {
		this.list = [];
	}

	IssueList.prototype = {
		/**
		 * Array containing {@link CKEDITOR.plugins.a11ychecker.Issue} instances.
		 *
		 * @member {CKEDITOR.plugins.a11ychecker.IssueList}
		 * @type {CKEDITOR.plugins.a11ychecker.Issue[]}
		 */
		list: []
	};

	IssueList.prototype.constructor = IssueList;

	/**
	 * Executes `callback` on each contained Issue.
	 *
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
	 * @returns {Number} Issues count.
	 */
	IssueList.prototype.count = function() {
		return this.list.length;
	};

	/**
	 * Adds an issue to the end of the list.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker} issue Issue to be added.
	 */
	IssueList.prototype.addItem = function( issue ) {
		this.list.push( issue );
	};

	/**
	 * @param {Number} index 0-based index of item to be fetched.
	 * @returns {CKEDITOR.plugins.a11ychecker.Issue/null} Issue or `null` if not found.
	 */
	IssueList.prototype.getItem = function( issue ) {
		var ret = this.list[ issue ];
		return ret ? ret : null;
	};

	/**
	 * Clears the issues list.
	 */
	IssueList.prototype.clear = function() {
		this.list.splice( 0, this.list.length );
	};

	return IssueList;
} );