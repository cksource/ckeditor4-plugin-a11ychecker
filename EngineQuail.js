
define( [
	'Engine',
	'IssueList',
	'Issue',
	'IssueDetails',
	'Quail'
], function(
	Engine,
	IssueList,
	Issue,
	IssueDetails,
	Quail
) {
	'use strict';

	/**
	 * Engine driver class for updated [Quail](http://quailjs.org/) 2.2.8 implementation.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @constructor
	 */
	function EngineQuail( plugin ) {
		this.jsonPath = ( plugin ? plugin.path : '' ) + 'libs/quail/';
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
		'imgShouldNotHaveTitle': [ 'AttributeRename' ],
		'tableUsesCaption': [ 'AddTableCaption' ],
		'imgAltIsTooLong': [ 'ImgAlt' ]
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

		if ( !config.guideline ) {
			config.guideline = [
				'imgHasAlt',
				'aMustNotHaveJavascriptHref',
				'aAdjacentWithSameResourceShouldBeCombined',
				'imgNonDecorativeHasAlt',
				'imgImportantNoSpacerAlt',
				'KINGUseLongDateFormat',
				'aTitleDescribesDestination',
				'blockquoteNotUsedForIndentation',
				'imgAltNotEmptyInAnchor',
				'tableUsesCaption',
				'imgShouldNotHaveTitle',
				'imgAltIsTooLong',
				'pNotUsedAsHeader'
			];
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
				preferredLang = EngineQuail.getPreferredLanguage( editorConfig.language, editorConfig.defaultLanguage, langs );

			return dictionary[ preferredLang ];
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

		var titleDictionary = test.get( 'title' ),
			descriptionDictionary = test.get( 'description' );

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
	 * Returns a preferred language code, based on list in `languages` parameter.
	 *
	 *
	 * Language values are picked in following order:
	 *
	 * * preferredLanguage
	 * * navigator language
	 * * defaultLanguage
	 * * `'en'` literal as a last proposition
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @param {String} preferredLang Language to be preferrred over the browser language.
	 * @param {String} defaultLanguage A fallback language, used when neither `preferredLang`
	 * or browser language are not available.
	 * @param {Navigator} [navigator] Optinal navigator object, if not present will be picked
	 * from window object.
	 * @returns {String/null} Language code, or `null` if not found. Note that returned value
	 * will be always lowercased.
	 */
	EngineQuail.getPreferredLanguage = function( preferredLang, defaultLanguage, languages, navigator ) {
		navigator = navigator || window.navigator;

		var checkLangs = [ preferredLang, defaultLanguage, 'en' ],
			// RegExp used to split language locale.
			localeRegExp = /([a-z]+)(?:-([a-z]+))?/,
			navigatorLang = navigator.userLanguage || navigator.language,
			indexOf = CKEDITOR.tools.indexOf;

		if ( navigatorLang ) {
			// If navigatgor language is available insert it at 1 index,
			// after preferredLang.
			checkLangs.splice( 1, 0, navigatorLang );
		}

		// Iterating over all interesting possibilities.
		for ( var i = 0, len = checkLangs.length; i < len; i++ ) {
			if ( !checkLangs[ i ] ) {
				continue;
			}

			// Currently iterated language.
			var curLangCode = checkLangs[ i ].toLowerCase(),
				parts = curLangCode.match( localeRegExp ),
				lang = parts[ 1 ],
				locale = parts[ 2 ];

			if ( locale && indexOf( languages, curLangCode ) !== -1 ) {
				// First we want to see if lang in given locale is available.
				return curLangCode;
			} else if ( indexOf( languages, lang ) !== -1 ) {
				// Eventually lang without a locale might be available, which is OK too.
				return lang;
			}
		}

		return null;
	};

	/**
	 * For comments see {@link CKEDITOR.plugins.a11ychecker.EngineQuail#_filterIssue}.
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


	return EngineQuail;
} );