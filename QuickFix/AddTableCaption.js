
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( 'Manual', function( Manual ) {
		/**
		 * QuickFix adding a caption in the `table` element.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.quickfix
		 * @class AddTableCaption
		 * @constructor
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue QuickFix is created for.
		 */
		function AddTableCaption( issue ) {
			Manual.call( this, issue );
		}

		AddTableCaption.prototype = new Manual();

		AddTableCaption.prototype.constructor = AddTableCaption;

		AddTableCaption.prototype.display = function( form ) {
			form.setInputs( {
				caption: {
					type: 'text',
					label: 'Caption'
				}
			} );
		};

		/**
		 * @param {Object} formAttributes Object containing serialized form inputs. See
		 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
		 * @param {Function} callback Function to be called when a fix was applied. Gets QuickFix object
		 * as a first parameter.
		 */
		AddTableCaption.prototype.fix = function( formAttributes, callback ) {
			var issueElement = this.issue.element,
				desiredValue = formAttributes.value,
				caption = issueElement.getDocument().createElement( 'caption' );

			caption.setHtml( formAttributes.caption );
			// Prepend the caption.
			issueElement.append( caption, true );

			if ( callback ) {
				callback( this );
			}
		};

		CKEDITOR.plugins.a11ychecker.quickFixes.add( 'AddTableCaption', AddTableCaption );
	} );
}() );