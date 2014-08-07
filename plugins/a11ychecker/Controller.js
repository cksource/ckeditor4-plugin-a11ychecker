
/**
 * @class
 */
CKEDITOR.plugins.a11ychecker.Controller = CKEDITOR.tools.createClass( {
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
	},

	proto: {
		next: function( editor ) {
			console.log( 'moving to next issue...' );
		},
		prev: function( editor ) {
			console.log( 'moving to prev issue...' );
		}
	}
} );
