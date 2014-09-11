
define( [ 'quickfix/Manual' ], function( Manual ) {
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
		var ret = [];

		if ( !formAttributes.alt ) {
			ret.push( 'Alternative text can not be empty' );
		}

		return ret;
	};

	return ImgAlt;
} );