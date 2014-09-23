
define( function() {
	/**
	 * @class CKEDITOR.plugins.a11ychecker.Ui
	 * @constructor
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} controller Controller which object is created for.
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