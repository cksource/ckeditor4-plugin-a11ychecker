/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
( function() {
	'use strict';

	/**
	 * This task will include a custom guideline config to EngineQuail class.
	 *
	 * We got a feedback that it might be desired, in order to simplify AC installation.
	 *
	 * How is it implemented?
	 * The thing is that AC holds config in a separate AMD module so... we can replace this module during building process.
	 * Using EngineQuailConfig template file we'll put it into a temp directory in build directory, then we'll modify
	 * config for build-js task, so that EngineQuailConfig from temp directory is loaded instead the real one.
	 */
	module.exports = function( grunt ) {
		grunt.registerTask( 'custom-quail-config', 'Puts custom Quail config to the release.', function() {
			var fs = require( 'fs' ),
				path = require( 'path' ),
				done = this.async(),
				quailConfigPath = grunt.option( 'quail-config' ),
				buildDir = 'build',
				targetModuleDir = [ buildDir, '_tmp' ].join( path.sep ),
				targetModuleName = 'EngineQuailConfig.js',
				moduleTemplate = fs.readFileSync(
					[ 'dev', 'tasks', '_assets', 'custom-quail-config', 'EngineQuailConfig.js.tpl' ].join( path.sep ),
					{ encoding: 'utf8' }
				);

			function reportError( errorMsg ) {
				grunt.log.errorlns( errorMsg );
				done( false );
			}

			// Only trigger logic if any file name was given.
			if ( quailConfigPath ) {
				// Fetch content from the provided file.
				fs.readFile( quailConfigPath, function( err, data ) {
					if ( err ) {
						return reportError( 'Error while opening ' + quailConfigPath + ' file.\n' + err );
					}

					var config = JSON.parse( data ),
						moduleContent = moduleTemplate.replace( '{guideline}', JSON.stringify( config ) );

					// We must be super sure that build directory exists...
					if ( !fs.existsSync( buildDir ) ) {
						fs.mkdirSync( buildDir );
					}

					// Make sure that target module directory exists.
					fs.mkdir( targetModuleDir, function( err ) {
						var targetModulePath = targetModuleDir + path.sep + targetModuleName;

						// We accept the fact that directory might already exists.
						if ( err && err.code !== 'EEXIST' ) {
							return reportError( 'Could not create directory ' + targetModuleDir + err );
						}

						// Ok so we'll now create AMD module, based on template file.
						fs.writeFile( targetModulePath, moduleContent, function( err ) {
							if ( err ) {
								return reportError( 'Could not write ' + targetModulePath + ' file.' );
							} else {
								// Now we're updating config for build-js, the EngineQuailConfig class will be taken from targetModuleDir.
								grunt.log.writeln( 'Replacing grunftifle option: build-js.buildConfig.paths.EngineQuailConfig' );
								grunt.config.set( 'build-js.buildConfig.paths.EngineQuailConfig', targetModulePath.replace( /\.js$/i, '' ) );

								done();
							}
						} );
					} );
				} );
			} else {
				done();
			}
		} );
	};
}() );
