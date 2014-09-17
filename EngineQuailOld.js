
define( [ 'Engine', 'IssueList', 'Issue', 'IssueDetails', 'jquery', 'Quail2.2.1' ], function( Engine, IssueList, Issue, IssueDetails, jQuery, Quail ) {
	/**
	 * Engine driver class for old Quail (http://quailjs.org/) 2.2.1 implementation.
	 *
	 * @constructor
	 */
	function EngineQuailOld( options, plugin ) {
		options = options || {};

		var pluginBasePath = plugin ? plugin.path : '';

		if ( options.jsonPath ) {
			this.jsonPath = pluginBasePath + options.jsonPath;
		} else {
			/**
			 * @todo: change default value 'bower_components/quail/dist/' to something more generic.
			 */
			this.jsonPath = pluginBasePath + 'bower_components/quail/dist/';
		}
	}

	EngineQuailOld.prototype = new Engine();
	EngineQuailOld.prototype.constructor = EngineQuailOld;

	EngineQuailOld.prototype.fixesMapping = {
		'imgHasAlt': [ 'ImgAlt'/*, 'ElementRemove'*/ ]
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
	 * **Very important:** This object is shared across all the EngineQuailOld instances!
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuailOld
	 * @type {CKEDITOR.plugins.a11ychecker.IssueDetails[]}
	 */
	EngineQuailOld.prototype.issueDetails = {};

	/**
	 * Performs accessibility checking for the current editor content.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuailOld
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
	 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
	 * @param {Function} callback
	 */
	EngineQuailOld.prototype.process = function( a11ychecker, contentElement, callback ) {
		var $ = jQuery,
			that = this;

		// Calls quail.
		var quailConfig = {
			guideline : [ 'imgHasAlt', 'aMustNotHaveJavascriptHref', 'aAdjacentWithSameResourceShouldBeCombined', 'pNotUsedAsHeader' ],
			//guideline : 'wcag',
			jsonPath : this.jsonPath,
			// Causes total.results to be new in each call.
			reset: true,
			complete: function( total ) {
				var results = total.results,
					issueList = that.getIssuesFromResults( results );

				if ( callback ) {
					callback( issueList );
				}
			}
		};

		$( contentElement.$ ).quail( quailConfig );
	};

	/**
	 * Transforms Quail `results` to IssuesList object.
	 *
	 *		$( elem ).quail( {
	 *			// (...)
	 *			complete: function( total ) {
	 *				engine.getIssuesFromResults( total.results );
	 *			}
	 *		} );
	 *
	 * @param {Object} results Results property of total parameter given to Quail complete callback.
	 * @returns {CKEDITOR.a11ychecker.plugins.IssuesList} Issues list.
	 */
	EngineQuailOld.prototype.getIssuesFromResults = function( results ) {
		var ret = new IssueList(),
			curResult,
			newIssue;

		for ( var i in results ) {
			curResult = results[ i ];

			if ( curResult.elements.length ) {
				// At least one issue occured.

				if ( !this.issueDetails[ i ] ) {
					// This type of issue is not yet known, we might store its information here.
					this.issueDetails[ i ] = EngineQuailOld.QuailTestToIssueDetails( curResult.test );
				}

				for ( var j = 0; j < curResult.elements.length; j++ ) {
					newIssue = new Issue( {
						id: i,
						// Assigning element from the temp wrapper ( a.k.a. scratchpad ). Note this is not an element
						// in the editor.
						// Also casting jQuery to CKEDITOR.dom.element.
						originalElement: new CKEDITOR.dom.element( curResult.elements[ j ][ 0 ] ),
						testability: curResult.test.testability
					}, this );

					ret.addItem( newIssue );
				}
			}
		}

		return ret;
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
	EngineQuailOld.prototype.getIssueDetails = function( issue, callback ) {
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
	EngineQuailOld.QuailTestToIssueDetails = function ( test ) {
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

	/**
	 * This mehtod is used solely in tests to replace jQuery with a lightweight object.
	 *
	 * @private
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuailOld
	 */
	EngineQuailOld.__setJQuery = function( newVal ) {
		jQuery = newVal;
	};

	/**
	 * This mehtod is used solely in tests to get jQuery object.
	 *
	 * @private
	 * @member CKEDITOR.plugins.a11ychecker.EngineQuailOld
	 */
	EngineQuailOld.__getJQuery = function( newVal ) {
		return jQuery;
	};

	return EngineQuailOld;
} );