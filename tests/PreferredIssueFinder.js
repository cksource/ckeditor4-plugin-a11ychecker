/* bender-tags: unit,a11ychecker */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'PreferredIssueFinder', 'IssueList', 'mocking' ], function( PreferredIssueFinder, IssueList, mocking ) {
		bender.test( {
			setUp: function() {
				this.finder = new PreferredIssueFinder();
			},

			'test PreferredIssueFinder.set': function() {
				var finder = new PreferredIssueFinder(),
					issue = {};
				finder.set( issue );

				assert.areSame( issue, finder.preferredIssue, 'preferredIssue property value' );
				assert.areNotSame( issue, PreferredIssueFinder.prototype.preferredIssue, 'Prototype remains unchanged' );
			},

			'test PreferredIssueFinder.unset': function() {
				var finder = new PreferredIssueFinder();
				// Unset is simply calling set with a proper argument.
				finder.set = mocking.spy();

				finder.unset();

				assert.areSame( 1, finder.set.callCount, 'finder.set call count' );
				mocking.assert.calledWith( finder.set, null );
			},

			'test PreferredIssueFinder.getFromList empty list': function() {
				// Empty list should return null, as there is nothing interesting.
				var list = new ListMockup();
				assert.isNull( this.finder.getFromList( list ), 'Return value' );
			},

			'test PreferredIssueFinder.getFromList no preferred issue': function() {
				// If no preferred issue is set, then first issue should be returned.
				var elementsSet = CKEDITOR.document.find( 'div#set1 div' ),
					list = nodeListToIssueList( elementsSet ),
					ret;

				// And now retrieve.
				ret = this.finder.getFromList( list );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areSame( list.getItem( 0 ), ret, 'Returned issue is not a preferred issue' );
			},

			'test PreferredIssueFinder.getFromList': function() {
				var elementsSet = CKEDITOR.document.find( 'div#set1 div' ),
					list = nodeListToIssueList( elementsSet ),
					// Issue at index 1 will be preffered one.
					preferredIssue = list.list[ 1 ],
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areSame( preferredIssue, ret, 'Returned issue is not a preferred issue' );
			},

			'test PreferredIssueFinder.getFromList preferred not present': function() {
				// This time preferred issue (therefore its element) will not be in issue list.
				var elementsSet = CKEDITOR.document.find( 'div#set2 div' ),
					list = nodeListToIssueList( elementsSet ),
					preferredIssue = {
						element: CKEDITOR.document.findOne( 'div#set2 p' )
					},
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areSame( list.list[ 0 ], ret, 'Returned issue is not a first issue' );
			},

			'test PreferredIssueFinder.getFromList - missing preferred - subsequent available': function() {
				// This time preferred issue will not be in issue list, BUT there is
				// an issue with a element FOLLOWING the preferred issue.
				var elementsSet = CKEDITOR.document.find( 'div#set3 div' ),
					list = nodeListToIssueList( elementsSet ),
					preferredIssue = {
						element: CKEDITOR.document.findOne( 'div#set3 p' )
					},
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areSame( list.list[ 3 ], ret, 'Returned issue with element following preferred paragraph' );
			},

			'test PreferredIssueFinder.getFromList - missing preferred - child available': function() {
				// Here next element with issue would be the child of preferred element.
				var elementsSet = CKEDITOR.document.find( 'div#set4 div' ),
					list = nodeListToIssueList( elementsSet ),
					preferredIssue = {
						element: CKEDITOR.document.findOne( 'div#set4 p' )
					},
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areSame( list.list[ 3 ], ret, 'Returned issue with element following preferred paragraph' );
			}
		} );

		function ListMockup( items ) {
			this.list = items || [];

			this.each = IssueList.prototype.each;
			this.count = IssueList.prototype.count;
			this.getItem = IssueList.prototype.getItem;
		}

		// Converts CKEDITOR.dom.nodeList to IssueList mock, filled with
		// entries imitating Issue instances with element property set.
		function nodeListToIssueList( nodeList ) {
			var issueMocks = [];

			for ( var i = 0; i < nodeList.count(); i++ ) {
				issueMocks.push( {
					element: nodeList.getItem( i )
				} );
			}

			return new ListMockup( issueMocks );
		}
	} );
} )();