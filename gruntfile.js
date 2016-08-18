/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// File specific JSHint configs.
/* jshint node: true */

'use strict';

// Note:
// You can also find some information on how to use some grunt tasks in README.md.

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Array of paths excluded from linting.
	var lintExclude = [
		'libs/**',
		'tests/_assets/**',
		'tests/_helpers/require.js',
		'tests/_helpers/sinon/**'
	];

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		'build-js': {
			buildConfig: {
				name: 'build/a11ychecker/plugin',
				out: 'build/a11ychecker/plugin.js',
				paths: {
					'Quail': 'build/a11ychecker/libs/quail/quail.jquery'
				},
				optimize: 'none'	// Do not minify because of AMDClean.
			}
		},

		'build-quickfix': {
			build: {
				source: 'quickfix',
				target: 'build/a11ychecker/quickfix'
			}
		},

		env: {
			dev: {
				DEV: true
			},
			build: {
				DEV: false
			}
		},

		jshint: {
			options: {
				ignores: lintExclude
			}
		},

		jscs: {
			options: {
				excludeFiles: lintExclude
			}
		},

		githooks: {
			all: {
				'pre-commit': 'default'
			}
		},

		less: {
			development: {
				files: {
					'skins/moono/contents.css': 'less/skins/moono/contents.less',
					'skins/moono/a11ychecker.css': 'less/skins/moono/a11ychecker.less',
					'skins/moono-lisa/contents.css': 'less/skins/moono-lisa/contents.less',
					'skins/moono-lisa/a11ychecker.css': 'less/skins/moono-lisa/a11ychecker.less'
				},

				options: {
					paths: [ 'less' ]
				}
			},

			// Simply compress the skin file only.
			// If you want to build production CSS use `grunt build-css` rather than `grunt less:production`.
			production: {
				files: {
					'skins/moono/contents.css': 'less/skins/moono/contents.less',
					'skins/moono/a11ychecker.css': 'less/skins/moono/a11ychecker.less',
					'skins/moono-lisa/contents.css': 'less/skins/moono-lisa/contents.less',
					'skins/moono-lisa/a11ychecker.css': 'less/skins/moono-lisa/a11ychecker.less'
				},

				options: {
					paths: [ 'less' ],
					compress: true
				}
			}
		},

		watch: {
			less: {
				files: [ 'less/**/*.less' ],
				tasks: [ 'less:development' ],
				options: {
					nospawn: true
				}
			}
		},

		build: {
			options: {
				// Enable this to make the build code "kind of" readable.
				beautify: false
			}
		},

		clean: {
			build: [ 'build' ],
			buildQuickFixes: [ 'build/a11ychecker/quickfix/*' ],
			buildLeftOvers: [ 'build/a11ychecker/quailInclude.js' ]
		},

		copy: {
			build: {
				files: [
					{
						// nonull to let us know if any of given entiries is missing.
						nonull: true,
						src: [ 'plugin.js', 'quailInclude.js', 'CHANGES.md', 'skins/**', 'quickfix/**',
						'icons/**', 'lang/*', 'libs/quail/**' ],
						dest: 'build/a11ychecker/'
					}
				]
			},

			// Copies external dependencies into a build directory.
			external: {
				src: [ '../balloonpanel/skins/**', '../balloonpanel/plugin.js' ],
				dest: 'build/balloonpanel/'
			},

			externalEngines: {
				expand: true,
				cwd: '..',
				src: [ '{htmlcodesniffer,axe}/**', '!{htmlcodesniffer,axe}/samples/*.md' ],
				dest: 'build/'
			},

			// Copies DISTRIBUTION.md to the README.md.
			readme: {
				src: [ 'DISTRIBUTION.md' ],
				dest: 'build/a11ychecker/README.md'
			}
		},

		compress: {
			build: {
				options: {
					archive: 'build/a11ychecker.zip'
				},
				cwd: 'build/',
				src: [ '*/**' ],
				dest: '',
				expand: true
			}
		},

		uglify: {
			external: {
				files: [
					{
						'build/balloonpanel/plugin.js': [ '../balloonpanel/plugin.js' ]
					},
					{
						// This entry is going to minify QuickFix types.
						expand: true,
						cwd: 'build/a11ychecker/QuickFix',
						src: [ '*.js' ],
						dest: 'build/a11ychecker/QuickFix'
					}
				]
			},
			externalEngines: {
				files: [
					{
						'build/htmlcodesniffer/plugin.js': [ '../htmlcodesniffer/plugin.js' ]
					},
					{
						'build/axe/plugin.js': [ '../axe/plugin.js' ]
					}
				]
			}
		},

		preprocess: {
			license: {
				src: 'LICENSE.md',
				dest: 'build/a11ychecker/LICENSE.md'
			},

			plugin: {
				options: {
					inline: true
				},
				expand: true,
				src: 'plugin.js',
				dest: 'build/a11ychecker',
				cwd: 'build/a11ychecker'
			}
		},

		'plugin-versions': {
			build: {
				options: {
					plugins: [ 'a11ychecker' ]
				}
			},
			external: {
				options: {
					plugins: [ 'balloonpanel' ]
				}
			},
			externalEngines: {
				options: {
					plugins: [ 'axe', 'htmlcodesniffer' ]
				}
			}
		}
	} );

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask( 'build-css', 'Builds production-ready CSS using less.', [ 'less:development', 'less:production' ] );

	grunt.registerTask( 'process', 'Process the HTML files, removing some conditional markup, ' +
		'and replaces revsion hashes.', [ 'env:build', 'plugin-versions:build' ] );

	grunt.loadTasks( 'dev/tasks' );
};
