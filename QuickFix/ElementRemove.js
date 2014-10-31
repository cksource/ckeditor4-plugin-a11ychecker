
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( 'Base', function( Base ) {
		/**
		 * Awesome automatic fix which will solve all the issues! : D if you have problem with
		 * an element then... remove it! Attaboy!
		 *
		 * @constructor
		 * @class CKEDITOR.plugins.a11ychecker.quickfix.ElementRemove
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

		CKEDITOR.plugins.a11ychecker.quickFixes.register( 'ElementRemove', ElementRemove );
	} );
}() );