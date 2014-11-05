
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( 'Base', function( Base ) {
		/**
		 * The ultimate fix for unsolvable problem - removing an element.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.quickFix
		 * @class ElementRemove
		 * @constructor
		 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
		 */
		function ElementRemove( issue ) {
			Base.call( this, issue );
		}

		ElementRemove.prototype = new Base();
		ElementRemove.prototype.constructor = ElementRemove;

		ElementRemove.prototype.title = 'Element remove fix';

		ElementRemove.prototype.descr = 'Remove this element and don\'t you worry anymore.';

		ElementRemove.prototype.display = function( form ) {
			form.setInputs( {} );
		};

		ElementRemove.prototype.fix = function( formAttributes, callback ) {
			this.issue.element.remove();

			if ( callback ) {
				callback( this );
			}
		};

		CKEDITOR.plugins.a11ychecker.quickFixes.add( 'ElementRemove', ElementRemove );
	} );
}() );