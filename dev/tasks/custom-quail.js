/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* jshint node: true */

/**
 * @fileOverview This task will take care of copying custom Quail build if given.
 */

'use strict';

module.exports = function( grunt ) {
	grunt.registerTask( 'custom-quail', 'Checks if given custom Quail path is correct.', function() {
		var customPath = grunt.option( 'quail' ),
			fs = require( 'fs' ),
			done;

		if ( !customPath ) {
			return;
		}

		done = this.async();

		// Ensure that provided path is a valid directory, and that it contains Quail src.
		fs.lstat( customPath, function( err, info ) {
			var quailSrcPath = customPath + '/quail.jquery.min.js';

			if ( err || !info.isDirectory() ) {
				grunt.log.error( customPath + ' is not a directory.' );
				done();
			} else {
				fs.lstat( quailSrcPath, function( err, info ) {
					if ( err || !info.isFile() ) {
						grunt.log.error( quailSrcPath + ' is not a file.' );
					}

					// This task will copy contents from given directory to build quail dir.
					grunt.config.merge( {
						copy: {
							customQuail: {
								expand: true,
								cwd: customPath,
								src: '**',
								dest: 'build/a11ychecker/libs/quail/'
							}
						}
					} );

					grunt.task.run( 'copy:customQuail' );

					done();
				} );
			}
		} );
	} );
};
