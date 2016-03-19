/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * A base interface for Accessibility checking engines.
	 *
	 * Each class deriving from `Engine` class must implement {@link #process} and
	 * {@link #getIssueDetails} methods.
	 *
	 * Custom classes might also override {@linnk #getFix} and {@link #getFixType}
	 * methods, if the default behaviour is not suitable.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.Engine
	 * @constructor
	 */
	function Engine() {
	}

	Engine.prototype = {
		/**
		 * Provides a mapping {@link CKEDITOR.plugins.a11ychecker.Issue#id} and a
		 * {@link CKEDITOR.plugins.a11ychecker.quickFix.Base} deriving type name.
		 *
		 *		EngineType.prototype.fixesMapping = {
		 *			'imgHasAlt': [ 'ImgAlt' ],
		 *			'<issueId>': [ '<fixClass>' ]
		 *		}
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Engine
		 * @property {Object} fixesMapping
		 */
		fixesMapping: {},
		/**
		 * Config object returned by {@link #createConfig} method.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Engine
		 */
		config: {}
	};

	Engine.prototype.constructor = Engine;

	/**
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {Function[]} fixes Object containing loaded QuickFix types.
	 * @static
	 */
	Engine.fixes = {};

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
	 * This method uses {@link #_filterIssue} to filter unwelcome issute.
	 *
	 * Note: Engine implementer is responsible for calling `filterIssues` in {@link #process} method.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
	 */
	Engine.prototype.filterIssues = function( issueList, contentElement ) {
		if ( this._filterIssue ) {
			var that = this,
				// We need to wrap _filterIssue, so that contentElement argument will be included.
				wrapped = function( issue ) {
					return that._filterIssue.call( that, issue, contentElement );
				};

			issueList.filter( wrapped );
		}
	};

	/**
	 * Used to obtain issues {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
	 * might be asynchronous.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object which details should be fetched.
	 * @param {Function} callback Callback to be called with {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object as a parameter.
	 */
	Engine.prototype.getIssueDetails = function( issue, callback ) {
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {String} fixClass A QuickFix class name to be loaded.
	 * @param {Function} callback Gets called when given QuickFix class is loaded.
	 * @static
	 * @todo: Check if this method is needed - looks like it's not used anymore, especially that it uses
	 * amd. We should use {@link #getFixes} method instead.
	 */
	Engine.getFixType = function( fixClass, callback ) {
		if ( Engine.fixes[ fixClass ] ) {
			// Requested QuickFix type was already cached, so lets return it without
			// using amd.
			if ( callback ) {
				callback( Engine.fixes[ fixClass ] );
			}
		} else {
			// Lets do a request for given type.
			require( [ 'quickfix/' + fixClass ], function( quickFixType ) {
				// Having the type we can store it and return via callback.
				Engine.fixes[ fixClass ] = quickFixType;

				if ( callback ) {
					callback( quickFixType );
				}
			} );
		}
	};

	/**
	 * Finds array of matching QuickFix instances for a given `issue` and returns it to
	 * `callback`.
	 *
	 * If no matching QuickFixes are found, `callback` will be called with an empty array.
	 *
	 * This method uses {@link #fixesMapping} to determine which fixes belongs to a
	 * given issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
	 * @param {Function} callback Callback to be called when QuickFix objects are ready. It gets
	 * one argument, that's array of {@link CKEDITOR.plugins.a11ychecker.quickFix.Base} instances
	 * bound to the issue.
	 */
	Engine.prototype.getFixes = function( issue, callback, langCode ) {

		var mappingValue = this.fixesMapping[ issue.id ];

		if ( !mappingValue || !mappingValue.length ) {
			callback( [] );
		} else {
			var matchedQuickFixes = [],
				onQuickFixCreated = function( quickFixInstance ) {
					matchedQuickFixes.push( quickFixInstance );

					if ( matchedQuickFixes.length === mappingValue.length ) {
						callback( matchedQuickFixes );
					}
				},
				i;
			// We need to fetch every QuickFix type.
			for ( i = 0; i < mappingValue.length; i++ ) {
				CKEDITOR.plugins.a11ychecker.quickFixes.getInstance( {
					name: mappingValue[ i ],
					callback: onQuickFixCreated,
					issue: issue,
					langCode: langCode
				} );
			}
		}

	};

	/**
	 * This method will return a config object. It will also check editor config if it has some customization to the
	 * config.
	 *
	 * @param {CKEDITOR.editor} editor
	 * @returns {Object}
	 */
	Engine.prototype.createConfig = function( editor ) {
		return {};
	};

	/**
	 * A function used to filter out unwanted issues before they will be returned to the
	 * {@link CKEDITOR.plugins.a11ychecker.Controller}. If `null` nothing will be filtered.
	 *
	 * Function gets following parameters:
	 * * The {@link CKEDITOR.plugins.a11ychecker.Issue} instance.
	 * * {@link CKEDITOR.dom.element} DOM object of container where issue was found.
	 *
	 * Should return `true` if issue is desired or `false` if issue should be removed.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @protected
	 * @type {Function/null}
	 */
	Engine.prototype._filterIssue = null;

	return Engine;
} );
