/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * IssueDetails instance contains more detailed information about the Issue,
	 * like a title, description.
	 *
	 * @since 4.6.0
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
