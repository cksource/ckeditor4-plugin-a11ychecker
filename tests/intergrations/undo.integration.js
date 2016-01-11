/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 */
/* bender-tags: editor,a11ychecker,undo */
/* bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo */
/* bender-include: %TEST_DIR%../_assets/jquery.min.js */

/**
 * @fileoverview Integration with the undo plugin.
 */

( function() {
	'use strict';

	bender.editor = {
		startupData: '<p>foo</p><p>bar</p>',
		config: {
			allowedContent: true
		}
	};

	// The count of snapshots that CKE contains by default.
	var INITIAL_SNAPSHOT_COUNT = 1,
		innerHtmlMatching = bender.assert.isInnerHtmlMatching;

	bender.require( [ 'testSuite',
		'mocking',
		'EngineMock',
		'Controller',
		'helpers/quickFixTest',
		'EditableDecorator'
	], function(
		testSuite,
		mocking,
		EngineMock,
		Controller,
		quickFixTest,
		EditableDecorator
	) {
		testSuite.test( {
			setUp: function() {
				// Ensure that editor uses synchronous EngineMock.
				this.editor._.a11ychecker.setEngine( new EngineMock() );
				// Snapshot manager needs to be reset.
				this.editor.resetUndo();
			},

			tearDown: function() {
				this.editor._.a11ychecker.close();
			},

			'test opening AC does not cause a snapshot': function() {
				var a11ychecker = this.editor._.a11ychecker;

				a11ychecker.exec();

				this.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT );
			},

			'test subsequent opens does not cause snapshot': function() {
				// In this tc we're going to toggle AC 2 times to see, if it's not
				// causing any extra snapshots.

				// Now, this command is going to open AC:
				this.editor.execCommand( 'a11ychecker' );
				// Close AC.
				this.editor.execCommand( 'a11ychecker' );
				this.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT, 'No snapshot made after first closing' );
				// Open.
				this.editor.execCommand( 'a11ychecker' );
				// Close.
				this.editor.execCommand( 'a11ychecker' );

				this.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT );
			},

			'test undo unlock in listening mode': function() {
				var a11ychecker = this.editor._.a11ychecker;
				this.editor.execCommand( 'a11ychecker' );
				a11ychecker.setMode( Controller.modes.LISTENING );

				assert.isNull( this.editor.undoManager.locked, 'Undo Manager is unlocked' );

				a11ychecker.setMode( Controller.modes.CHECKING );
				assert.isNotNull( this.editor.undoManager.locked, 'Undo Manager is locked' );
			},

			'test snapshot on quickfix': function() {
				// We need to ensure that **each** QuickFix application results with a
				// snapshot.
				var that = this,
					editor = that.editor,
					a11ychecker = editor._.a11ychecker,
					issues;

				editor.execCommand( 'a11ychecker' );

				issues = a11ychecker.issues;

				// Alright, so it's going to be async stuff. We're going to reuse
				// quickFixTest code, to load fix types, because fixes does not use
				// AMD.
				quickFixTest( 'ImgAlt', null, function( ImgAlt ) {
					quickFixTest( 'AttributeRename', null, function( AttributeRename ) {
						resume( function() {
							var altFix = new ImgAlt( issues.getItem( 0 ) ),
								renameFix = new AttributeRename( issues.getItem( 0 ) );

							// Note: we're using synchronous fixes.
							// First we'll add alt attribute.
							a11ychecker.applyQuickFix( altFix, {
								alt: 'bar'
							} );

							// Set attr names.
							renameFix.attributeTargetName = 'fooAttr';
							renameFix.attributeName = 'alt';

							// Then second fix: rename alt to fooAttr.
							a11ychecker.applyQuickFix( renameFix, {} );

							// It should produce two **additional** snaps, so 3 in total.
							that.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT + 2, 'Snapshot count after 2 QuickFixes' );

							this.assertSnapshotsMarkup();

							// Cleanup editor contents by removing the attribute.
							a11ychecker.issues.getItem( 0 ).element.removeAttribute( 'fooAttr' );
						} );
					} );
				} );

				wait();
			},

			'test snapshot selection updated on navigation': function() {
				// Open AC, it already should focus first issue.
				this.editor.execCommand( 'a11ychecker' );

				this.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT );

				var snapshot = this.editor.undoManager.snapshots[ 0 ],
					bookmark = snapshot.bookmarks[ 0 ],
					editable = this.editor.editable();

				assert.isTrue( bookmark.is2, 'bookmark2 is available' );
				arrayAssert.itemsAreSame( [ 1 ], bookmark.start, 'bookmark start' );
				arrayAssert.itemsAreSame( [ 1 ], bookmark.end, 'bookmark end' );

				assert.areSame( 0, bookmark.startOffset, 'bookmark startOffset' );
				assert.areSame( 1, bookmark.endOffset, 'bookmark endOffset' );
			},

			'test snapshot selection updated on close': function() {
				// Open AC, it already should focus first issue.
				this.editor.execCommand( 'a11ychecker' );
				this.editor._.a11ychecker.close();

				// Check snapshot count.
				this.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT );

				// Now checking selection bookmark.
				// It should contain first paragraph.
				var snapshot = this.editor.undoManager.snapshots[ 0 ],
					bookmark = snapshot.bookmarks[ 0 ];

				assert.isTrue( bookmark.is2, 'bookmark2 is available' );
				arrayAssert.itemsAreSame( [ 1 ], bookmark.start, 'bookmark start' );
				arrayAssert.itemsAreSame( [ 1 ], bookmark.end, 'bookmark end' );

				assert.areSame( 0, bookmark.startOffset, 'bookmark startOffset' );
				assert.areSame( 1, bookmark.endOffset, 'bookmark endOffset' );
			},

			'test snapshot content on quickfix': function() {
				// We'll test content of the snapshot made directly on Quickfix.
				var a11ychecker = this.editor._.a11ychecker,
					that = this;

				this.editor.execCommand( 'a11ychecker' );

				// Replace second issue element.
				a11ychecker.issues.getItem( 1 ).element = this.editor.editable().find( 'p' ).getItem( 1 );

				// Getting ImgAlt type with a helper function.
				quickFixTest( 'ImgAlt', null, function( ImgAlt ) {
					resume( function() {
						// Create a fix instance for current issue.
						var altFix = new ImgAlt( a11ychecker.issues.getFocused() ),
							snapshots = this.editor.undoManager.snapshots;

						// Apply the quick fix with proper
						a11ychecker.applyQuickFix( altFix, {
							alt: 'bom'
						} );

						// This sequence will force next snapshot.
						a11ychecker.next();
						a11ychecker.close();

						innerHtmlMatching( '<p>foo@</p><p>bar</p>', snapshots[ 0 ].contents, 'First snapshot contents' );
						that.assertSnapshotCount( INITIAL_SNAPSHOT_COUNT + 1, 'Snapshot count after a single QuickFix' );
						innerHtmlMatching( '<p alt="bom">foo@</p><p>bar</p>', snapshots[ 1 ].contents, 'Second snapshot contents' );
					} );
				} );

				wait();
			},

			'test selection on quickfix': function() {
				// Ensure that first snapshot has correct selection.
				var a11ychecker = this.editor._.a11ychecker,
					that = this,
					curIssue,
					fix;
				this.editor.execCommand( 'a11ychecker' );

				curIssue = a11ychecker.issues.getFocused();

				// Alright, so it's going to be async stuff. We're going to reuse
				// quickFixTest code, to load fix types, because fixes does not use
				// AMD.
				quickFixTest( 'ImgAlt', null, function( ImgAlt ) {
					resume( function() {
						var altFix = new ImgAlt( curIssue );

						// Note: we're using synchronous fixes.
						// First we'll add alt attribute.
						a11ychecker.applyQuickFix( altFix, {
							alt: 'bom'
						} );

						var snapshot = this.editor.undoManager.snapshots[ 0 ],
							bookmark = snapshot.bookmarks[ 0 ],
							editable = this.editor.editable();

						assert.isTrue( bookmark.is2, 'bookmark2 is available' );
						arrayAssert.itemsAreSame( [ 1 ], bookmark.start, 'bookmark start' );
						arrayAssert.itemsAreSame( [ 1 ], bookmark.end, 'bookmark end' );

						assert.areSame( 0, bookmark.startOffset, 'bookmark startOffset' );
						assert.areSame( 1, bookmark.endOffset, 'bookmark endOffset' );
					} );
				} );

				wait();
			},

			getSnapshotCount: function() {
				return this.editor.undoManager.snapshots.length;
			},

			assertSnapshotCount: function( expected, msg ) {
				assert.areSame( expected, this.getSnapshotCount(), msg || 'Editor has expected snapshot count' );
			},

			// Asserts that no EditableDecorator.ID_ATTRIBUTE_NAME_FULL are present in
			// any snapshot.
			assertSnapshotsMarkup: function() {
				var snapshots = this.editor.undoManager.snapshots,
					i = 0,
					attributePosition;

				for ( ; i < snapshots.length; i++ ) {
					attributePosition = snapshots[ i ].contents.search( EditableDecorator.ID_ATTRIBUTE_NAME_FULL + '=' );

					assert.areEqual( -1, attributePosition,
						EditableDecorator.ID_ATTRIBUTE_NAME_FULL + ' attribute found in ' + i + ' snapshot' );
				}
			}
		} );
	} );
} )();