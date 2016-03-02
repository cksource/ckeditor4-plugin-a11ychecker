/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
( function() {
	'use strict';

	module.exports = function( grunt ) {
		grunt.registerTask( 'build-js', 'Build JS files.', function() {
			/* jshint validthis:true */

			// The intention of this build process is showcasing the possibility of
			// using AMD during development and avoid having to use a AMD library (RequireJS)
			// on build. The real build will be much more complex than this, ofc.
			//
			// 1. Merge the plugin src code, which is based on RequireJS, using r.js.
			// 2. Removes define/require from the code, making it pure js (AMDClean).
			// 3. Minify the code with uglify.
			// 4. Append the copyright notices and save to build/plugin.js.

			var requirejs = require( 'requirejs' ),
				fs = require( 'fs' ),
				options = this.options(),
				config = grunt.config.get( 'build-js.buildConfig' ),
				// Make grunt wait because requirejs.optimize is a async method.
				done = this.async(),
				licenseStatement = '/**\n' +
					'* @license Copyright (c) 2014-' + ( new Date() ).getFullYear() +
					', CKSource - Frederico Knabben. All rights reserved.\n' +
					'* For licensing, see LICENSE.md or http://ckeditor.com/license\n' +
					'*/\n\n';

			requirejs.optimize( config,
				function( buildResponse ) {
					try {
						var code =
							// The plugin code with stipped lines.
							preProcess( fs.readFileSync( config.out, 'utf8' ) );

						// AMDClean, to remove define/require from the code.
						var amdclean = require('amdclean');
						code = amdclean.clean( code );

						// Finally, minify the whole code.
						code = minify( code );

						// Add copyright notices.
						code = licenseStatement + code;

						// Overwrite the output file with the new code.
						fs.writeFileSync( config.out, code );
					} catch ( e ) {
						console.log( e );
					}
					done();

				},
				function( err ) {
					console.log( err );
					done( false );
				}
			);

			function preProcess( code ) {
				code = code.replace( /[^\n]*\%REMOVE_LINE%[^\n]*\n?/g, '' );
				return code;
			}

			function minify( code ) {
				var uglifyJS = require( 'uglify-js' );

				var toplevel = uglifyJS.parse( code );
				toplevel.figure_out_scope();

				var compressor = uglifyJS.Compressor();
				var compressed_ast = toplevel.transform(compressor);

				compressed_ast.figure_out_scope();
				compressed_ast.compute_char_frequency();
				compressed_ast.mangle_names();

				return compressed_ast.print_to_string( {
					beautify: !!options.beautify,
					max_line_len: 1000
				} );
			}
		} );
	};
}() );
