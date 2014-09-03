
/**
 * Class representing single issue instance.
 * 
 * @class
 */
CKEDITOR.plugins.a11ychecker.Issue = function() {

};

CKEDITOR.plugins.a11ychecker.Issue.prototype = {
	/**
	 * @returns {String} Human-readable title.
	 */
	getTitle: function() {
		return 'title';
	},
	/**
	 * @returns {String} Human-readable description for the issue.
	 */
	getDescr: function() {
		return 'descr';
	},
	/**
	 * Returns the path in guideline spec. Eg.
	 *
	 *		// Assuming that we have a WCAG2 issue.
	 *		console.log( issue.getPath() );
	 *		// Would log: [ 'WCAG2', 'Principle2', 'Guideline2_4', '2_4_2', 'H25' ]
	 *
	 * @returns {String[]} Path in specification (if any).
	 */
	getPath: function() {
		return [ 'WCAG2', 'Principle2', 'Guideline2_4', '2_4_2', 'H25', '2' ];
	},
	/**
	 *		console.log( issue.getGuidelineSpec() );
	 *		// Would log: 'WCAG2'
	 *		console.log( section508Issue.getGuidelineSpec() );
	 *		// Would log: 'Section508'
	 *
	 * @returns {String} Identifier of guidelines.
	 */
	getGuidelineSpec: function() {
		return 'WCAG2';
	}
};