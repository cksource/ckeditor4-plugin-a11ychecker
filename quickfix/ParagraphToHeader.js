
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'ElementReplace',
		callback: function( ElementReplace ) {
			/**
			 * Replaces provided element with element that a different tag name, preserving its children.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix
			 * @class ParagraphToHeader
			 * @constructor
			 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
			 */
			function ParagraphToHeader( issue ) {
				ElementReplace.call( this, issue );
			}

			ParagraphToHeader.prototype = new ElementReplace();
			ParagraphToHeader.prototype.constructor = ParagraphToHeader;

			/**
			 * Returns the name of the tag that issue.element should be converted to.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix.ParagraphToHeader
			 * @returns {String}
			 */
			ParagraphToHeader.prototype.getTargetName = function() {
				return 'h1';
			};

			ParagraphToHeader.prototype.display = function( form ) {
				form.setInputs( {} );
			};

			ParagraphToHeader.prototype.fix = function( formAttributes, callback ) {
				var newElement = new CKEDITOR.dom.element( this.getTargetName() ),
					parent = this.issue.element.getParent();

				this.issue.element.remove();
				this.issue.element.moveChildren( newElement );

				parent.append( newElement );

				if ( callback ) {
					callback( this );
				}
			};

			/**
			 * Determines preferred heading level for the header that should be cerated.
			 *
			 * @private
			 * @param {CKEDITOR.editor} editor
			 * @returns {Number} Number ranging from `1` to `6`.
			 */
			ParagraphToHeader.prototype._getPreferredLevel = function( editor ) {
				//var editable = editor.editable();
				return 1;
			};


			CKEDITOR.plugins.a11ychecker.quickFixes.add( 'ParagraphToHeader', ParagraphToHeader );
		}
	} );
}() );