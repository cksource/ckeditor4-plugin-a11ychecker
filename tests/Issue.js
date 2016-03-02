/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */

( function() {
	'use strict';

	bender.require( [ 'Issue', 'mocking' ], function( Issue, mocking ) {
		bender.test( {
			'test constructor definition handling': function() {
				// Ensure that properties given in definition object, are assigned to the Issue.
				var issue = new Issue( {
					title: 'title',
					descr: 'descr',
					element: 'elem',
					testability: 0.5
				} );

				assert.areSame( 'title', issue.title );
				assert.areSame( 'descr', issue.descr );
				assert.areSame( 'elem', issue.element );
				assert.areSame( 0.5, issue.testability );
			},

			'test setting the engine': function() {
				// Issue should store reference to the a11y checking Engine.
				var engine = {},
					issue = new Issue( {}, engine );

				assert.areSame( engine, issue.engine, 'engine property points to Engine instance' );
			},

			'test Issue.getDetails': function() {
				// Issue.getDetails() should:
				// * call engine.getIssueDetails()
				// * call given callback, when it has its response from engine.getIssueDetails()
				var issue = getIssueMockup(),
					// Issue details object to be returned from the Engine object.
					issueDetails = {},
					// Counts how many times Engine.getIssueDetails was called.
					getIssueDetailsCalls = 0,
					// Counts how many times callback given to Issue.getDetails was called.
					callbackCalls = 0;

				// Manually set engine mockup, with getIssueDetails method.
				issue.engine = {
					getIssueDetails: function( requrestedIssue, callback ) {
						getIssueDetailsCalls += 1;

						// We pretend that we already have our details.
						callback( issueDetails );
					}
				};

				issue.getDetails( function( response ) {
					callbackCalls += 1;

					// Since it's synchronous resp, we can assert in callback.
					assert.areSame( issueDetails, response, 'Object given to callback should be issueDetails' );
				} );

				// Engine.getIssueDetails should be called to obtain IssueDetails.
				assert.areSame( 1, getIssueDetailsCalls, 'Engine.getIssueDetails have been called' );
				assert.areSame( 1, callbackCalls, 'Issue.getDetails callback should have been called once' );

				// Issue.details should reference to fetched IssueDetails object.
				assert.areSame( issueDetails, issue.details, 'Issue.details property should have been set' );
			},

			'test Issue.getDetails from saved reference': function() {
				// Now Issue.details will be already set, so it shouldn't calling IssueDetails.getIssueDetails()
				// method, and callback with stored value.
				var issue = getIssueMockup(),
					detailsObject = {},
					callbackCalls = 0;

				issue.details = detailsObject;
				// We'll intentionally change Issue.engine value, so it raises exception when any Engine method
				// is called.
				issue.engine = null;

				issue.getDetails( function( details ) {
					callbackCalls += 1;
					assert.areSame( detailsObject, issue.details );
				} );

				assert.areSame( 1, callbackCalls, 'Callback is called once' );
			},

			'test Issue.checkIgnored': function() {
				var issue = getIssueMockup(),
					element = {
						data: mocking.spy( function() {
							return 'foo';
						} )
					},
					ret;

				issue.id = 'foo';
				issue.element = element;

				ret = issue.checkIgnored();

				assert.areSame( 1, element.data.callCount, 'element.data call count' );
				mocking.assert.alwaysCalledWith( element.data, 'a11y-ignore' );
				assert.isTrue( ret, 'Return value' );
			},

			'test Issue.checkIgnored false': function() {
				var issue = getIssueMockup(),
					element = {
						data: mocking.spy( function() {
							return 'baz';
						} )
					},
					ret;

				issue.id = 'foo';
				issue.element = element;

				ret = issue.checkIgnored();

				assert.areSame( 1, element.data.callCount, 'element.data call count' );
				assert.isFalse( ret, 'Return value' );
			},

			'test Issue.isIgnored': function() {
				var issue = {
						isIgnored: Issue.prototype.isIgnored,
						_ignored: null
					},
					checkIgnored = mocking.mockProperty( 'checkIgnored', issue, mocking.spy( function() {
						return true;
					} ) ),
					ret;

				ret = issue.isIgnored();

				assert.areSame( 1, checkIgnored.callCount, 'checkIgnored call count' );
				assert.isTrue( ret, 'Return value' );
			},

			'test Issue.isIgnored multiple calls': function() {
				// Multiple calls of isIgnored method should result with only one checkIgnored call.
				var issue = {
						isIgnored: Issue.prototype.isIgnored,
						_ignored: null
					},
					checkIgnored = mocking.mockProperty( 'checkIgnored', issue );

				issue.isIgnored();
				issue.isIgnored();
				issue.isIgnored();
				issue.isIgnored();

				assert.areSame( 1, checkIgnored.callCount, 'checkIgnored call count' );
			},

			'test Issue.setIgnored': function() {
				var issue = getIssueMockup(),
					element = {
						data: mocking.spy()
					};

				issue.id = 'id';
				issue.element = element;

				issue.setIgnored( true );

				// element.data() will be called twice, once as a getter and once as a setter.
				assert.areSame( 2, element.data.callCount, 'element.data call count' );
				mocking.assert.calledWith( element.data, 'a11y-ignore' );
				mocking.assert.calledWith( element.data, 'a11y-ignore', 'id' );
			},

			'test Issue.setIgnored false': function() {
				var issue = getIssueMockup(),
					element = {
						data: mocking.spy( function() {
							return 'foo,id,bar,ide,id';
						} )
					};

				issue.id = 'id';
				issue.element = element;

				issue.setIgnored( false );

				// element.data() will be called twice, once as a getter and once as a setter.
				assert.areSame( 2, element.data.callCount, 'element.data call count' );
				mocking.assert.calledWith( element.data, 'a11y-ignore' );
				mocking.assert.calledWith( element.data, 'a11y-ignore', 'foo,bar,ide' );
			},

			'test Issue.setIgnored empty': function() {
				// This time we will remove the last ignored issue type. That would cause
				// data-a11y-ignore to be empty, but we don't want to leave junk. In that
				// case we want to remove the attribute completely.
				var issue = getIssueMockup(),
					element = {
						data: mocking.spy( function() {
							return 'id';
						} )
					};

				issue.id = 'id';
				issue.element = element;

				issue.setIgnored( false );

				// element.data() will be called twice, once as a getter and once as a setter.
				assert.areSame( 2, element.data.callCount, 'element.data call count' );
				mocking.assert.calledWith( element.data, 'a11y-ignore' );
				mocking.assert.calledWith( element.data, 'a11y-ignore', false );
			},

			'test Issue.setIgnored multiple issues': function() {
				// Checks the case when multiple issues share *the same* element.
				var issue1 = getIssueMockup(),
					issue2 = getIssueMockup(),
					elementData = null,
					element = {
						data: mocking.spy( function() {
							return elementData;
						} )
					};

				issue1.id = 'id1';
				issue1.element = element;

				issue2.id = 'id2';
				issue2.element = element;

				issue1.setIgnored( true );
				elementData = 'id1';
				issue2.setIgnored( true );

				assert.areSame( 4, element.data.callCount, 'element.data call count' );
				mocking.assert.calledWith( element.data, 'a11y-ignore' );
				mocking.assert.calledWith( element.data, 'a11y-ignore', 'id1' );
				mocking.assert.calledWith( element.data, 'a11y-ignore', 'id1,id2' );
			},

			'test Issue.isIgnored and setIgnored integration': function() {
				/**
				 * We need to ensure that toggling ignored state with setIgnored()
				 * will invalidate cache.
				 */
				var issue = getIssueMockup(),
					element = CKEDITOR.document.createElement( 'span' );

				issue.id = 'id';
				issue.element = element;

				issue.setIgnored( false );
				assert.isFalse( issue.isIgnored() );

				issue.setIgnored( true );
				assert.isTrue( issue.isIgnored() );
			}
		} );

		function getIssueMockup() {
			return new Issue();
		}
	} );
} )();
