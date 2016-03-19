/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * Represents a single accessibility issue within content.
	 *
	 * This object contains only essential information about the issue, such as:
	 *
	 * * {@link #element}
	 * * {@link #id}
	 * * {@link #testability}
	 *
	 * By default it does not provide information like title, or description. These
	 * information are available using {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object returned by {@link #getDetails}.
	 *
	 * This allows Issue object to be more lightweight object.
	 *
	 * Note that one DOM element might cause multiple accessibility issues.
	 *
	 * @since 4.6.0
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

	/**
	 * Enumerates values for {@link CKEDITOR.plugins.a11ychecker.Issue#testability} property.
	 *
	 *		console.log( CKEDITOR.plugins.a11ychecker.Issue.testability.WARNING );
	 *		// Logs following number: 0.5
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Issue
	 * @static
	 * @readonly
	 */
	Issue.testability = {
		ERROR: 1,
		WARNING: 0.5,
		NOTICE: 0
	};

	Issue.prototype = {
		/**
		 * Keeps an information about testability of the issue.
		 *
		 * Possible values are enumerated in {@link CKEDITOR.plugins.a11ychecker.Issue.testability}.
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
		testability: Issue.testability.NOTICE,
		/**
		 * {@link CKEDITOR.editable} child element, which caused the issue.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.dom.element/null}
		 */
		element: null,
		/**
		 * Element pointed by the {@link CKEDITOR.plugins.a11ychecker.Engine} as an issue element.
		 *
		 * This **is not** the element inside CKEditor editable area. Instead it's a element in content
		 * duplication placed in elem returned by {CKEDITOR.plugins.a11ychecker.Controller#getTempOutput}
		 * (a.k.a. scratchpad).
		 *
		 * If you want to work on editable element, you should use {@link #element} instead.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {CKEDITOR.dom.element/null}
		 */
		originalElement: null,
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
		id: null,

		/**
		 * Internal property serving as a cache for {@link #isIgnored} method.
		 *
		 * @private
		 * @member CKEDITOR.plugins.a11ychecker.Issue
		 * @type {Boolean/null}
		 */
		_ignored: null
	};

	Issue.prototype.constructor = Issue;

	/**
	 * Changes the issue ignored status.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Issue
	 * @param {Boolean} isIgnored If `true` the issue will be marked as ignored.
	 */
	Issue.prototype.setIgnored = function( isIgnored ) {
		var dataVal = ( this.element.data( 'a11y-ignore' ) || '' ).split( ',' ),
			foundOffset;

		// Calling setIgnored should automatically invalidate cached _ignored value.
		this._ignored = null;

		if ( isIgnored ) {
			// Setting the ignored marker.
			if ( !dataVal[ 0 ] && dataVal.length === 1 ) {
				// In case when dataVal was empty we can simply override first array item.
				dataVal[ 0 ] = this.id;
			} else {
				dataVal.push( this.id );
			}
		} else {
			// And removing ignored state.
			while ( ( foundOffset = CKEDITOR.tools.indexOf( dataVal, this.id ) ) !== -1) {
				dataVal.splice( foundOffset, 1 );
			}
		}

		// The "|| false" is not a bug, it's supposed to provide a false if dataVal is empty, so
		// that data attribute is removed, rather than leaving junk.
		this.element.data( 'a11y-ignore', dataVal.join( ',' ) || false );
	};

	/**
	 * Checks if issue is marked as a ignored.
	 *
	 * Return value of this function is cached, if you need to refresh it all the time
	 * please use {@link #checkIgnored}.
	 *
	 * @returns {Boolean}
	 */
	Issue.prototype.isIgnored = function() {
		if ( this._ignored === null ) {
			this._ignored = this.checkIgnored();
		}

		return this._ignored;
	};

	/**
	 * Marks the issue as ignored.
	 */
	Issue.prototype.ignore = function() {
		this.setIgnored( true );
	};

	/**
	 * Inspects the {@link #element} to see if issue is ignored. It checks data
	 * attribute each time it's called.
	 *
	 * Consider using {@link #isIgnored} as a light-weight implementation.
	 *
	 * @returns {Boolean}
	 */
	Issue.prototype.checkIgnored = function() {
		var dataValue = this.element.data( 'a11y-ignore' ) || '';

		return CKEDITOR.tools.indexOf( dataValue.split( ',' ), this.id ) !== -1;
	};

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
