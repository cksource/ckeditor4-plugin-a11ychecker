/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/* @exclude */
define( [
	'Engine',
	'IssueList',
	'Issue',
	'IssueDetails',
	'Quail',
	'EngineQuailConfig',
	'Localization'
], function(
	Engine,
	IssueList,
	Issue,
	IssueDetails,
	Quail,
	EngineQuailConfig,
	Localization
) {
	'use strict';
	/* @endexclude */

	/**
	 * Engine driver class for updated [Quail](http://quailjs.org/) 2.2.8 implementation.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @constructor
	 */
	function EngineQuail( plugin ) {
		this.jsonPath = ( plugin ? plugin.path : '' ) + 'libs/quail/';

		//this.config = this.createConfig();
	}

	EngineQuail.prototype = new Engine();
	EngineQuail.prototype.constructor = EngineQuail;

	/**
	 * @todo: Lets drop these types for the time being.
	 */
	EngineQuail.prototype.fixesMapping = {
		'imgHasAlt': [ 'ImgAlt' ],
		'imgImportantNoSpacerAlt': [ 'ImgAlt' ],
		'KINGUseLongDateFormat': [ 'DateUnfold' ],
		'aAdjacentWithSameResourceShouldBeCombined': [ 'AnchorsMerge' ],
		'imgAltNotEmptyInAnchor': [ 'ImgAlt' ],
		'imgAltIsDifferent': [ 'ImgAlt' ],
		'imgShouldNotHaveTitle': [ 'AttributeRenameDefault' ],
		'tableUsesCaption': [ 'AddTableCaption' ],
		'imgAltIsTooLong': [ 'ImgAlt' ],
		'pNotUsedAsHeader': [ 'ParagraphToHeader' ],
		'headerH1': [ 'ParagraphToHeader' ],
		'headerH2': [ 'ParagraphToHeader' ],
		'headerH3': [ 'ParagraphToHeader' ],
		'headerH4': [ 'ParagraphToHeader' ],
		'headerH5': [ 'ParagraphToHeader' ],
		'headerH6': [ 'ParagraphToHeader' ],
		'tableDataShouldHaveTh': [ 'TableHeaders' ],
		'imgWithEmptyAlt': [ 'ImgAltNonEmpty' ]
	};

	/**
	 * Object storing {@link CKEDITOR.plugins.a11ychecker.IssueDetails} instances. It uses
	 * Quail ID as keys.
	 *
	 *		{
	 *			imgHasAlt: <IssueDetails>,
	 *			aMustNotHaveJavascriptHref: <IssueDetails>
	 *		}
	 *
	 * **Very important:** This object is shared across all the EngineQuail instances!
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @type {CKEDITOR.plugins.a11ychecker.IssueDetails[]}
	 */
	EngineQuail.prototype.issueDetails = {};

	/**
	 * Performs accessibility checking for current editor content.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container whose content will be checked.
	 * @param {Function} callback
	 */
	EngineQuail.prototype.process = function( a11ychecker, contentElement, callback ) {
		var $ = window.jQuery,
			// Quail config, we'll have to override few options here.
			config = a11ychecker.editor.config.a11ychecker_quailParams || {},
			that = this,
			// Options to be overriden in config, as they are essential for us.
			quailConfigOverride = {
				/**
				 * @todo: Not sure if reset param is still needed in 2.2.8+ version.
				 */
				// Causes total.results to be new in each call.
				reset: true,
				guideline: this.config.guideline,
				// Method to be executed after Quail checking is complete.
				// It will extract the issues.
				testCollectionComplete: function( evtName, collection ) {
					var issueList = that.getIssuesFromCollection( collection, a11ychecker.editor );

					that.filterIssues( issueList, contentElement );

					if ( callback ) {
						callback( issueList );
					}
				}
			};

		CKEDITOR.tools.extend( config, quailConfigOverride, true );

		if ( !config.jsonPath ) {
			config.jsonPath = this.jsonPath;
		}

		// Execute Quail checking.
		$( contentElement.$ ).quail( config );
	};

	/**
	 * Transforms a Quail `collection` object (given to `testCollectionComplete` callback) into a
	 * {@link CKEDITOR.a11ychecker.plugins.IssuesList} object.
	 *
	 * @param {Object} collection
	 * @param {CKEDITOR.editor} editor
	 * @returns {CKEDITOR.a11ychecker.plugins.IssuesList}
	 */
	EngineQuail.prototype.getIssuesFromCollection = function( collection, editor ) {
		var ret = new IssueList(),
			that = this;

		collection.each( function( index, test ) {
			var testId = test.get( 'name' );

			if ( test.get( 'status' ) !== 'failed' ) {
				// We're wroking only with failed tests, all other can be skipped.
				return ;
			}

			if ( !that.issueDetails[ testId ] ) {
				// Test type is not known, so lets save its info.
				that.issueDetails[ testId ] = that.getIssueDetailsFromTest( test, editor );
			}

			that.addIssuesFromTest( test, ret );
		} );

		return ret;
	};

	/**
	 * Creates an `IssueDetails` object out of a Quail `Case` object.
	 *
	 * This function also requires an {@link CKEDITOR.editor} object, in order to determine preferred
	 * language for issue details.
	 *
	 * @todo: It makes sense to rename it to `getIssueDetailsFromCase()`.
	 *
	 * @param {Object} test A Quail `Case` instance.
	 * @param {CKEDITOR.editor} editor
	 * @returns {CKEDITOR.plugins.a11ychecker.IssueDetails}
	 */
	EngineQuail.prototype.getIssueDetailsFromTest = function( test, editor ) {
		var path = [],
			wcagGuideline = test.get( 'guidelines' ).wcag,
			successCriteria = wcagGuideline && CKEDITOR.tools.objectKeys( wcagGuideline )[ 0 ];
		/**
		 * @todo: Path logic is actually very similiar to the old interface, so it might be extracted
		 * to a common method.
		 */

		function getLocalizedString( dictionary, editorConfig ) {
			var langs = CKEDITOR.tools.objectKeys( dictionary ),
				preferredLang = Localization.getPreferredLanguage( editorConfig.language, editorConfig.defaultLanguage, langs );

			return String( dictionary[ preferredLang ] );
		}

		// Lets support WCAG only for the time being.
		if ( successCriteria ) {
			// Creating a path.
			path.push( 'WCAG2.0' );
			// Success Criteria.
			path.push( successCriteria );
			// Techniques.
			path.push( wcagGuideline[ successCriteria ].techniques.join( ',' ) );
		}

		var titleDictionary = test.get( 'title' ) || {},
			descriptionDictionary = test.get( 'description' ) || {};

		return new IssueDetails(
			getLocalizedString( titleDictionary, editor.config ),
			getLocalizedString( descriptionDictionary, editor.config ),
			path
		);
	};

	/**
	 * Extracts failed issues from a given Quail `Test` object and adds them to the `issueList` object.
	 *
	 * @param {Object} test Quail `Test` instance.
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList An issue list where failed issues will be added.
	 */
	EngineQuail.prototype.addIssuesFromTest = function( test, issueList ) {
		var that = this,
			testId = test.get( 'name' ),
			testability = test.get( 'testability' );

		test.each( function( index, testCase ) {
			if ( !that.isValidTestCase( testCase ) ) {
				return;
			}

			var testAttribs = testCase.attributes,
				newIssue;

			if ( testAttribs.status == 'failed' ) {
				newIssue = new Issue( {
					originalElement: new CKEDITOR.dom.element( testAttribs.element ),
					testability: testability,
					id: testId
				}, that );

				issueList.addItem( newIssue );
			}
		} );
	};

	/**
	 * Checks if given Quail `Test` is valid.
	 *
	 * @param {Object} test Quail `Test` instance.
	 * @returns {Boolean}
	 */
	EngineQuail.prototype.isValidTestCase = function( test ) {
		var el = test.attributes.element;

		return el instanceof HTMLElement && el.parentNode !== null;
	};

	/**
	 * Used to obtain issues' {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
	 * might be asynchronous.
	 *
	 * In case when no `IssueDetail` was found, `callback` will be called with `undefined` as the first argument.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object whose details should be fetched.
	 * @param {Function} callback Callback to be called with the {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object as a parameter.
	 */
	EngineQuail.prototype.getIssueDetails = function( issue, callback ) {
		// In this case we have issue types available synchronously.
		callback( this.issueDetails[ issue.id ] );
	};

	/**
	 * For comments see {@link CKEDITOR.plugins.a11ychecker.Engine#_filterIssue}.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @protected
	 */
	EngineQuail.prototype._filterIssue = function( issue, contentElement ) {
		var originalElement = issue.originalElement,
			originalElementPrivate;

		// If originalElement is undefined or anything other, filter out.
		if ( originalElement instanceof CKEDITOR.dom.element === false ) {
			return false;
		}

		originalElementPrivate = originalElement.$;

		// Ensure that private element has a valid type, because it's possible to create
		// a CKEDITOR.dom.element with a string etc.
		if ( !originalElementPrivate || !originalElementPrivate.tagName ) {
			return false;
		}

		return true;
	};

	/**
	 * This method will return a config object. It will also check editor config if it has some customization to the
	 * config.
	 *
	 * @param {CKEDITOR.editor} editor
	 * @returns {CKEDITOR.plugins.a11ychecker.EngineQuailConfig}
	 */
	EngineQuail.prototype.createConfig = function( editor ) {
		var ret = new EngineQuailConfig(),
			instanceQuailConfig = editor.config.a11ychecker_quailParams;

		if ( instanceQuailConfig && instanceQuailConfig.guideline ) {
			ret.guideline = instanceQuailConfig.guideline;
		}

		return ret;
	};

	/* @exclude */
	return EngineQuail;
} );
/* @endexclude */
