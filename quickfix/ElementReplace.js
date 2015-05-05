
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'QuickFix',
		callback: function( QuickFix ) {
			/**
			 * Replaces provided element with element that a different tag name, preserving its children.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix
			 * @class ElementReplace
			 * @constructor
			 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
			 */
			function ElementReplace( issue ) {
				QuickFix.call( this, issue );
			}

			ElementReplace.prototype = new QuickFix();
			ElementReplace.prototype.constructor = ElementReplace;

			/**
			 * Returns the name of the tag that issue.element should be converted to.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix
			 * @returns {String}
			 */
			ElementReplace.prototype.getTargetName = function() {
				return 'h1';
			};

			ElementReplace.prototype.display = function( form ) {
				form.setInputs( {} );
			};

			ElementReplace.prototype.fix = function( formAttributes, callback ) {
				var newElement = new CKEDITOR.dom.element( this.getTargetName() ),
					parent = this.issue.element.getParent();

				this.issue.element.remove();
				this.issue.element.moveChildren( newElement );

				parent.append( newElement );

				if ( callback ) {
					callback( this );
				}
			};

			CKEDITOR.plugins.a11ychecker.quickFixes.add( 'ElementReplace', ElementReplace );
		}
	} );
}() );