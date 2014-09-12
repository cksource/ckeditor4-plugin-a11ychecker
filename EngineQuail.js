
define( [ 'Engine', 'IssueList', 'Issue', 'IssueDetails', 'jquery', 'Quail' ], function( Engine, IssueList, Issue, IssueDetails, jQuery, Quail ) {

	/**
	 * Engine driver class for updated Quail (http://quailjs.org/) 2.2.8 implementation.
	 *
	 * @constructor
	 */
	function EngineQuail( options ) {
		options = options || {};

		this.jsonPath = options.jsonPath || 'dist';
	}

	EngineQuail.prototype = new Engine();
	EngineQuail.prototype.constructor = EngineQuail;

	EngineQuail.prototype.fixesMapping = {
		'imgHasAlt': [ 'ImgAlt' ],
		'imgImportantNoSpacerAlt': [ 'ImgAlt' ]
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
	 * Performs accessibility checking for the current editor content.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuail
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
	 * @param {Function} callback
	 */
	EngineQuail.prototype.process = function( a11ychecker, contentElement, callback ) {
		var $ = jQuery,
			that = this;

		// Calls quail.
		var quailConfig = {
			guideline : [ 'imgHasAlt', 'aMustNotHaveJavascriptHref', 'aAdjacentWithSameResourceShouldBeCombined', 'pNotUsedAsHeader', 'imgNonDecorativeHasAlt', 'imgImportantNoSpacerAlt' ],
			//guideline : 'wcag',
			jsonPath : this.jsonPath,
			/**
			 * @todo: Not sure if reset param is still needed in 2.2.8+ version.
			 */
			// Causes total.results to be new in each call.
			reset: true,
			// Method to be executed after Quail checking is complete.
			// It will extract the issues.
			testCollectionComplete: function( evtName, collection ) {
				var issueList = that.getIssuesFromCollection( collection );

				if ( callback ) {
					callback( issueList );
				}
			}
		};

		// Execute Quail checking.
		$( contentElement.$ ).quail( quailConfig );
	};

	/**
	 * Transforms Quail `collection` object (given to `testCollectionComplete` callback) to a
	 * {@link CKEDITOR.a11ychecker.plugins.IssuesList} object.
	 *
	 * @param {Object} collection
	 * @returns {CKEDITOR.a11ychecker.plugins.IssuesList}
	 */
	EngineQuail.prototype.getIssuesFromCollection = function( collection ) {
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
				that.issueDetails[ testId ] = that.getIssueDetailsFromTest( test );
			}

			that.addIssuesFromTest( test, ret );
		} );

		return ret;
	};

	/**
	 * Creates a `IssueDetails` object out of Quails `Case` object.
	 *
	 * @todo: It make sense to rename it to getIssueDetailsFromCase()
	 *
	 * @param {Object} test Quails `Case` instance.
	 * @returns {CKEDITOR.plugins.a11ychecker.IssueDetails}
	 */
	EngineQuail.prototype.getIssueDetailsFromTest = function( test ) {
		var path = [],
			wcagGuideline = test.get( 'guidelines' ).wcag,
			successCriteria = wcagGuideline && CKEDITOR.tools.objectKeys( wcagGuideline )[ 0 ];
		/**
		 * @todo: Path logic is actually very similiar to the old interface, so it might be extracted
		 * to a common method.
		 */

		// Lets support WCAG only for the time being.
		if ( successCriteria ) {
			// Creating a path.
			path.push( 'WCAG2.0' );
			// Success Criteria.
			path.push( successCriteria );
			// Techniques.
			path.push( wcagGuideline[ successCriteria ].techniques.join( ',' ) );
		}

		return new IssueDetails( test.get( 'title' ), test.get( 'description' ), path );
	};

	/**
	 * Extracts failed issues from given Quail `Test` object and add them to the `issueList` object.
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
	 * Used to obtain issues {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
	 * might be asynchronous.
	 *
	 * In case when no IssueDetail was found, `callback` will be called with `undefined` as a first argument.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object which details should be fetched.
	 * @param {Function} callback Callback to be called with {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
	 * object as a parameter.
	 */
	EngineQuail.prototype.getIssueDetails = function( issue, callback ) {
		// In this case we have issue types available synchronously.
		callback( this.issueDetails[ issue.id ] );
	};

	/**
	 * Static function to cast Quail test to IssueDetails instance.
	 *
	 * Exposed for testability.
	 *
	 * @param {Object} test Test object in Quail result object.
	 * @returns {IssueDetails}
	 */
	EngineQuail.QuailTestToIssueDetails = function ( test ) {
		// Lets support WCAG only for the time being.
		var path = [],
			wcagGuideline = test.guidelines.wcag,
			successCriteria = wcagGuideline && CKEDITOR.tools.objectKeys( wcagGuideline )[ 0 ];

		if ( successCriteria ) {
			// Creating a path.
			path.push( 'WCAG2.0' );
			// Success Criteria.
			path.push( successCriteria );
			// Techniques.
			path.push( wcagGuideline[ successCriteria ].techniques.join( ',' ) );
		}

		return new IssueDetails( test.title, test.description, path );
	};

	return EngineQuail;
} );