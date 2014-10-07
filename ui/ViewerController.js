/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/Viewer' ], function( Viewer ) {
	/**
	 * A bridge between the logic and model of a11yc and panel-based issue Viewer.
	 *
	 * @since 4.5
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

		/**
		 * Ui lang code.
		 *
		 * @todo: This property should be moved to the Accessibility Checker Controller
		 * class.
		 */
		this.lang = 'en';

		// Setup the refresh of panel UI once attached to an element.
		this.viewer.panel.on( 'attach', function() {
			var issue = a11ychecker.issues.getFocused();

			this.updateList( issue );
			this.updateDescription( issue );
			this.updateForm( issue );
		}, this );

		// Handle "previous" button click in the panel.
		this.viewer.navigation.on( 'previous', function( evt ) {
			a11ychecker.prev();
		} );

		// Handle "next" button click in the panel.
		this.viewer.navigation.on( 'next', function( evt ) {
			a11ychecker.next();
		} );

		// This listener has lower priority, because it performs validation. So it
		// can cancel event, before default listeners will be triggered.
		this.viewer.form.on( 'submit', this.quickFixAccepted, null, null, 8 );

		// Handle change in the list of issues.
		this.viewer.navigation.on( 'change', function( evt ) {
			a11ychecker.showIssue( Number( evt.data ), function() {
				// When issue is shwon, make sure that issues list (in navigation)
				// is focused.
				viewer.navigation.parts.list.focus();
			} );
		}, this );

		this.on( 'next', function( evt ) {
			// Focusing the next button.
			this.viewer.navigation.parts.next.focus();
		}, null, null, 20 );

		this.on( 'prev', function( evt ) {
			// Focusing the previous button.
			this.viewer.navigation.parts.previous.focus();
		}, null, null, 20 );
	}

	ViewerController.prototype = {
		/**
		 * Updates the list of issues.
		 *
		 * @method
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Focused issue to be displayed in.
		 */
		updateList: ( function() {
			function trimText( text, length ) {
				if ( text.length > length ) {
					return CKEDITOR.tools.trim( text ).slice( 0, length - 3 ) + '[...]';
				} else {
					return text;
				}
			}

			var relevantNames = [ 'title', 'alt', 'src', 'href', 'id', 'name' ],
				infoTemplate = new CKEDITOR.template( ' ({name}="{value}")' );

			function getElementInfo( element ) {
				var rawAttributes = Array.prototype.slice.call( element.$.attributes ),
					namedAttributes = {},
					elementInfo;

				for ( var a in rawAttributes ) {
					namedAttributes[ rawAttributes[ a ].name ] = rawAttributes[ a ].value;
				}

				for ( var i = 0; i < relevantNames.length; ++i ) {
					if ( namedAttributes[ relevantNames[ i ] ] !== undefined ) {
						elementInfo = infoTemplate.output( {
							name: relevantNames[ i ],
							value: trimText( namedAttributes[ relevantNames[ i ] ], 50 )
						} );
						break;
					}
				}

				if ( !elementInfo )
					elementInfo = ' ("' + trimText( element.getText(), 50 ) + '")';

				return element.getName() + elementInfo;
			}

			return function( issue ) {
				var issues = this.a11ychecker.issues,
					focusedIssue = issues.getFocused(),
					entries = {},
					iteratedIssue;

				for ( var i = 0; i < issues.count(); i++ ) {
					entries[ i ] = {};
					iteratedIssue = issues.getItem( i );

					entries[ i ] = {
						value: i,
						text: getElementInfo( iteratedIssue.element ),
						selected: focusedIssue === iteratedIssue ? 'selected="selected"' : ''
					};
				}

				entries = {
					'Issues:': entries
				};

				this.viewer.navigation.updateList( entries );
			};
		} )(),

		/**
		 * Updates description according to the type of the current issue.
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Focused issue to be displayed in.
		 */
		updateDescription: function( issue ) {
			var descriptionPart = this.viewer.description,
				lang = this.lang;

			// Request for issue details.
			issue.getDetails( function( details ) {
				descriptionPart.setTitle( details.title[ lang ] );
				descriptionPart.setInfo( details.descr[ lang ] );
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
				form = that.viewer.form;

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
					fixes[ i ].display( form );
				}

				if ( fixesCount ) {
					form.show();
				}
			} );
		},

		/**
		 * Called when quickfix form submit button was pressed.
		 *
		 * @param {Object} evt An event comming from {@link CKEDITOR.plugins.a11ychecker.ViewerForm#submit}
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
			issue.element.scrollIntoView();

			// Wait for the scroll to stabilize.
			CKEDITOR.tools.setTimeout( function() {
				this.viewer.panel.attach( issue.element );

				if ( params ) {
					if ( params.event ) {
						this.fire( params.event );
					}

					if ( params.callback ) {
						params.callback.call( this );
					}
				}
			}, 50, this );
		},

		hide: function() {
			this.viewer.panel.hide();
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