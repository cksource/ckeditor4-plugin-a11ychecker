/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * @class CKEDITOR.plugins.a11ychecker.Ui
	 * @constructor
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} controller Controller for which the object is created.
	 */
	function Ui( controller ) {
		this.controller = controller;
	}

	Ui.prototype = {
		show: function() {
			this.getEditorCommand().setState( CKEDITOR.TRISTATE_ON );
		},

		hide: function() {
			// When the ui is closed we want to make a selection on the issue.
			this._selectIssue();

			// Set command off.
			this.getEditorCommand().setState( CKEDITOR.TRISTATE_OFF );
		},

		// Updates basic controls of the ui, like issues count etc.
		update: function() {
			// Listens to the focusChanged in issues list, so new focused issue
			// will be marked in UI.
			this.controller.issues.on( 'focusChanged', this.focusChanged, this );
		},

		/**
		 * Listener to the {@link CKEDITOR.plugins.a11ychecker.IssueList#focusChanged} event, it will
		 * call unmark and mark focus methods appropriately.
		 *
		 * @param evt Event {@link CKEDITOR.plugins.a11ychecker.IssueList#focusChanged} event instance.
		 */
		focusChanged: function( evt ) {
			var evtData = evt.data;

			if ( evtData.previous ) {
				this.unmarkFocus( evtData.previous.element );
			}

			if ( evtData.current ) {
				this.markFocus( evtData.current.element );
			}
		},

		unmarkFocus: function( issueElement ) {
			issueElement.removeClass( 'cke_a11yc_focused' );
		},

		markFocus: function( issueElement ) {
			issueElement.addClass( 'cke_a11yc_focused' );
		},

		/**
		 * Returns a11ychecker command in CKEditor.
		 *
		 * @returns {CKEDITOR.command}
		 */
		getEditorCommand: function() {
			return this.controller.editor.getCommand( 'a11ychecker' );
		}
	};

	Ui.prototype.constructor = Ui;

	/**
	 * Selects current issue and makes a snapshot.
	 *
	 * @private
	 */
	Ui.prototype._selectIssue = function() {
		var controller = this.controller,
			focusedIssue = controller.issues.getFocused();

		if ( !focusedIssue ) {
			return;
		}

		// Make sure that undo manager is unlocked.
		controller._withUndoManager( function() {
			var editor = controller.editor,
				mode = controller.mode;
			// Make sure that editable decorator markup is not present, otherwise
			// AC attribnutes would leak to the snapshot.
			controller.editableDecorator.removeMarkup();
			// Select issue element.
			editor.getSelection().selectElement( focusedIssue.element );

			if ( mode.unsetStoredSelection ) {
				mode.unsetStoredSelection();
			}
			// Update the snapshot.
			editor.fire( 'updateSnapshot' );

			if ( mode.unsetStoredSelection ) {
				mode._storedSel = editor.getSelection().createBookmarks();
			}
		} );
	};

	return Ui;
} );