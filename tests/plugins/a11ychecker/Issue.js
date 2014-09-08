/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'Issue' ], function( Issue ) {
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
			}
		} );

		function getIssueMockup() {
			return new Issue();
		}
	} );
} )();