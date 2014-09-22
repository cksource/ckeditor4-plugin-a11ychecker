
/**
 * UI class for a11ychecker plugin.
 *
 * @class
 */
CKEDITOR.plugins.a11ychecker.ui = CKEDITOR.tools.createClass( {
	/**
	 * Creates an ui instance.
	 *
	 * @constructor
	 */
	$: function( editor ) {
		var lang = editor.lang.a11ychecker;

		this.editor = editor;

		this.bar = new CKEDITOR.ui.HBox();
		this.issues = new CKEDITOR.ui.Select();
		this.buttonsGr = new CKEDITOR.ui.ToolGroup(),
		this.prevBtn = new CKEDITOR.ui.Button(),
		this.nextBtn = new CKEDITOR.ui.Button();
		this.refreshBtn = new CKEDITOR.ui.Button();
		this.closeBtn = new CKEDITOR.ui.Button();

		this.issuesCount = new CKEDITOR.dom.element( 'span' );
		this.issuesCount.setHtml( '( 0 )' );

		this.bar.element.addClass( 'cke_a11ychecker_toolbox' );
		this.issues.element.addClass( 'cke_a11ychecker_issues' );

		this.prevBtn.setText( lang.prevBtn );
		this.nextBtn.setText( lang.nextBtn );
		this.refreshBtn.setText( lang.refreshBtn );
		this.closeBtn.setText( lang.closeBtn );

		this._bindListeners( editor );

		this.buttonsGr.addChild( this.prevBtn );
		this.buttonsGr.addChild( this.nextBtn );
		this.buttonsGr.addChild( this.refreshBtn );
		this.buttonsGr.addChild( this.closeBtn );

		this.bar.addChild( this.issues );
		this.bar.element.append( this.issuesCount );
		this.bar.addChild( this.buttonsGr );
	},

	proto: {
		show: function() {
			this.bar.show();
		},
		hide: function() {
			this.bar.hide();
		},
		/**
		 * Applies listeners to contined buttons, etc.
		 */
		_bindListeners: function( editor ) {
			this.closeBtn.element.on( 'click', function( evt ) {
				editor._.a11ychecker.close();
			} );

			this.refreshBtn.element.on( 'click', function( evt ) {
				editor._.a11ychecker.exec();
			} );

			this.nextBtn.element.on( 'click', function( evt ) {
				editor._.a11ychecker.next();
			} );

			this.prevBtn.element.on( 'click', function( evt ) {
				editor._.a11ychecker.prev();
			} );
		},

		// Updates basic controls of the ui, like issues count etc.
		update: function() {
			this.issuesCount.setHtml( '( ' + this.editor._.a11ychecker.issues.issuesCount + ' )' );
		},

		unmarkFocus: function( issueElement ) {
			issueElement.removeClass( 'cke_a11y_focused' );
		},

		markFocus: function( issueElement ) {
			issueElement.addClass( 'cke_a11y_focused' );
		}
	}
} );
