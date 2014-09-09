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
				assert.areSame( -1, list.currentIndex, 'Index should not be set' );
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
				assert.isNull( list.getItem( 0 ), 'Item at 0 index' );
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
				assert.areSame( -1, list.currentIndex, 'currentIndex property reset' );
			},

			'test IssueList.resetFocus': function() {
				var listMock = {
						currentIndex: 1,
						getFocused: function() {},
						fire: function() {}
					};

				IssueList.prototype.resetFocus.call( listMock );

				assert.areSame( -1, listMock.currentIndex, 'Current index has been reset' );
			},

			'test IssueList.getFocused': function() {
				var expectedRet = {},
					listMock = {
						currentIndex: 2,
						getItem: function( param ) {
							assert.areSame( 2, param, 'IssueList.getItem got correct index' );
							return expectedRet;
						}
					},
					ret;

				ret = IssueList.prototype.getFocused.call( listMock );

				assert.areSame( expectedRet, ret, 'Return value' );
			},

			'test IssueList.getFocused no focused issue': function() {
				// Ensure that null is returned when no issue is focused.
				var listMock = {
						currentIndex: -1
					},
					ret;

				ret = IssueList.prototype.getFocused.call( listMock );

				assert.isNull( ret, 'Return value' );
			},

			'test IssueList.moveTo': function() {
				var listMock = {
						currentIndex: -1,
						getItem: function() {
							return {};
						},
						getFocused: function() {
						},
						fire: function() {
						}
					},
					ret;

				ret = IssueList.prototype.moveTo.call( listMock, 1 );

				assert.areSame( 1, listMock.currentIndex, 'currentIndex was changed' );
				assert.isTrue( ret, 'Return value' );
			},

			'test IssueList.moveTo invalid index': function() {
				// This time we'll pass invalid index (not existing item), so it
				// should return False.
				var listMock = {
						currentIndex: -1,
						getItem: function() {
							return null;
						}
					},
					ret;

				ret = IssueList.prototype.moveTo.call( listMock, 3 );

				assert.areSame( -1, listMock.currentIndex, 'currentIndex remains the same' );
				assert.isFalse( ret, 'Return value' );
			},

			'test IssueList.getIssueByElement': function() {
				// We'll create an IssueList mockup, it will contain 2 issue-alike
				// objects.
				// W'll attempt to fetch the second issue (expectedIssue) by passing expectedElement.
				var expectedElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
					expectedIssue = {
						element: expectedElement
					},
					list = new IssueList(),
					ret;

				list.list = [
					{
						element: CKEDITOR.dom.element.createFromHtml( '<br>' )
					},
					expectedIssue
				];

				ret = list.getIssueByElement( expectedElement );

				assert.areSame( expectedIssue, ret, 'Return value' );
			},

			'test focusChanged first event': function() {
				var list = new IssueList(),
					eventsCount = 0,
					lastEventData;

				list.list = [ 3, 4, 5 ];

				list.on( 'focusChanged', function( evt ) {
					eventsCount += 1;
					lastEventData = evt.data;
				} );

				list.next();

				assert.areSame( 1, eventsCount, 'focusChange events count' );
				assert.areSame( 3, lastEventData.current, 'lastEventData.current' );
				assert.isNull( lastEventData.previous, 'lastEventData.previous' );
			},

			'test focusChanged subsequent event': function() {
				var list = new IssueList(),
					eventsCount = 0,
					lastEventData;

				list.list = [ 3, 4, 5 ];

				// We don't care about first call.
				list.next();

				list.on( 'focusChanged', function( evt ) {
					eventsCount += 1;
					lastEventData = evt.data;
				} );

				// This one interests us
				list.next();

				assert.areSame( 1, eventsCount, 'focusChange events count' );
				assert.areSame( 4, lastEventData.current, 'lastEventData.current' );
				assert.areSame( 3, lastEventData.previous, 'lastEventData.previous' );
			},

			'test focusChanged fired by IssueList.resetFocus': function() {
				var list = new IssueList(),
					eventsCount = 0,
					lastEventData;

				list.list = [ 3 ];
				list.currentIndex = 0;

				list.on( 'focusChanged', function( evt ) {
					eventsCount += 1;
					lastEventData = evt.data;
				} );

				list.resetFocus();

				assert.areSame( 1, eventsCount, 'focusChange events count' );
				assert.isNull( lastEventData.current, 'lastEventData.current' );
				assert.areSame( 3, lastEventData.previous, 'lastEventData.previous' );
			},

			'test IssueList.resetFocus doc sample': function() {
				var list = new IssueList(),
					messages = [],
					expectedMessages = [ '1', '-1' ];
				list.addItem( 1 );
				list.addItem( 1 );
				list.currentIndex = 1;

				// Each alert will push msg to messages array. We'll asert it later.
				function alert( msg ){
					messages.push( msg + '' );
				}

				// Assuming we have focused Issue at index 1.
				alert( list.currentIndex );

				list.resetFocus();

				alert( list.currentIndex );

				bender.arrayAssert.itemsAreSame( expectedMessages, messages, 'Messages are as expected' );
			},
		} );
	} );
})();