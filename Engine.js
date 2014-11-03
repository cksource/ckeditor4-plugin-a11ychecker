
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
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.Engine
	 * @constructor
	 */
	function Engine() {
	}

	Engine.prototype = {
		/**
		 * Provides a mapping {@link CKEDITOR.plugins.a11ychecker.Issue#id} and a
		 * {@link CKEDITOR.plugins.a11ychecker.quickfix.Base} deriving type name.
		 *
		 *		EngineType.prototype.fixesMapping = {
		 *			'imgHasAlt': [ 'ImgAlt' ],
		 *			'<issueId>': [ '<fixClass>' ]
		 *		}
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Engine
		 * @property {Object} fixesMapping
		 */
		fixesMapping: {}
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
			require( [ 'QuickFix/' + fixClass ], function( quickFixType ) {
				// Having the type we can store it and return via callback.
				Engine.fixes[ fixClass ] = quickFixType;

				if ( callback ) {
					callback( quickFixType );
				}
			} );
		}
	};

	/**
	 * Finds array of matching QuickFix for a given `issue` and returns it to
	 * `callback`.
	 *
	 * If no matching QuickFix types are found, `callback` will be called with
	 * empty array.
	 *
	 * This method uses {@link #fixesMapping} to determine which fixes belongs to a
	 * given issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Engine
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
	 * @param {Function} callback Callback to be called when types are ready. It gets
	 * one argument, that's array of {@link CKEDITOR.plugins.a11ychecker.quickfix.Base}
	 * objects bound to the issue.
	 *
	 * @todo: This function requires rewriting, for the time being it needs to do its
	 * task.
	 */
	Engine.prototype.getFixes = function( issue, callback ) {

		var mappingValue = this.fixesMapping[ issue.id ];

		if ( !mappingValue || !mappingValue.length ) {
			callback( [] );
		} else {
			var matchedTypes = [],
				i;
			// We need to fetch every QuickFix type.
			for ( i = 0; i < mappingValue.length; i++ ) {
				CKEDITOR.plugins.a11ychecker.quickFixes.get( mappingValue[ i ], function( type ) {
					matchedTypes.push( new type( issue ) );

					if ( matchedTypes.length === mappingValue.length ) {
						callback( matchedTypes );
					}
				} );
			}
		}

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