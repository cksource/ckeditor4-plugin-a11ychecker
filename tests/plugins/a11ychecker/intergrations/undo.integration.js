/* bender-tags: editor,a11ychecker,undo */
/* bender-ckeditor-plugins: a11ychecker,sourcearea,toolbar,undo */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

/**
 * @fileoverview Integration with the undo plugin.
 */

( function() {
	'use strict';

	bender.editor = {
		startupData: '<p>foo</p>'
	};

	// The count of snapshots that CKE contains by default.
	var INITIAL_SNAPSHOT_COUNT = 1;

	require( [ 'mocking', 'EngineMock', 'Controller', 'mock/ui/ViewerControllerMockup', 'helpers/QuickFixTest', 'EditableDecorator', 'EngineDefault' ], function( mocking, EngineMock, Controller, ViewerControllerMockup, QuickFixTest, EditableDecorator ) {
		bender.test( {
			setUp: function() {
				// Ensure that editor uses synchronous EngineMock.
				this.editor._.a11ychecker.setEngine( new EngineMock() );
				this.editor._.a11ychecker.viewerController = new ViewerControllerMockup();

				// Snapshot manager needs to be reset.
				this.editor.resetUndo();
				// Force lock state to be disabled. Eventually we might not need it.
				//this.editor.undoManager.locked = null;
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
				this.assertSnapshotCount( 1, 'No snapshot made after first closing' );
				// Open.
				this.editor.execCommand( 'a11ychecker' );
				// Close.
				this.editor.execCommand( 'a11ychecker' );

				this.assertSnapshotCount( 1 );
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
				// QuickFixTest code, to load fix types, because fixes does not use
				// AMD.
				QuickFixTest( 'ImgAlt', null, function( ImgAlt ) {
					QuickFixTest( 'AttributeRename', null, function( AttributeRename ) {
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
							that.assertSnapshotCount( 3, 'Snapshot count after 2 QuickFixes' );

							this.assertSnapshotsMarkup();
						} );
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