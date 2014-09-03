
define( function() {

	/**
	 * IssueDetails instance contains more detailed informations about the Issue,
	 * like a title, description.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.IssueDetails
	 * @constructor
	 * @member CKEDITOR.plugins.a11ychecker
	 * @param {Object} title Title localization object. Eg.
	 *
	 *		{
	 *			en: 'foo',
	 *			'fr': 'bar'
	 *		}
	 *
	 * @param {Object} descr Description localization object.
	 * @param {String[]} path
	 * @param {Object} data Custom engine-provided data.
	 */
	function IssueDetails( title, descr, path, data ) {
		this.title = title;
		this.descr = descr;
		/**
		 * @todo: documment path property. Most likely it will require to create a custom type.
		 */
		this.path = path || [];
		this.data = data;
	}

	IssueDetails.prototype = {};
	IssueDetails.prototype.constructor = IssueDetails;

	return IssueDetails;
} );