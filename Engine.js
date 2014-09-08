
define( function() {

	/**
	 * @constructor
	 */
	function Engine() {
	}

	Engine.prototype = {};
	Engine.prototype.constructor = Engine;

	/**
	 * Performs accessibility checking for the current editor content.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
	 * @param {Function} callback
	 */
	Engine.prototype.process = function( a11ychecker, contentElement, callback ) {
	};

	/**
	 * Used to obtain issues {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
	 * might be asynchronous.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object which details should be fetched.
	 * @param {Function} callback Callback to be called with {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object as a parameter.
	 */
	Engine.prototype.getIssueDetails = function( issue, callback ) {
	};

	return Engine;
} );