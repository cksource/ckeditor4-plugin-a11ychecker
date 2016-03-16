/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'Engine', 'IssueList', 'Issue', 'IssueDetails' ], function( Engine, IssueList, Issue, IssueDetails ) {
	'use strict';

	/**
	 * Engine driver working with fixtures only. Created for fast tests.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.EngineMock
	 * @constructor
	 */
	function EngineMock( options ) {
		options = options || {};
	}

	EngineMock.prototype = new Engine();
	EngineMock.prototype.constructor = EngineMock;

	EngineMock.prototype.fixesMapping = {};

	/**
	 * Object storing {@link CKEDITOR.plugins.a11ychecker.IssueDetails} instances.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineMock
	 * @type {CKEDITOR.plugins.a11ychecker.IssueDetails[]}
	 */
	EngineMock.prototype.issueDetails = {
		issue1: new IssueDetails( { en: 'title1' }, { en: 'descr1' } ),
		issue2: new IssueDetails( { en: 'title2' }, { en: 'descr2' } )
	};

	/**
	 * Performs accessibility checking for the current editor content.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineMock
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
	 * @param {Function} callback
	 */
	EngineMock.prototype.process = function( a11ychecker, contentElement, callback ) {
		function elementFilter( node ) {
			return node.type === CKEDITOR.NODE_ELEMENT;
		}

		var issues = new IssueList();

		// Create first issue.
		issues.addItem( new Issue( {
			originalElement: contentElement.getFirst( elementFilter ),
			testability: 1,
			id: 'issue1'
		}, this ) );

		// Create second issue.
		issues.addItem( new Issue( {
			originalElement: contentElement.getFirst( elementFilter ),
			testability: 1,
			id: 'issue2'
		}, this ) );

		callback( issues );
	};

	/**
	 * Used to obtain issues {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
	 * might be asynchronous.
	 *
	 * In case when no IssueDetail was found, `callback` will be called with `undefined` as a first argument.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object which details should be fetched.
	 * @param {Function} callback Callback to be called with {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object as a parameter.
	 */
	EngineMock.prototype.getIssueDetails = function( issue, callback ) {
		// In this case we have issue types available synchronously.
		callback( this.issueDetails[ issue.id ] );
	};

	return EngineMock;
} );
