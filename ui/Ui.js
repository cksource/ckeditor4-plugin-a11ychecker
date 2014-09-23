
define( function() {
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
			var that = this,
				issues = this.controller.issues;

			// Listens to the focusChanged in issues list, so new focused issue
			// will be marked in UI.
			issues.on( 'focusChanged', function( evt ) {
				var evtData = evt.data;

				if ( evtData.current ) {
					that.markFocus( evtData.current.element );
				}

				if ( evtData.previous ) {
					that.unmarkFocus( evtData.previous.element );
				}
			} );
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