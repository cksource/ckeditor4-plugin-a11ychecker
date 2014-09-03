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
		 */
		this.a11ychecker = editor._.a11ychecker;

		// Setup the refresh of panel UI once attached to an element.
		this.viewer.panel.on( 'attach', function() {
			this.updateList();
			this.updateDescription();
			this.updateForm();
		}, this );

		// Handle change in the list of issues.
		this.viewer.navigation.on( 'change', function( evt ) {
			this.showIssue( evt.data );
		}, this );

		// Handle "previous" button click in the panel.
		this.viewer.navigation.on( 'previous', function( evt ) {
			CKEDITOR.plugins.a11ychecker.prev( editor );
		} );

		// Handle "next" button click in the panel.
		this.viewer.navigation.on( 'next', function( evt ) {
			CKEDITOR.plugins.a11ychecker.next( editor );
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

			return function() {
				var issues = this.a11ychecker.issues,
					entries = {};

				for ( var i in issues.issues ) {
					entries[ i ] = {};

					for ( var j = 0; j < issues.issues[ i ].length; ++j ) {
						var element = issues.issues[ i ][ j ];

						entries[ i ][ j ] = {
							value: issues.getIssueIndexByElement( element ),
							text: getElementInfo( element ),
							selected: element.equals( issues.getFocused() ) ? 'selected="selected"' : ''
						};
					}
				}

				this.viewer.navigation.updateList( entries );
			}
		} )(),

		/**
		 * Updates description according to the type of the current issue.
		 */
		updateDescription: function( title, info ) {
			var issues = this.a11ychecker.issues,
				type = issues.getIssueTypeByElement( issues.getFocused() ),
				descHtml = CKEDITOR.plugins.a11ychecker.types[ type ].desc;

			this.viewer.description.setTitle( CKEDITOR.plugins.a11ychecker.types[ type ].title );
			this.viewer.description.setInfo( descHtml + ' <a href="#" tabindex="-1">Read more...</a>' );
		},

		/**
		 * Updates "quick fix" section with proper fields according to
		 * the type of the current issue.
		 */
		updateForm: function() {
			this.viewer.form.setInputs( {
				foo: {
					type: 'text',
					label: 'Alternative text'
				},
				bar: {
					type: 'checkbox',
					label: 'Something easy'
				},
				boom: {
					type: 'select',
					label: 'Selectable',
					options: {
						11: 'Option #1',
						22: 'Option #2'
					}
				}
			} );
		},

		/**
		 * Shows the panel next to the issue in the contents.
		 *
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		showIssue: function( indexOrElement ) {
			if ( !( indexOrElement instanceof CKEDITOR.dom.element ) )
				indexOrElement = this.a11ychecker.issues.getIssueByIndex( indexOrElement );

			indexOrElement.scrollIntoView();

			// Wait for the scroll to stabilize.
			CKEDITOR.tools.setTimeout( function() {
				this.viewer.panel.attach( indexOrElement );
			}, 50, this );
		}
	};

	return ViewerController;
} );