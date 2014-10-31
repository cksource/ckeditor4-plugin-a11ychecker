
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( 'Manual', function( Manual ) {

		var emptyWhitespaceRegExp = /^[\s\n\r]+$/g;

		/**
		 * Fixes the image with missing alt attribute.
		 *
		 * @constructor
		 */
		function ImgAlt( issue ) {
			Manual.call( this, issue );
			this.auto = false;
		}

		ImgAlt.prototype = new Manual();
		ImgAlt.prototype.constructor = ImgAlt;

		ImgAlt.prototype.title = 'Fix alt attribute';

		ImgAlt.prototype.descr = 'Please, provide an alternative text (...)';

		ImgAlt.prototype.display = function( form ) {
			form.setInputs( {
				alt: {
					type: 'text',
					label: 'Alternative text'
				}
			} );
		};

		ImgAlt.prototype.fix = function( formAttributes, callback ) {
			this.issue.element.setAttribute( 'alt', formAttributes.alt );

			if ( callback ) {
				callback( this );
			}
		};

		ImgAlt.prototype.validate = function( formAttributes ) {
			var ret = [],
				proposedAlt = formAttributes.alt + '';

			if ( !proposedAlt ) {
				ret.push( 'Alternative text can not be empty' );
			}

			if ( proposedAlt.match( emptyWhitespaceRegExp ) ) {
				ret.push( 'Alternative text can only contain whitespace characters' );
			}

			return ret;
		};

		CKEDITOR.plugins.a11ychecker.quickFixes.register( 'ImgAlt', ImgAlt );
	} );
}() );