/**
 * Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
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
		'samples/jquery.min.js',
		'samples/require.js',
		'tests/_assets/**',
		'tests/_helpers/require.js',
		'tests/_helpers/sinon/**'
	];

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

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
					'styles/contents.css': 'less/contents.less',
					'skins/moono/a11ychecker.css': 'less/a11ychecker.less'
				},

				options: {
					paths: [ 'less' ]
				}
			},

			// Simply compress the skin file only.
			// If you want to build production CSS use `grunt build-css` rather than `grunt less:production`.
			production: {
				files: {
					'skins/moono/a11ychecker.css': 'less/a11ychecker.less'
				},

				options: {
					paths: [ 'less' ],
					compress: true
				}
			}
		},

		watch: {
			less: {
				files: [ 'less/*.less' ],
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
			buildQuickFixes: [ 'build/a11ychecker/quickfix/*' ]
		},

		copy: {
			build: {
				// nonull to let us know if any of given entiries is missing.
				nonull: true,
				src: [ 'skins/**', 'styles/**', 'quickfix/**', 'icons/**', 'lang/*', 'libs/**' ],
				dest: 'build/a11ychecker/'
			},

			samples: {
				src: [ 'samples/**', '!samples/*.md', '!samples/require.js', '!samples/sdk-assets/less/**' ],
				dest: 'build/a11ychecker/'
			},

			// Copies external dependencies into a build directory.
			external: {
				src: [ '../balloonpanel/**', '!../balloonpanel/tests/**', '!../balloonpanel/dev/**',
					'!../balloonpanel/README.md'
				],
				dest: 'build/balloonpanel/'
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
				src: [ 'a11ychecker/**', 'balloonpanel/**' ],
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
			}
		},

		preprocess: {
			// Builds a sample.
			build: {
				src: 'samples/index.html',
				dest: 'build/a11ychecker/samples/index.html'
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
			}
		}
	} );

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask( 'build-css', 'Builds production-ready CSS using less.',
		[ 'less:development', 'less:production' ] );

	grunt.registerTask( 'process', 'Process the HTML files, removing some conditional markup, ' +
		'and replaces revsion hashes.', [ 'env:build', 'preprocess:build', 'plugin-versions' ] );

	grunt.registerTask( 'build', 'Generates a build.', [
		'clean:build', 'build-css', 'build-js', 'copy:build', 'copy:samples', 'copy:readme',
		'plugin-versions:build', 'clean:buildQuickFixes', 'build-quickfix:build'
	] );
	grunt.registerTask( 'build-full', 'Generates a sparse build including external plugin dependencies.', [
		'build', 'copy:external', 'plugin-versions:external', 'uglify:external', 'process', 'compress:build'
	] );

	grunt.loadTasks( 'dev/tasks' );
};
