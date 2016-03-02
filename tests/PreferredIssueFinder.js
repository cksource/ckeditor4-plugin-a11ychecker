/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: unit,a11ychecker */

( function() {
	'use strict';

	bender.require( [
		'PreferredIssueFinder',
		'IssueList',
		'mocking'
	], function(
		PreferredIssueFinder,
		IssueList,
		mocking
	) {
		bender.test( {
			setUp: function() {
				this.finder = new PreferredIssueFinder();
				// This HTML needs to be set each time, because we're removing some elements.
				CKEDITOR.document.getById( 'set5' ).setHtml(
					'<div>1</div>' +
					'<div>2</div>' +
					'<div>3</div>' +
					'<div>' +
					'	<strong>4</strong>' +
					'	<p>5</p>' +
					'	<a>6</a>' +
					'</div>' +
					'<div>7</div>'
				);
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
			},

			'test PreferredIssueFinder.getFromList - removed preferred': function() {
				// We'll removed the preferred element. In this case it should be determined from
				// selection (#4).
				var elementsSet = CKEDITOR.document.find( 'div#set5 div, div#set5 a' ),
					list = nodeListToIssueList( elementsSet ),
					preferredIssue = {
						// This will be preferred element, but it's about to be removed.
						element: CKEDITOR.document.findOne( 'div#set5 p' )
					},
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// Remove preferred issue element and make a selection.
				preferredIssue.element.remove();
				// Put the selection at the begining of strong with text 4.
				this._putSelectionAtBegining( CKEDITOR.document.findOne( 'div#set5 strong' ) );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				// Anchor is the closest to the selection, so it should be selected.
				assert.areSame( list.list[ 4 ], ret, 'Returned issue is not related to an anchor' );
			},

			'test removed preferred - selection in last element': function() {
				// Here we'll remove preferred element, and put selection IN the last issue element.
				// So we expect that this last element will be selected.
				var elementsSet = CKEDITOR.document.find( 'div#set5 div, div#set5 a' ),
					list = nodeListToIssueList( elementsSet ),
					preferredIssue = {
						// This will be preferred element, but it's about to be removed.
						element: CKEDITOR.document.findOne( 'div#set5 p' )
					},
					ret;

				// Set the preferred issue.
				this.finder.set( preferredIssue );

				// Remove preferred issue element and make a selection.
				preferredIssue.element.remove();
				this._putSelectionAtBegining( list.list[ 5 ].element );

				// And now retrieve.
				ret = this.finder.getFromList( list );

				// Selection is in a div element, which is an issue element too, so it should be selected.
				assert.areSame( list.list[ 5 ], ret, 'Invalid returned node' );
			},

			'test _nodeIsRemoved uninited node': function() {
				// Uninited node, it should act as removed node, but let's test it just in case.
				var node = new CKEDITOR.dom.element( 'a' );

				assert.isTrue( PreferredIssueFinder._nodeIsRemoved.call( {}, node ), 'Return val' );
			},

			'test _nodeIsRemoved removed node': function() {
				// Removed node should ofc return true.
				var node = new CKEDITOR.dom.element( 'a' ),
					body = CKEDITOR.document.getBody();

				body.append( node );
				node.remove();

				assert.isTrue( PreferredIssueFinder._nodeIsRemoved.call( {}, node ), 'Return val' );
			},

			'test _nodeIsRemoved appended node': function() {
				// Jucy, freshly appended node.
				var node = new CKEDITOR.dom.element( 'a' );
				CKEDITOR.document.getBody().append( node );

				assert.isFalse( PreferredIssueFinder._nodeIsRemoved.call( {}, node ), 'Return val' );
				// Remove it to reduce the mess.
				node.remove();
			},

			'test _retreiveElementFromSelection': function() {
				var playground = CKEDITOR.document.getById( 'set6' ),
					// Second strong will get a selection.
					// Important: text node will be selected, not the element itself.
					selectionHolder = playground.find( 'strong' ).getItem( 1 ),
					ret;

				this._putSelectionAtBegining( selectionHolder );

				ret = PreferredIssueFinder._retreiveElementFromSelection( CKEDITOR.document );

				assert.isInstanceOf( CKEDITOR.dom.element, ret, 'Invalid return type' );
				assert.isTrue( selectionHolder.equals( ret ), 'Returned value is a selectionHolder element' );
			},

			// Puts the selection at the begining of given node, selecting first node.
			_putSelectionAtBegining: function( node ) {
				var doc = node.getDocument(),
					sel = doc.getSelection(),
					rng = new CKEDITOR.dom.range( doc );

				rng.setStart( node, 0 );
				rng.setEnd( node, 0 );
				sel.selectRanges( [ rng ] );
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