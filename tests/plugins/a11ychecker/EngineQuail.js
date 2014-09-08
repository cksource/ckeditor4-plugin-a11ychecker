/* bender-tags: editor,unit */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js, %TEST_DIR%_helpers/quail/228_collection.js, %TEST_DIR%_assets/jquery.min.js, %TEST_DIR%_assets/quail/2.2.8/dist/quail.jquery.js */

( function() {
	'use strict';

	require( [ 'EngineQuail', 'IssueList', 'Issue', 'IssueDetails' ], function( EngineQuail, IssueList, Issue, IssueDetails ) {
		// Common options for Quail engine.
		var options = {
			jsonPath: '%TEST_DIR%_assets/quail/2.2.8/dist'
		};

		bender.test( {
			'test integration': function() {
				// A real Quail request.
				// Quail seems to work synchronously, so we don't need to use
				// wait() resume()
				var engine = new EngineQuail( options ),
					a11ycheckerMockup = {},
					contentElement = CKEDITOR.document.getById( 'quailMarkupSource' ),
					callbackCalled = 0,
					callback = function( list ) {
						callbackCalled += 1;

						resume( function() {
							assert.areSame( 1, callbackCalled, 'Callback calls count' );
							assert.isInstanceOf( IssueList, list, 'List object has a valid type' );
							assert.areNotEqual( 0, list.count(), 'Results are not empty' );
						} );
					};

				engine.process( a11ycheckerMockup, contentElement, callback );

				wait( 2000 );
			},

			'test EngineQuail.getIssuesFromCollection': function() {
				var engineMockup = new EngineQuail(),
					collectionMockup = getQuailCollectionMockup(),
					ret;

				ret = engineMockup.getIssuesFromCollection( collectionMockup );

				assert.isInstanceOf( IssueList, ret, 'Return value has a valid type' );
			},

			'test EngineQuailOld.getIssuesFromCollection stores issue details': function() {
				// Checks if method recognizes and fills issue details objects, based on given
				// collection.
				var engineMockup = new EngineQuail(),
					collectionMockup = getQuailCollectionMockup();

				// Because issueDetails property is shared by prototype, we need to overwrite it,
				// because we don't want to other tests mess this one.
				engineMockup.issueDetails = {};

				engineMockup.getIssuesFromCollection( collectionMockup );

				var keys = CKEDITOR.tools.objectKeys( engineMockup.issueDetails ),
					// It should not contain "scriptsDoNotUseColorAlone", since it's marked as passing.
					expectedKeys = [ 'aAdjacentWithSameResourceShouldBeCombined', 'aMustHaveTitle', 'documentAcronymsHaveElement', 'imgHasAlt', 'skipToContentLinkProvided' ];

				assert.areNotEqual( 0, keys.length, 'engineMockup.issueDetails obj should not be empty' );
				bender.arrayAssert.itemsAreEqual( expectedKeys, keys, 'Keys matches' );

				// Checking one of the entries.
				var imgAltIssue = engineMockup.issueDetails.imgHasAlt;

				assert.isInstanceOf( IssueDetails, imgAltIssue, 'engine.issueDetails items have a valid type' );
			},

			'test EngineQuail.getIssueDetailsFromTest': function() {
				// Checks if method recognizes and fills issue details objects, based on given
				// collection.
				var engineMockup = new EngineQuail(),
					collectionMockup = getQuailCollectionMockup(),
					// We'll use "imgHasAlt" test from our fixture.
					examinedTest = collectionMockup[ 3 ],
					// Helper variable, directly to attribute property.
					examinedTestAttributes = examinedTest.attributes,
					ret;

				// Because issueDetails property is shared by prototype, we need to overwrite it,
				// because we don't want to other tests mess this one.
				engineMockup.issueDetails = {};

				ret = engineMockup.getIssueDetailsFromTest( collectionMockup[ 3 ] );

				assert.isInstanceOf( IssueDetails, ret, 'ret has a valid type' );
				// Checking properties.
				assert.areSame( examinedTestAttributes.title, ret.title, 'ret has a valid title' );
				assert.areSame( examinedTestAttributes.description, ret.descr, 'ret has a valid description' );
				assert.areSame( 'WCAG2.0/1.1.1/F65,H37', ret.path.join( '/' ), 'ret has a valid path' );
			},

			'test EngineQuail.addIssuesFromTest': function() {
				var list = new IssueList(),
					test = getQuailTest(),
					engineMockup = {};

				EngineQuail.prototype.addIssuesFromTest.call( engineMockup, test, list );

				// Only 2 items should be added, because third have status=passed.
				assert.areEqual( 2, list.count(), 'List count increased' );

				// Assigning items.
				var firstItem = list.getItem( 0 ),
					secondItem = list.getItem( 1 );

				// Checking first item.
				assert.isInstanceOf( Issue, firstItem, 'Item 0 has a valid type' );
				assert.areSame( engineMockup, firstItem.engine, 'Issue should have engine object assinged' );
				assert.areSame( test.get( 'name' ), firstItem.id, 'Item 0 has a valid issue type' );
				assert.areSame( test[ 0 ].attributes.element, firstItem.element, 'Item 0 has a valid element' );
				assert.areSame( test.attributes.testability, firstItem.testability, 'Item 0 has a valid testability' );

				// Checking second item.
				assert.isInstanceOf( Issue, secondItem, 'Item 1 has a valid type' );
				assert.areSame( engineMockup, secondItem.engine, 'Issue should have engine object assinged' );
				assert.areSame( test.get( 'name' ), secondItem.id, 'Item 1 has a valid issue type' );
				assert.areSame( test[ 1 ].attributes.element, secondItem.element, 'Item 1 has a valid element' );
				assert.areSame( test.attributes.testability, secondItem.testability, 'Item 1 has a valid testability' );
			}

		} );

		/**
		 * Returns Quails "imgHasAlt" Test object.
		 */
		function getQuailTest() {
			return getQuailCollectionMockup()[ 3 ];
		}

	} );
} )();