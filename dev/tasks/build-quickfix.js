/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
( function() {
	'use strict';

	var fs = require( 'fs' ),
		util = require( 'util' ),
		// Path separator. There is no need to use windows-sepcific.
		sep = '/';

	/**
	 * @constructor
	 */
	function QuickFixBuilder( grunt ) {
		this.grunt = grunt;
	}

	QuickFixBuilder.prototype = {
		/**
		 * Target directory, where builded files (and directories) will be created.
		 * It should also contain source language files.
		 */
		targetDir: '',

		sourceLangsDir: '',

		langs: [],

		langDicts: {},

		/**
		 * Array with names of the QuickFix classes.
		 */
		quickFixes: []
	};
	QuickFixBuilder.prototype.constructor = QuickFixBuilder;

	/**
	 * Main function to be executed when running a task.
	 *
	 * @param {Object} task Grunt task object.
	 * @returns {Boolean} `true` if task completed.
	 */
	QuickFixBuilder.prototype.exec = function( task ) {
		this.data = task.data;

		this.targetDir = this.data.target || this.data.source + '/lang';

		this.sourceLangsDir = this.data.source + sep + 'lang';

		try {
			this.validate( task.data );
		} catch ( e ) {
			this.grunt.log.error( e.message );
			return false;
		}

		// Gather languages.
		this.langs = this.listLanguages( this.sourceLangsDir );

		if ( !this.langs.length ) {
			this.grunt.fail.warn( 'No languages detected, aborting.' );
			return false;
		}

		// Load source dictionaries.
		this.loadDictionaries();

		this.quickFixes = this.listQuickFixClasses( this.data.source );

		this.createLanguageDirectories();

		this.quickFixes.map( function( quickFixName ) {
			this.langs.map( function( langCode ) {
				this.buildQuickFixClass( quickFixName, langCode );
			}, this );
		}, this );

		this.displaySummary();

		return true;
	};


	/**
	 * Displays a short summary of grunt task.
	 */
	QuickFixBuilder.prototype.displaySummary = function() {
		var colors = require('colors/safe'),
			emphasisColor = colors.cyan;
		this.grunt.log.writeln(
			util.format(
				'Built %s QuickFixes in %s langs.',
				emphasisColor( this.quickFixes.length ),
				emphasisColor( this.langs.length )
			)
		);
	};

	/**
	 * Determines the langage list.
	 *
	 * @param {String} directory
	 * @returns {String[]} list of languages (their codes).
	 */
	QuickFixBuilder.prototype.listLanguages = function( directory ) {
		return this._getJavaScriptFiles( directory, true );
	};

	/**
	 * List QuickFix classes.
	 *
	 * @param {String} directory
	 * @returns {Array}
	 */
	QuickFixBuilder.prototype.listQuickFixClasses = function( directory ) {
		var ret = this._getJavaScriptFiles( directory, true );

		if ( ret.indexOf( 'Repository' ) !== -1 ) {
			// Repository class should be excluded.
			ret.splice( ret.indexOf( 'Repository' ), 1 );
		}

		return ret;
	};

	/**
	 * Validates properties given in task data.
	 *
	 * It should check if directories are valid, etc.
	 *
	 * @param {Object} data Task data property.
	 * @throws {Error} When any problem is found.
	 */
	QuickFixBuilder.prototype.validate = function( data ) {
		var source = data.source,
			basePath = fs.realpathSync( '.' ) + sep;

		if ( !source ) {
			throw new Error( 'Missing source property in task data! Please revise the config in gruntfile.' );
		}

		try {
			if ( !fs.statSync( source ).isDirectory() ) {
				throw new Error( util.format( 'Invalid source. %s is not a directory!', basePath + source ) );
			}
		} catch ( e ) {
			if ( e.code === 'ENOENT' ) {
				throw new Error( util.format( 'Invalid source. Directory %s not found!', basePath + source ) );
			} else {
				throw e;
			}
		}
	};

	/**
	 * Creates language directories in this.targetDir.
	 */
	QuickFixBuilder.prototype.createLanguageDirectories = function() {
		var that = this,
			targetDir = this.targetDir;
		this.langs.map( function( lang ) {
			var langPath = targetDir + sep + lang;
			try {
				fs.mkdirSync( langPath );
			} catch ( e ) {
				// We're expecting only nonexisting dir exception.
				if ( e.code !== 'EEXIST' ) {
					throw e;
				}
			}
		} );
	};

	/**
	 * Builds a single, localized QuickFix class.
	 */
	QuickFixBuilder.prototype.buildQuickFixClass = function( quickFixName, lang ) {
		var srcFile = this.data.source + sep + quickFixName + '.js',
			targetFile = this.targetDir + sep + lang + sep + quickFixName + '.js',
			langDict = this._getDictionaryForQuickFix( quickFixName, lang ),
			// And here we'll store source content with added lang property.
			replacedContent = QuickFixBuilder.prototype._injectLanguageObject(
				quickFixName, fs.readFileSync( srcFile ), langDict, lang
			);

		fs.writeFileSync( targetFile, replacedContent );
	};

	/**
	 * Loads all the dictionaries (from lang source files, so these directly in lang dir).
	 */
	QuickFixBuilder.prototype.loadDictionaries = function() {
		var vm = require( 'vm' ),
			langDicts = this.langDicts,
			curLang,
			// This sandbox will imitate CKEDITOR.plugins.a11ychecker.quickFixes.lang function.
			sandBoxContext = {
				CKEDITOR: {
					plugins: {
						a11ychecker: {
							quickFixes: {
								lang: function( langCode, dict ) {
									// It will store the dict in a global langDicts.
									langDicts[ curLang ] = dict;
								}
							}
						}
					}
				}
			},
			context = vm.createContext( sandBoxContext );

		this.langs.map( function( langCode ) {
			langDicts[ langCode ] = {};
			curLang = langCode;

			var path = this.sourceLangsDir + sep + langCode + '.js';
			vm.runInContext( String( fs.readFileSync( path ) ), context );
		}, this );
	};

	/**
	 * Returns a dictionary for a quickfix in given language.
	 *
	 * @param {String} quickFixClass
	 * @param {String} langCode
	 * @returns {Object}
	 */
	QuickFixBuilder.prototype._getDictionaryForQuickFix = function( quickFixClass, langCode ) {
		return this.langDicts[ langCode ][ quickFixClass ] || {};
	};

	/**
	 * @param {String} fileSource Source of QuickFix class file.
	 * @param {Object} lang Language object (proper dirctionary).
	 */
	QuickFixBuilder.prototype._injectLanguageObject = function( className, fileSource, lang, langCode ) {
		// We'll prepend "CKEDITOR.plugins.a11ychecker.quickFixes.add" string occurence with lang
		// assignment.
		// Also we'll overwrite class name, so it'll end up with a calss like '<lang>/<className>'.
		var langProperty = className + '.prototype.lang = ' + JSON.stringify( lang ) + ';\n\t\t\t',
			localizedClassName = langCode + '/' + className,
			replacement = langProperty + 'CKEDITOR.plugins.a11ychecker.quickFixes.add( \'' + localizedClassName + '\'',
			ret = String( fileSource ).replace( /CKEDITOR\.plugins\.a11ychecker\.quickFixes\.add\(\s*['"].*['"]/, replacement );

		ret = ret.replace( /(CKEDITOR.plugins.a11ychecker.quickFixes.get\(\s*\{[\t ]*)/,
			'$1 langCode: \'' + langCode + '\',' );

		return ret;
	};

	/**
	 * Returns all javascript files DIRECTLY in give directory.
	 *
	 * @param {String} directory A relative or absolute path to the directory that needs to be readen.
	 * @param {Boolean} stripExtensions If `true` names in return array won't have .js extension.
	 * @returns {String[]} Array of strings with file names.
	 */
	QuickFixBuilder.prototype._getJavaScriptFiles = function( directory, stripExtensions ) {
		var files = fs.readdirSync( directory ).filter( function( file ) {
				return fs.statSync( directory + sep + file ).isFile() && QuickFixBuilder._endsWith( file.toLowerCase(), '.js' );
			} );

		// From each file we should remove extension.
		return files.map( function( entry ) {
			// Cut the .js extension.
			return stripExtensions ? entry.substr( 0, entry.length - 3 ) : entry;
		} );
	};

	/**
	 * A helper function for strings.
	 *
	 * Ensure that given string ends with given suffix.
	 *
	 * @static
	 */
	QuickFixBuilder._endsWith = function( str, suffix ) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	module.exports = function( grunt ) {
		grunt.registerMultiTask( 'build-quickfix', 'A builder for QuickFix classes.', function() {
			// 1. First list all possible lanugages by listing files directly in lang directory.
			// 2. Iterate over every QuickFix class.
				// 2.1. Create a lang file in lang\<lang>\<className>.js for every lang.
			var task = new QuickFixBuilder( grunt );
			task.exec( this );
		} );
	};

	module.exports.QuickFixBuilder = QuickFixBuilder;
}() );
