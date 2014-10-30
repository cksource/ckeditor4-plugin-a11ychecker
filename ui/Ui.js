
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
			var cmd = this.getEditorCommand();
			cmd.setState( CKEDITOR.TRISTATE_ON );
		},

		hide: function() {
			var cmd = this.getEditorCommand();
			cmd.setState( CKEDITOR.TRISTATE_OFF );
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
			issueElement.removeClass( 'cke_a11y_focused' );
		},

		markFocus: function( issueElement ) {
			issueElement.addClass( 'cke_a11y_focused' );
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

	return Ui;
} );