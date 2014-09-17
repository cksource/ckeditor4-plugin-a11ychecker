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
	 * @constructor Creates a viewerController instance.
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	function ViewerController( editor, definition ) {
		/**
		 * The editor of this controller.
		 */
		this.editor = editor;

		/**
		 * The {@link CKEDITOR.plugins.a11ychecker.viewer} of this controller.
		 */
		this.viewer = new Viewer( editor, definition );

		/**
		 * Reference to editor's a11ychecker.
		 * @property {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
		 */
		var a11ychecker = this.a11ychecker = editor._.a11ychecker;

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

		// Handle change in the list of issues.
		this.viewer.navigation.on( 'change', function( evt ) {
			a11ychecker.showIssue( Number( evt.data ) );
		}, this );

		// Handle "previous" button click in the panel.
		this.viewer.navigation.on( 'previous', function( evt ) {
			a11ychecker.prev();
		} );

		// Handle "next" button click in the panel.
		this.viewer.navigation.on( 'next', function( evt ) {
			a11ychecker.next();
		} );

		this.viewer.form.on( 'submit', function( evt ) {
			console.log( this.serialize() );
		} );
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
				descriptionPart.setInfo( details.descr[ lang ] + ' <a href="#" tabindex="-1">Read more...</a>' );
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
			var form = this.viewer.form;
			form.setInputs( {} );
		},

		/**
		 * Shows the panel next to the issue in the contents.
		 *
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue An issue that panel is created for.
		 */
		showIssue: function( issue ) {
			issue.element.scrollIntoView();

			// Wait for the scroll to stabilize.
			CKEDITOR.tools.setTimeout( function() {
				this.viewer.panel.attach( issue.element );
			}, 50, this );
		}
	};

	return ViewerController;
} );