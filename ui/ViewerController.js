/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/Viewer' ], function( Viewer ) {
	'use strict';

	/**
	 * A bridge between the logic and model of a11yc and panel-based issue Viewer.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.viewerController
	 * @mixins CKEDITOR.event
	 * @constructor Creates a viewerController instance.
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker The Accessiblity Checker controller instance
	 * for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	function ViewerController( a11ychecker, definition ) {
		var editor = a11ychecker.editor;

		/**
		 * The editor of this controller.
		 */
		this.editor = editor;

		/**
		 * The {@link CKEDITOR.plugins.a11ychecker.viewer} of this controller.
		 */
		var viewer = this.viewer = new Viewer( editor, definition );

		/**
		 * Reference to editor's a11ychecker.
		 *
		 * @property {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
		 */
		this.a11ychecker = a11ychecker;

		// Setup the refresh of panel UI once attached to an element.
		viewer.panel.on( 'attach', function() {

			if ( CKEDITOR.env.chrome ) {
				// (#39).
				var panelPart = viewer.panel.parts.panel,
					rng = new CKEDITOR.dom.range( panelPart.getDocument() ),
					// We have to put selection into the .cke_balloon_title container, when it was placed
					// in parts.panel directly it caused a visible layout issues.
					selectionContainer = panelPart.findOne( '.cke_balloon_title' );
				rng.setStart( selectionContainer, 0 );
				rng.setEnd( selectionContainer, 0 );

				panelPart.getDocument().getSelection().selectRanges( [ rng ] );
			}

			this.update( a11ychecker.issues.getFocused() );
		}, this );

		// When balloon is closed, a11ychecker should be forced to close with it.
		// We can't listen to balloon hide event, because it's raised when the dialog
		// is closed during issue switch.
		viewer.panel.parts.close.on( 'click', function( evt ) {
			this.a11ychecker.close();
		}, this );

		// Handle "previous" button click in the panel.
		viewer.navigation.on( 'previous', function( evt ) {
			a11ychecker.prev();
		} );

		// Handle "next" button click in the panel.
		viewer.navigation.on( 'next', function( evt ) {
			a11ychecker.next();
		} );

		// This listener has lower priority, because it performs validation. So it
		// can cancel event, before default listeners will be triggered.
		viewer.form.on( 'submit', this.quickFixAccepted, null, null, 8 );

		// Handle Ignore button click.
		viewer.form.on( 'ignore', a11ychecker.ignoreIssue, a11ychecker );

		// We'll need also to refresh the balloon contents.
		viewer.form.on( 'ignore', function() {
			// Refreshing form should be enough, because only ignore button should change.
			// If we'd update whole content, it would case AWT readers to read live fragments.
			this.updateForm( a11ychecker.issues.getFocused() );
		}, this	);

		this.on( 'next', function( evt ) {
			// Focusing the next button.
			viewer.navigation.parts.next.focus();
		}, null, null, 20 );

		this.on( 'prev', function( evt ) {
			// Focusing the previous button.
			viewer.navigation.parts.previous.focus();
		}, null, null, 20 );

		// Leave listening mode if the button of the indicator was pressed.
		viewer.listeningIndicator.on( 'check', function() {
			a11ychecker.check( {
				ui: true
			} );
			a11ychecker.editor.focus();
		}, this );
	}

	ViewerController.prototype = {
		/**
		 * Updates the balloon according to the given issue.
		 *
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
		 */
		update: function( issue ) {
			var issueList = this.a11ychecker.issues;

			this.viewer.navigation.update( issueList.indexOf( issue ), issueList.count(), issue.testability );
			this.updateDescription( issue );
			this.updateForm( issue );
		},

		/**
		 * Updates description according to the type of the current issue.
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Focused issue to be displayed in.
		 */
		updateDescription: function( issue ) {
			var descriptionPart = this.viewer.description;

			// Request for issue details.
			issue.getDetails( function( details ) {
				descriptionPart.setTitle( details.title );
				descriptionPart.setInfo( details.descr );
			} );
		},

		/**
		 * Updates "quick fix" section with proper fields according to
		 * the type of the current issue.
		 *
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Focused issue to be displayed in.
		 * balloon.
		 */
		updateForm: function( issue ) {
			var that = this,
				form = that.viewer.form,
				quickFixLang = that.a11ychecker.getQuickFixLang();

			// Set the state of Ignore button.
			form.setIgnored( issue.isIgnored() );

			form.setInputs( {} );

			// By default form is not visible.
			form.hide();

			// Set the contnet required by the QuickFix.
			issue.engine.getFixes( issue, function( fixes ) {
				var fixesCount = fixes.length;

				if ( fixesCount ) {
					// Active Quick Fix, currently we'll limit GUI only to one.
					that.quickFixSelected = fixes[ 0 ];
				}

				for ( var i = 0; i < fixesCount; i++ ) {
					fixes[ i ].display( form, that.editor );
				}

				if ( fixesCount ) {
					form.show();
				}
			}, quickFixLang );
		},

		/**
		 * Called when quickfix form submit button was pressed.
		 *
		 * @param {Object} evt An event comming from {@link CKEDITOR.plugins.a11ychecker.viewerForm#event-submit}
		 * event.
		 */
		quickFixAccepted: function( evt ) {
			// Note that `this` points to a ViewerForm instance.
			var editor = this.viewer.editor,
				a11ychecker = editor._.a11ychecker,
				controller = a11ychecker.viewerController,
				values = this.serialize(),
				currentFix = controller.quickFixSelected,
				errors;

			if ( !currentFix ) {
				console.erorr( 'No quickfix available!' ); // %REMOVE_LINE_CORE%
				evt.cancel();
			} else {
				errors = currentFix.validate( values );

				if ( errors.length ) {
					// If any errors were found, display them.
					alert( errors.join( ',' ) );

					// Put the focus on a first input.
					var inputKeys = CKEDITOR.tools.objectKeys( this.inputs );

					if ( inputKeys.length ) {
						this.inputs[ inputKeys[ 0 ] ].input.focus();
					}

					evt.cancel();
				} else {
					// Fix validation went fine, so let us apply it.
					a11ychecker.applyQuickFix( currentFix, values );
				}
			}
		},

		/**
		 * Shows the panel next to the issue in the contents.
		 *
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue An issue that panel is created for.
		 * @param {Object} params
		 * @param {Function} params.callback Function to be called when issue is focused.
		 * @param {String} params.event Name of event to be fired when issue is focused.
		 */
		showIssue: function( issue, params ) {
			// Make sure that viewport shows the issue element.
			issue.element.scrollIntoView();

			this.viewer.panel.attach( issue.element );

			if ( params ) {
				if ( params.event ) {
					this.fire( params.event );
				}

				if ( params.callback ) {
					params.callback.call( this );
				}
			}
		},

		/**
		 * Activates the listening mode of the panel. See {@link #stopListening}.
		 */
		startListening: function() {
			this.viewer.setMode( 'listening' );
			this.viewer.panel.show();
			// Put focus back to the editor (#142).
			this.editor.focus();
		},

		/**
		 * Deactivates the listening mode of the panel. See {@link #startListening}.
		 */
		stopListening: function() {
			this.viewer.panel.hide();
			this.viewer.setMode( 'checking' );
		}
	};

	CKEDITOR.event.implementOn( ViewerController.prototype );

	return ViewerController;

	/**
	 * Fires upon iteration to next issue.
	 *
	 * @event next
	 */

	/**
	 * Fires upon iteration to previous issue.
	 *
	 * @event prev
	 */
} );