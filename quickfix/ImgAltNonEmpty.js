
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'ImgAlt',
		callback: function( ImgAlt ) {

			/**
			 * Fixes the image with missing alt attribute, requiring non-empty alt.
			 *
			 * @constructor
			 */
			function ImgAltNonEmpty( issue ) {
				ImgAlt.call( this, issue );
			}

			ImgAltNonEmpty.prototype = new ImgAlt();
			ImgAltNonEmpty.prototype.constructor = ImgAltNonEmpty;

			ImgAltNonEmpty.prototype.validate = function( formAttributes ) {
				var ret = [],
					proposedAlt = formAttributes.alt + '';

				if ( !proposedAlt ) {
					ret.push( this.lang.errorEmpty );
				}

				if ( !ret.length ) {
					ret = ImgAlt.prototype.validate.call( this, formAttributes );
				}

				return ret;
			};

			CKEDITOR.plugins.a11ychecker.quickFixes.add( 'ImgAltNonEmpty', ImgAltNonEmpty );
		}
	} );
}() );