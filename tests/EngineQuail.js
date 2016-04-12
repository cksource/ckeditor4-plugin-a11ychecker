/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,sourcearea */
/* bender-include: %TEST_DIR%_assets/jquery.min.js, %TEST_DIR%_helpers/quail/228_collection.js */

( function() {
	'use strict';

	bender.require( [
		'IssueList',
		'Issue',
		'IssueDetails',
		'EngineQuail',
		'EngineQuailConfig',
		'mocking'
	], function(
		IssueList,
		Issue,
		IssueDetails,
		EngineQuail,
		EngineQuailConfig,
		mocking
	) {
		bender.editor = {};

		bender.test( {
			setUp: function() {
				// We need to replace CKEDITOR.dom.element method, sicne it's used in
				// EngineQuail.addIssuesFromTest to create a originalElement property.

				// Since the fixture in 228_collection.js contains string fixtures like
				// "[object HTMLImageElement]" we need to replace CKEDITOR.dom.element.
				// Otherwise it throw exceptions.
				this.originalDomElement = CKEDITOR.dom.element;
				CKEDITOR.dom.element = function( param ) {
					this.param = param;
				};
			},

			tearDown: function() {
				// Restore original CKEDITOR.dom.element implementation.
				CKEDITOR.dom.element = this.originalDomElement;
			},

			'test EngineQuail.getIssuesFromCollection': function() {
				var engineMockup = new EngineQuail(),
					collectionMockup = getQuailCollectionMockup(),
					ret;

				ret = engineMockup.getIssuesFromCollection( collectionMockup, this.editor );

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

				engineMockup.getIssuesFromCollection( collectionMockup, this.editor );

				var keys = CKEDITOR.tools.objectKeys( engineMockup.issueDetails ),
					// It should not contain "scriptsDoNotUseColorAlone", since it's marked as passing.
					expectedKeys = [ 'aAdjacentWithSameResourceShouldBeCombined',
						'aMustHaveTitle',
						'documentAcronymsHaveElement',
						'imgHasAlt',
						'skipToContentLinkProvided'
					];

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
					ret;

				// Because issueDetails property is shared by prototype, we need to overwrite it,
				// because we don't want to other tests mess this one.
				engineMockup.issueDetails = {};

				ret = engineMockup.getIssueDetailsFromTest( collectionMockup[ 3 ], this.editor );

				assert.isInstanceOf( IssueDetails, ret, 'ret has a valid type' );
				// Checking guideline path.
				assert.areSame( 'WCAG2.0/1.1.1/F65,H37', ret.path.join( '/' ), 'ret has a valid path' );
			},

			'test EngineQuail.getIssueDetailsFromTest localization': function() {
				// We'll mock editor so that `sp` lang is preferred, so all sp properties
				// should be transfered to the title and descr property.
				var getVars = {
						title: {
							en: 'foo',
							nl: 'bar',
							sp: 'baz'
						},
						description: {
							en: 'desc1',
							nl: 'desc2',
							sp: 'desc3'
						},
						guidelines: {}
					},
					testObject = {
						get: function( name ) {
							return getVars[ name ];
						}
					},
					editor = {
						config: {
							language: 'sp',
							defaultLanguage: 'it'
						}
					},
					ret;

				ret = EngineQuail.prototype.getIssueDetailsFromTest( testObject, editor );

				assert.areSame( 'baz', ret.title, 'title' );
				assert.areSame( 'desc3', ret.descr, 'description' );
			},

			'test EngineQuail.getIssueDetailsFromTest missing localization': function() {
				// We need to ensure that nothing will break if there is no title.
				var testObject = {
						get: function( name ) {
							if ( name == 'guidelines' ) {
								return {};
							}
							return undefined;
						}
					},
					ret;

				ret = EngineQuail.prototype.getIssueDetailsFromTest( testObject, this.editor );

				assert.areSame( 'undefined', ret.title, 'title' );
				assert.areSame( 'undefined', ret.descr, 'description' );
			},

			'test EngineQuail.addIssuesFromTest': function() {
				var list = new IssueList(),
					test = getQuailTest(),
					engineMockup = {
						isValidTestCase: sinon.stub().returns( true )
					};

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
				assert.isInstanceOf( CKEDITOR.dom.element, firstItem.originalElement, 'originalElement type' );
				assert.areSame( test[ 0 ].attributes.element, firstItem.originalElement.param,
					'Item 0 has a valid originalElement' );
				assert.areSame( test.attributes.testability, firstItem.testability, 'Item 0 has a valid testability' );
				assert.isNull( firstItem.element, 'Item 0 has a valid element' );

				// Checking second item.
				assert.isInstanceOf( Issue, secondItem, 'Item 1 has a valid type' );
				assert.areSame( engineMockup, secondItem.engine, 'Issue should have engine object assinged' );
				assert.areSame( test.get( 'name' ), secondItem.id, 'Item 1 has a valid issue type' );
				assert.areSame( test[ 1 ].attributes.element, secondItem.originalElement.param,
					'Item 1 has a valid originalElement' );
				assert.areSame( test.attributes.testability, secondItem.testability, 'Item 1 has a valid testability' );
				assert.isNull( secondItem.element, 'Item 1 has a valid element' );
			},

			'test EngineQuail.isValidTestCase - null': function() {
				var test = {
					attributes: {
						element: null
					}
				};

				assert.isFalse( EngineQuail.prototype.isValidTestCase( test ), 'Invalid return value' );
			},

			'test EngineQuail.isValidTestCase - string': function() {
				var test = {
					attributes: {
						element: null
					}
				};

				assert.isFalse( EngineQuail.prototype.isValidTestCase( test ), 'Invalid return value' );
			},

			'test EngineQuail.isValidTestCase - element no parent': function() {
				var test = {
					attributes: {
						element: document.createElement( 'div' )
					}
				};

				assert.isFalse( EngineQuail.prototype.isValidTestCase( test ), 'Invalid return value' );
			},

			'test EngineQuail.isValidTestCase - existing element': function() {
				var test = {
					attributes: {
						// Lets simply use body element, since it's still an element.
						element: document.body
					}
				};

				assert.isTrue( EngineQuail.prototype.isValidTestCase( test ), 'Invalid return value' );
			},

			'test EngineQuail._filterIssue': function() {
				var iteration = 0,
					engineMock = {
						_filterIssue: EngineQuail.prototype._filterIssue
					},
					assertFilterResult = function( expectedReturn, issue ) {
						expectedReturn = !!expectedReturn;

						assert.areSame( expectedReturn, engineMock._filterIssue( issue ),
							'Invalid return value for iteration #' + iteration );
						iteration += 1;
					};

				// For this particular test we need to restore original CKEDITOR.dom.element
				// implementation.
				CKEDITOR.dom.element = this.originalDomElement;

				assertFilterResult( true, { originalElement: CKEDITOR.document.createElement( 'a' ) } );
				assertFilterResult( false, { originalElement: null } );
				assertFilterResult( false, {} );
				// For the time being we don't want to accept documents.
				assertFilterResult( false, { originalElement: CKEDITOR.document } );
				// Nor text nodes.
				assertFilterResult( false, { originalElement: CKEDITOR.document.createText( 'asd' ) } );
				// Quail tends to give a string as a issue element in aLinkTextDoesNotBeginWithRedundantWord.
				assertFilterResult( false, { originalElement: 'foo' } );

				assertFilterResult( false, { originalElement: new CKEDITOR.dom.element( undefined ) } );
				assertFilterResult( false, { originalElement: new CKEDITOR.dom.element( null ) } );
				assertFilterResult( false, { originalElement: new CKEDITOR.dom.element( window.document ) } );

				// Elements which are not children of editable, should be filtered out.
				assertFilterResult( false, { originalElement: CKEDITOR.document.getById( 'playground2' ) } );
			},

			'test config.a11ychecker_quailParams': function() {
				var a11ychecker = {
						editor: this.editor
					},
					customConfig = {
						foo: 'bar',
						baz: 'bom',
						// Overriding testCollectionComplete is not allowed, so
						// this value should not be used.
						testCollectionComplete: 'foo'
					},
					engineMock = {
						config: {
							guideline: [ 'foo', 'bar' ]
						}
					},
					// Lets replace jQuery for a mock which will return an imitation of quail function.
					// This function will assert parameters given to the Quail.
					revert = bender.tools.replaceMethod( window, 'jQuery', function() {
						return {
							quail: function( params ) {
								assert.areSame( 'bar', params.foo, 'Quail config.foo was not changed' );
								assert.areNotSame( 'foo', params.testCollectionComplete,
									'Quail config.testCollectionComplete has been changed' );
								assert.areSame( engineMock.config.guideline, params.guideline,
									'Quail config.guideline was not changed' );

							}
						};
					} );

				try {
					this.editor.config.a11ychecker_quailParams = customConfig;

					// Assertions are placed in jQuery().quail function.
					EngineQuail.prototype.process.call( engineMock, a11ychecker, CKEDITOR.document.getBody() );
				} catch ( e ) {
					throw e;
				} finally {
					// In any case clean up modifications.
					delete this.editor.config.a11ychecker_quailParams;
					revert();
				}
			},

			'test createConfig': function() {
				var ret = EngineQuail.prototype.createConfig.call( {}, this.editor );
				assert.isInstanceOf( EngineQuailConfig, ret, 'Return val type' );
			},

			'test createConfig considers custom config': function() {
				var editor = {},
					customGuideline = [ 'a', 'b', 'c' ],
					protoGuideline = EngineQuailConfig.prototype.guideline,
					ret;

				mocking.mockProperty( 'config.a11ychecker_quailParams.guideline', editor, customGuideline );

				ret = EngineQuail.prototype.createConfig.call( {}, editor );

				assert.areSame( ret.guideline, customGuideline, 'ret.guideline' );
				assert.areSame( EngineQuailConfig.prototype.guideline, protoGuideline,
					'EngineQuailConfig prototype guideline array was not changed' );
			},

			'test integration': function() {
				// A real Quail request.
				// Here Quail seems to work asynchronously, so we need to use wait, resume.

				// For this particular test we need to restore original CKEDITOR.dom.element
				// implementation.
				CKEDITOR.dom.element = this.originalDomElement;

				var engine = new EngineQuail( this.editor.plugins.a11ychecker ),
					a11ycheckerMockup = {
						editor: this.editor
					},
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

				engine.config = engine.createConfig( this.editor );

				engine.process( a11ycheckerMockup, contentElement, callback );

				wait();
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
