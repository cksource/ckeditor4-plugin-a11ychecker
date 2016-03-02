/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */

(function() {
	'use strict';

	bender.require( [ 'IssueList' ], function( IssueList ) {
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

			'test IssueList.count without ignored': function() {
				var list = new IssueList();

				list.list = [
					{
						isIgnored: function() {
							return true;
						}
					},
					{
						isIgnored: function() {
							return true;
						}
					},
					{
						isIgnored: function() {
							return false;
						}
					},
					{
						isIgnored: function() {
							return false;
						}
					}
				];

				assert.areSame( 2, list.count( true ), 'ret value' );
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

			'test IssueList.getIssuesByElement': function() {
				var expectedElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
					otherElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
					list = new IssueList(),
					ret;

				list.list = [
					{ // Should be returned.
						element: expectedElement,
						isIgnored: function() {
							return false;
						}
					},
					{ // Should be skipped.
						element: otherElement,
						isIgnored: function() {
							return false;
						}
					},
					{ // Should be returned.
						element: expectedElement,
						isIgnored: function() {
							return false;
						}
					}
				];

				ret = list.getIssuesByElement( expectedElement );

				assert.isInstanceOf( Array, ret, 'Return type' );
				assert.areSame( 2, ret.length, 'Return length' );
				assert.areSame( list.list[ 0 ], ret[ 0 ], 'First element' );
				assert.areSame( list.list[ 2 ], ret[ 1 ], 'Second element' );
			},

			'test IssueList.getIssuesByElement ignored': function() {
				var expectedElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
					otherElement = CKEDITOR.dom.element.createFromHtml( '<br>' ),
					list = new IssueList(),
					ret;

				list.list = [
					{ // Should be skipped.
						element: expectedElement,
						isIgnored: function() {
							return true;
						}
					},
					{ // Should be skipped.
						element: otherElement,
						isIgnored: function() {
							return true;
						}
					},
					{ // Should be returned.
						element: expectedElement,
						isIgnored: function() {
							return false;
						}
					}
				];

				ret = list.getIssuesByElement( expectedElement, true );

				assert.isInstanceOf( Array, ret, 'Return type' );
				assert.areSame( 1, ret.length, 'Return length' );
				assert.areSame( list.list[ 2 ], ret[ 0 ], 'First element' );
			},

			'test IssueList.getIssuesByElement different CKEDITOR.dom.element': function() {
				// This one tests different CKEDITOR.dom.element instances, *but pointing
				// to the same* DOM element (domElement).
				var domElement = document.createElement( 'br' ),
					list = new IssueList(),
					ret;

				list.list = [
					{ // Should be returned.
						element: new CKEDITOR.dom.element( domElement ),
						isIgnored: function() {
							return false;
						}
					},
					{ // Should be returned.
						element: new CKEDITOR.dom.element( domElement ),
						isIgnored: function() {
							return false;
						}
					}
				];

				ret = list.getIssuesByElement( list.list[ 0 ].element );

				assert.isInstanceOf( Array, ret, 'Return type' );
				assert.areSame( 2, ret.length, 'Return length' );
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
				function alert( msg ) {
					messages.push( msg + '' );
				}

				// Assuming we have focused Issue at index 1.
				alert( list.currentIndex );

				list.resetFocus();

				alert( list.currentIndex );

				bender.arrayAssert.itemsAreSame( expectedMessages, messages, 'Messages are as expected' );
			},

			'test Issue.filter': function() {
				var list = new IssueList();

				list.list = [ 1, 2, 3 ];

				list.filter( function( x ) {
					return x > 2;
				} );

				assert.areEqual( 1, list.list.length, 'List was filtered out' );
			},

			'test IssueList.sort': function() {
				var wrapper = CKEDITOR.document.getBody().append( new CKEDITOR.dom.element( 'div' ) ),
					mockup = {
						sort: IssueList.prototype.sort
					};

				wrapper.setHtml( '<p id="p1"></p><p id="p2"></p><p id="p3"></p>' );

				var children = wrapper.getChildren();

				// Lets mess up the order a little bit.
				// Basically we want to put Issue imitations in diffrent order than
				// its DOM elements.
				mockup.list = [ {
					element: children.getItem( 0 )
				}, {
					element: children.getItem( 2 )
				} , {
					element: children.getItem( 1 )
				} ];

				try {
					mockup.sort();

					for ( var i = 0; i <= 2; i++ ) {
						assert.areSame( children.getItem( i ), mockup.list[ i ].element,
							'Member list[ ' + i + ' ] has correct element' );
					}
				} catch ( e ) {
					// Propagate the exception.
					throw e;
				} finally {
					// In any case remove the wrapper.
					wrapper.remove();
				}
			},

			'test IssueList.sort proper order': function() {
				// Similar to 'test IssueList.sort', but we want
				// to ensure that function won't mess up properly ordered issues.
				var wrapper = CKEDITOR.document.getBody().append( new CKEDITOR.dom.element( 'div' ) ),
					mockup = {
						sort: IssueList.prototype.sort
					};

				wrapper.setHtml( '<p id="p1"></p><p id="p2"></p><p id="p3"></p>' );

				var children = wrapper.getChildren();

				mockup.list = [ {
					element: children.getItem( 0 )
				}, {
					element: children.getItem( 1 )
				} , {
					element: children.getItem( 2 )
				} ];

				try {
					mockup.sort();

					for ( var i = 0; i <= 2; i++ ) {
						assert.areSame( children.getItem( i ), mockup.list[ i ].element,
							'Member list[ ' + i + ' ] has correct element' );
					}
				} catch ( e ) {
					// Propagate the exception.
					throw e;
				} finally {
					// In any case remove the wrapper.
					wrapper.remove();
				}
			}
		} );
	} );
})();