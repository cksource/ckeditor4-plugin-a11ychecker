/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
( function() {
	'use strict';

	module.exports = function( grunt ) {
		grunt.registerMultiTask( 'plugin-versions', 'Replaces %REV% and %VERSION% strings in plugin.js.', function() {
			/*jshint validthis: true */
			// This task will inspect related plugins and obtain its git hashes. Then it looks
			// into plugin.js (ONLY) and replaces all the %REV% occurrences.
			// It it modifies only build/<pluginName>/plugin.js files.
			var fs = require('fs' ),
				// Use exec to obtain git hash.
				exec = require( 'child_process' ).exec,
				options = this.options(),
				plugins = options.plugins,
				done = this.async(),
				doneCount = 0;

			plugins.map( function( pluginName ) {
				if ( !fs.existsSync( '../' + pluginName ) ) {
					grunt.log.writeln( 'Plugin ' + pluginName + ' not found, skipping.' );
					return true;
				}

				exec( 'git log -n 1 --pretty=format:"%H"', {
					cwd: '../' + pluginName
				}, function( error, stdout, stderr ) {
					if ( error ) {
						console.log( 'Getting a hash for %s failed, error message: %s\n', pluginName, stderr + '' );
					} else {
						// Any new line chars are not allowed.
						var hash = String( stdout ).replace( /\r\n/g, '' ),
							pluginJsPath = 'build/' + pluginName + '/plugin.js',
							fileContent;

						if ( !fs.existsSync( pluginJsPath ) ) {
							grunt.log.writeln( 'File ' + pluginJsPath + ' not found, skipping.' );
							return true;
						}

						fileContent = fs.readFileSync( pluginJsPath , 'utf8' );

						fs.writeFileSync( pluginJsPath, fileContent.replace( /\%REV\%/g, hash ) );
					}

					doneCount += 1;
					if ( doneCount >= plugins.length ) {
						done();
					}
				} );
			} );
		} );
	};
}() );
