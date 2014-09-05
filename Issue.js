
define( function() {
	/**
	 * @class CKEDITOR.plugins.a11ychecker.Issue
	 * @constructor
	 * @member CKEDITOR.plugins.a11ychecker
	 * @param {Object} definition Definition object allowing to override default values.
	 * @param {CKEDITOR.plugins.a11ychecker.Engine} engine Engine used to identify issue.
	 */
	function Issue( definition, engine ) {
		CKEDITOR.tools.extend( this, definition, true );

		this.engine = engine;
	}

	Issue.prototype = {
		/**
		 * Keeps an information about testability of the issue.
		 *
		 * Currently it takes 3 values:
		 *
		 * * 1 - high testability - We might be sure that this issue was identified correctly.
		 * * 0.5 - moderate testability - This issue is likely to need human verification.
		 * * 0 - none - Engine is not capable of resolving this issue.
		 *
		 * Redundancy note: althought testability might be kept in IssueDetails object, we'll store it
		 * in each Issue, because it does not require us to fetch whole IssueDetails object to get this
		 * information.
		 *
		 * Testability might be often time crucial information in terms of issue importance.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.dom.element/null}
		 */
		testability: 0,
		/**
		 * DOM element which caused the issue.
		 *
		 * @todo: This is a reference to element in wrapper returned by getTempOutput.Controller (a.k.a. scratchpad).
		 * So it's not referencing DOM element in Editor by any means, we should emphesise it at each step.
		 * I think that we'll add Issue.editorElement, when the checking is done, and IssueList is closed.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.dom.element/null}
		 */
		element: null,
		/**
		 * An object containing {@link CKEDITOR.plugins.a11ychecker.IssueDetails}.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.plugins.a11ychecker.IssueDetails}
		 */
		details: null,

		/**
		 * Reference to {@link CKEDITOR.plugins.a11ychecker.Engine} used to identify
		 * this issue.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.plugins.a11ychecker.Engine}
		 */
		engine: null,

		/**
		 * A type of the issue. It's used to determine @link CKEDITOR.plugins.a11ychecker.IssueDetails} object.
		 *
		 * @todo: I think I should rename it to `type`, `typeId` or something. Id is very misleading, as it
		 * indicates that it's an unique issue identifier.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {mixed}
		 */
		id: null
	};

	Issue.prototype.constructor = Issue;

	/**
	 * Returns {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object.
	 *
	 * This operation might be asynchronous so the result is returned in a callback.
	 *
	 * By design to obtain details for the very first time, Issue will ask IssuesList for the
	 * details.
	 *
	 * @param {Function} callback A function to be called when
	 * {@link CKEDITOR.plugins.a11ychecker.IssueDetails} is available.
	 */
	Issue.prototype.getDetails = function( callback ) {
		if ( this.details ) {
			callback( this.details );
		} else {
			var that = this;
			this.engine.getIssueDetails( this, function( resp ) {
				that.details = resp;
				callback( resp );
			} );
		}
	};


	return Issue;
} );