/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

// File specific JSHint configs.
/* global module */

'use strict';

// Note:
// You can also find some information on how to use some grunt tasks in README.md.

module.exports = function( grunt ) {

	require( 'load-grunt-tasks' )( grunt );

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
			files: [ '*.js' ],
			options: jshintConfig
		},

		jscs: {
			src: '*.js',
			options: jscsConfig
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
				src: [ 'skins/**', 'styles/**', 'quickfix/**', 'icons/**', 'lang/*' ],
				dest: 'build/a11ychecker/'
			},

			// Copies external dependencies into a build directory.
			external: {
				src: [ '../balloonpanel/**', '../a11ycheckerquail/**', '!../a11ycheckerquail/tests/**',
					'!../a11ycheckerquail/README.md', '!../balloonpanel/tests/**', '!../balloonpanel/dev/**',
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
				src: [ 'a11ychecker/**', 'a11ycheckerquail/**', 'balloonpanel/**' ],
				dest: '',
				expand: true
			}
		},

		uglify: {
			external: {
				files: [
					{
						'build/balloonpanel/plugin.js': [ '../balloonpanel/plugin.js' ],
						'build/a11ycheckerquail/plugin.js': [ '../a11ycheckerquail/plugin.js' ]
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
			// Builds a dev/sample.html.
			build: {
				src: '../a11ycheckerquail/dev/sample.html',
				dest: 'build/a11ycheckerquail/dev/sample.html'
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
					plugins: [ 'a11ycheckerquail', 'balloonpanel' ]
				}
			}
		}
	} );

	grunt.registerTask( 'build-css', 'Builds production-ready CSS using less.',
		[ 'less:development', 'less:production' ] );
	grunt.registerTask( 'build-js', 'Build JS files.', buildJs );

	grunt.registerMultiTask( 'plugin-versions', 'Replaces %REV% and %VERSION% strings in plugin.js.', markPluginVersions );
	grunt.registerTask( 'process', 'Process the HTML files, removing some conditional markup, ' +
		'and replaces revsion hashes.', [ 'env:build', 'preprocess:build', 'plugin-versions' ] );

	grunt.registerTask( 'build', 'Generates a build.', [
		'clean:build', 'build-css', 'build-js', 'copy:build', 'copy:readme',
		'plugin-versions:build', 'clean:buildQuickFixes', 'build-quickfix:build'
	] );
	grunt.registerTask( 'build-full', 'Generates a sparse build including external plugin dependencies.', [
		'build', 'copy:external', 'plugin-versions:external', 'uglify:external', 'process', 'compress:build'
	] );

	grunt.loadTasks( 'dev/tasks' );

	// Default tasks.
	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );
};

function markPluginVersions() {
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
		exec( 'git log -n 1 --pretty=format:"%H"', {
			cwd: '../' + pluginName
		}, function( error, stdout, stderr ) {
			if ( error ) {
				console.log( 'Getting a hash for %s failed, error message: %s\n', pluginName, stderr + '' );
			} else {
				// Any new line chars are not allowed.
				var hash = String( stdout ).replace( /\r\n/g, '' ),
					pluginJsPath = 'build/' + pluginName + '/plugin.js',
					fileContent = fs.readFileSync( pluginJsPath , 'utf8' );

				fs.writeFileSync( pluginJsPath, fileContent.replace( /\%REV\%/g, hash ) );
			}

			doneCount += 1;
			if ( doneCount >= plugins.length ) {
				done();
			}
		} );
	} );
}

function buildJs() {
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
		fs = require('fs' ),
		options = this.options();

	var config = {
		name: 'plugin',
		out: 'build/a11ychecker/plugin.js',
		optimize: 'none'	// Do not minify because of AMDClean.
	};

	// Make grunt wait because requirejs.optimize is a async method.
	var done = this.async();

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
				code =
					'/*\n' +
					' Copyright (c) 2003-' + ( new Date() ).getFullYear() + ', CKSource - Frederico Knabben. All rights reserved.\n' +
					' For licensing, see LICENSE.md or http://ckeditor.com/license\n' +
					'*/\n\n' +
					code;

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
}

// Configurations for JSHint
var jshintConfig = {
	globalstrict: true,
	predef: [
		'window',
		'document',
		'location',
		'CKEDITOR',
		'deine',
		'require',
		'console'	// Just for prototyping purposes. Must be removed.
	]
};

// Configurations for JSCS (JavaScript Code Style checker)
var jscsConfig = {
	'excludeFiles': [
		'node_modules/*'
	],
	'requireCurlyBraces': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'try', 'catch'
	],
	'requireSpaceAfterKeywords': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch'
	],
	'requireSpaceBeforeBlockStatements': true,
	'requireParenthesesAroundIIFE': true,
	'requireSpacesInConditionalExpression': {
		'afterTest': true,
		'beforeConsequent': true,
		'afterConsequent': true,
		'beforeAlternate': true
	},
	'requireSpacesInFunctionExpression': {
		'beforeOpeningCurlyBrace': true
	},
	'disallowSpacesInFunctionExpression': {
		'beforeOpeningRoundBrace': true
	},
	'requireBlocksOnNewline': true,
	'requireSpacesInsideObjectBrackets': 'all',
	'requireSpacesInsideArrayBrackets': 'all',
	'disallowSpaceAfterObjectKeys': true,
	'requireCommaBeforeLineBreak': true,
	'requireOperatorBeforeLineBreak': [
		'?', '=', '+', '-', '/', '*', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=',
		'-=', '/=', '^='
	],
	'requireSpaceBeforeBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'requireSpaceAfterBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'disallowSpaceAfterPrefixUnaryOperators': [
		'++', '--', '+', '-', '~', '!'
	],
	'disallowSpaceBeforePostfixUnaryOperators': [
		'++', '--'
	],
	'disallowKeywords': [
		'with'
	],
	'validateLineBreaks': 'LF',
	'validateQuoteMarks': {
		'mark': '\'',
		'escape': true
	},
	'validateIndentation': '\t',
	'disallowMixedSpacesAndTabs': true,
	'disallowTrailingWhitespace': true,
	'disallowKeywordsOnNewLine': [
		'else', 'catch'
	],
	'maximumLineLength': 120,
	'safeContextKeyword': [
		'that'
	],
	'requireDotNotation': true,
	'disallowYodaConditions': true
};
