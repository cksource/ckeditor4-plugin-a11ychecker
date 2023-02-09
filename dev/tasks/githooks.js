/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	grunt.config.merge( {
		githooks: {
			all: {
				'pre-commit': 'default'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-githooks' );
};
