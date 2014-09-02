/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

(function() {
	'use strict';

	require( [ 'IssueList' ], function( IssueList ) {
		bender.test( {
			'test list creation': function() {
				var list = new IssueList();
				assert.areSame( 0, list.count(), 'List is empty' );
			},

			'test IssueList.addItem': function() {
				var list = new IssueList(),
					newItem = {};

				list.addItem( newItem );
				assert.areSame( 1, list.count(), 'Items count increased' );
			},

			'test IssueList.addItem - adding order': function() {
				// Ensure that item is applied to the end of the list.
				var list = new IssueList(),
					lastItem = {};

				// So we need to add 2 items, we only care about last, if it's really
				// the last one.
				list.addItem( {} );
				list.addItem( lastItem );

				assert.areSame( lastItem, list.list[ 1 ], 'lastItem was added as a last element' );
			},

			'test IssueList.getItem': function() {
				var list = new IssueList(),
					items = [ {}, {} ];

				list.list = items;

				assert.areSame( items[ 0 ], list.getItem( 0 ), 'Item at 0 index' );
				assert.areSame( items[ 1 ], list.getItem( 1 ), 'Item at 1 index' );
			},

			'test IssueList.getItem - missing item': function() {
				// Ensure that null is returned if item is not found.
				var list = new IssueList();
				assert.areSame( null, list.getItem( 0 ), 'Item at 0 index' );
			},

			'test IssueList.each': function() {
				var list = new IssueList(),
					items = [ {}, {} ],
					callsCount = 0;

				// Lets set the internal list to the expected items array.
				list.list = items;

				list.each( function( elem ) {
					assert.areSame( items[ callsCount ], elem, 'elem is a items[ ' + callsCount + ' ]' );
					callsCount += 1;
					assert.areSame( list, this, 'this context is a List element' );

				} );

				assert.areSame( 2, callsCount, 'Callback calls count' );
			},

			'test IssueList.clear': function() {
				var list = new IssueList();
				list.list = [ {} ];

				list.clear();

				assert.areSame( 0, list.count(), 'Item is removed' );
				assert.areSame( undefined, list.list[ 0 ], 'Item is removed' );
			}

		} );
	} );
})();