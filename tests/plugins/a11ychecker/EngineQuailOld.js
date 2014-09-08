/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js, %TEST_DIR%_helpers/quail/211_response.js, /apps/ckeditor/plugins/a11ychecker/bower_components/quail/lib/jquery/jquery.js, /apps/ckeditor/plugins/a11ychecker/bower_components/quail/dist/quail.jquery.js */

( function() {
	'use strict';

	require( [ 'EngineQuailOld', 'IssueList', 'Issue', 'IssueDetails' ], function( EngineQuailOld, IssueList, Issue, IssueDetails ) {
		// Common options for Quail engine.
		var options = {
			jsonPath: '/apps/ckeditor/plugins/a11ychecker/bower_components/quail/dist'
		};

		bender.test( {
			'test EngineQuailOld.getIssuesFromResults': function() {
				var mockResp = getQuailFailedResponse(),
					engine = new EngineQuailOld(),
					list = engine.getIssuesFromResults( mockResp.results );

				assert.isInstanceOf( IssueList, list, 'Returned value has valid type' );
				assert.areSame( 3, list.count(), 'IssueList count is valid' );

				// Ensure that list contains Issue instances.
				assert.isInstanceOf( Issue, list.getItem( 0 ), 'First item has expected type' );

				// Now lets check each Issue, if they point to a proper element.
				var wrapper = CKEDITOR.document.getById( 'quailMarkupSource' );

				// First issue is: 2 adjacent links having the same href.
				assert.areSame( wrapper.findOne( 'a' ), list.getItem( 0 ).originalElement, 'Invalid originalElement for 0-index item' );
				assert.areSame( 1, list.getItem( 0 ).testability, '0-index item has testability assigned' );
				assert.areSame( engine, list.getItem( 0 ).engine, '0-index item has valid engine' );
				assert.areSame( null, list.getItem( 0 ).element, 'Invalid element for 0-index item' );

				// Second issue is: missing alt for first img.
				assert.areSame( wrapper.findOne( 'img' ), list.getItem( 1 ).originalElement, 'Invalid element for 1-index item' );
				assert.areSame( 1, list.getItem( 1 ).testability, '1-index item has testability assigned' );
				assert.areSame( null, list.getItem( 1 ).element, 'Invalid element for 1-index item' );

				// Third issue is: missing alt for second img.
				// Note: getItem( 1 ) is not a bug, because it's 0 indexed, meaning second image.
				assert.areSame( wrapper.find( 'img' ).getItem( 1 ), list.getItem( 2 ).originalElement, 'Invalid element for 2-index item' );
				assert.areSame( 1, list.getItem( 2 ).testability, '2-index item has testability assigned' );
				assert.areSame( null, list.getItem( 2 ).element, 'Invalid element for 2-index item' );
			},

			'test EngineQuailOld.getIssuesFromResults stores issue details': function() {
				var mockResp = getQuailFailedResponse(),
					engine = new EngineQuailOld(),
					detailKeys;

				engine.getIssuesFromResults( mockResp.results );

				detailKeys = CKEDITOR.tools.objectKeys( engine.issueDetails );

				bender.arrayAssert.itemsAreEqual( [ 'aAdjacentWithSameResourceShouldBeCombined', 'imgHasAlt' ], detailKeys, 'engine.details keys are valid' );

				assert.isInstanceOf( IssueDetails, engine.issueDetails.imgHasAlt, 'engine.details member has a valid type' );
			},

			'test EngineQuailOld.QuailTestToIssueDetails': function() {
				var testMock = {
					selector: "img:not(img[alt])",
					tags: [ "image", "content" ],
					testability: 1,
					type: "selector",
					guidelines: {
						508: [ "a" ],
						wcag: {
							"1.1.1": {
								techniques: [ "F65", "H37" ]
							}
						}
					},
					title: {
						en: "Image elements must have an \"alt\" attribute"
					},
					description: {
						en: "All <code>img</code> elements must have an alt attribute"
					}
				};

				var ret = EngineQuailOld.QuailTestToIssueDetails( testMock );

				assert.isInstanceOf( IssueDetails, ret, 'Return value has a valid type' );
				assert.areSame( testMock.title, ret.title, 'Ret value has a valid title' );
				assert.areSame( testMock.description, ret.descr, 'Ret value has a valid description' );

				// Check if path was correctly resolved (this is likely going to chagne).
				arrayAssert.itemsAreEqual( [ 'WCAG2.0', '1.1.1', 'F65,H37' ], ret.path, 'Ret has a valid path' );
			},

			'test EngineQuailOld.getIssueDetails': function() {
				var engine = new EngineQuailOld( options ),
					issueMockup = {
						id: 'foo'
					},
					issueDetailsDictionary = {
						'bar': {},
						'foo': {}
					},
					callbackCalled = 0,
					callback = function( result ) {
						callbackCalled += 1;
						assert.areSame( issueDetailsDictionary.foo, result, 'Callback has a valid parameter' );
					};

				// Lets overwrite whole issueDetails property, if we don't do that,
				// we'd modify EngineQuailOld.prototype.issueDetails. So every other
				// instance would be messed.
				engine.issueDetails = issueDetailsDictionary;

				engine.getIssueDetails( issueMockup, callback );

				assert.areSame( 1, callbackCalled, 'Callback calls count' );
			},

			'test EngineQuailOld.getIssueDetails invalid details': function() {
				// Lets request for non-existent details.
				// It should not cause exceptions, and do a callback with undefined.
				var engine = new EngineQuailOld( options ),
					issueMockup = {
						id: 'foo-bar'
					},
					callbackCalled = 0,
					callback = function( result ) {
						callbackCalled += 1;
						assert.isUndefined( result, 'Callback has a valid parameter' );
					};

				engine.getIssueDetails( issueMockup, callback );

				assert.areSame( 1, callbackCalled, 'Callback calls count' );
			},

			'test EngineQuailOld.process': function() {
				// We'll replace jQuery object here, just to avoid extra overhead,
				// and calling real Quail.
				var originJquery = window.jQuery,
					engine = new EngineQuailOld( options ),
					a11ycheckerMockup = {},
					// Element which content should be tested.
					contentElement = CKEDITOR.document.getById( 'quailMarkupSource' ),
					// Callback calls count.
					callbackCalled = 0,
					// Last parameter of the callback.
					callbackParameter = null,
					// Callback to be called by the engine.process function.
					callback = function( param ) {
						callbackCalled += 1;
						callbackParameter = param;
					};

				try {
					// We need to assign quailMarkupSource, because getQuailFailedResponse uses window.jQuery,
					// which is about to be replaced.
					var quailFailedResp = getQuailFailedResponse();

					// Mockup jQuery to have only mocked Quail method, which will use
					// failure response mock.
					window.jQuery = function( param ) {
						return {
							quail: function( options ) {

								// "dispatch" complete callback.
								options.complete( quailFailedResp );

							}
						};
					};

					engine.process( a11ycheckerMockup, contentElement, callback );

					assert.areSame( 1, callbackCalled, 'Callback calls count' );
					assert.isInstanceOf( IssueList, callbackParameter, 'Callback parameter type' );
				} catch( e ) {
					// Propagate the exception.
					throw e;
				} finally {
					// Restore jQuery.
					window.jQuery = originJquery;
				}
			},

			'test integration': function() {
				// A real Quail request.
				// Quail seems to work synchronously, so we don't need to use
				// wait() resume()
				var engine = new EngineQuailOld( options ),
					a11ycheckerMockup = {},
					contentElement = CKEDITOR.document.getById( 'quailMarkupSource' ),
					callback = function( list ) {
						assert.isInstanceOf( IssueList, list, 'Callback is called with proper object type' );
						assert.areSame( 3, list.count(), 'List count' );
					};

				engine.process( a11ycheckerMockup, contentElement, callback );
			}
		} );

		function getQuailFailedResponse() {
			// Returns a Mockup of response given by Quail 2.1.1 to the HTML in #quailMarkupSource.

			// Lets first use generic, positive response from 211_response.js file.
			var ret = window.getQuailResultsMockup(),
				jqParent = jQuery('#quailMarkupSource');

			// And then modify it, so it will contain some errors.
			ret.totals.severe = 3;

			// Include failed elements jQuery objects.
			var results = ret.results;

			// 2 elems in imgHasAlt.
			results.imgHasAlt.elements = [ jqParent.find('img').first(), jqParent.find('img:eq(1)') ];

			// 1 elem in aAdjacentWithSameResourceShouldBeCombined.
			results.aAdjacentWithSameResourceShouldBeCombined.elements =
				[ jqParent.find( 'a[href="sameLink.htm"]:first' ) ];

			return ret;
		}

		window.getQuailFailedResponse = getQuailFailedResponse;
	} );
} )();