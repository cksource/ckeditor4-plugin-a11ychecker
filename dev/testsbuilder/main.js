/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/*global describe, it, before, beforeEach, after, afterEach, require */

'use strict';

var assert = require( 'chai' ).assert,
	path = require( 'path' ),
	fs = require( 'fs' ),
	sinon = require( 'sinon' ),
	QuickFixBuilder = require( '../tasks/build-quickfix' ).QuickFixBuilder,
	fixturesPath = path.resolve( 'dev/testsbuilder/_fixtures' );

describe( 'Module', function() {
	it( 'exposes QuickFixBuilder type', function() {
		assert.instanceOf( QuickFixBuilder, Function, 'Type QuickFixBuilder is exposed' );
	} );
} );

describe( 'QuickFixBuilder', function() {
	function getTaskMockup() {
		return {
			data: {}
		};
	}

	describe( 'listLanguages', function() {
		var mock = {
				_getJavaScriptFiles: sinon.spy( function() {
					return [];
				} )
			},
			ret = QuickFixBuilder.prototype.listLanguages.call( mock, 'langList' );

		assert.isArray( ret, 'Return val is an array' );
		sinon.assert.calledWith( mock._getJavaScriptFiles, 'langList', true );
	} );

	describe( 'listQuickFixClasses', function() {
		it( 'reuses _getJavaScriptFiles', function() {
			var mock = {
					_getJavaScriptFiles: sinon.spy( function() {
						return [];
					} )
				},
				ret;

			ret = QuickFixBuilder.prototype.listQuickFixClasses.call( mock, 'foo' );

			assert.isArray( ret, 'Return type' );
			sinon.assert.calledWith( mock._getJavaScriptFiles, 'foo', true );
		} );

		it( 'excludes repository class', function() {
			var mock = {
					_getJavaScriptFiles: function() {
						return [ 'a', 'Repository', 'b' ];
					}
				},
				ret;

			ret = QuickFixBuilder.prototype.listQuickFixClasses.call( mock );

			assert.sameMembers( ret, [ 'a', 'b' ], 'Repository string is removed' );
		} );
	} );

	describe( 'validate', function() {
		it( 'throws exception on missing source', function() {
			assert.throws( function() {
				QuickFixBuilder.prototype.validate( {} );
			}, Error, /Missing source property in task data/ );
		} );

		it( 'thorws exception on missing directory', function() {
			assert.throws( function() {
				QuickFixBuilder.prototype.validate( {
					source: './foob_arr`'
				} );
			}, Error, /Invalid source\. Directory .+ not found!/ );
		} );

		it( 'thorws exception when source is not a dir', function() {
			assert.throws( function() {
				QuickFixBuilder.prototype.validate( {
					source: 'package.json'
				} );
			}, Error, /Invalid source\. .+ is not a directory/ );
		} );
	} );

	describe( 'exec', function() {
		it( 'logs validation errors', function() {
			// All validation erros should be redirected to grunt error log.
			var mock = {
					grunt: {
						log: {
							error: sinon.spy()
						}
					},
					validate: function() {
						throw new Error( 'foobar' );
					}
				},
				task = getTaskMockup(),
				ret;

			ret = QuickFixBuilder.prototype.exec.call( mock, task );

			sinon.assert.calledWith( mock.grunt.log.error, 'foobar' );
			assert.isFalse( ret, 'Return value' );
		} );

		it( 'logs a warning upon no langs', function() {
			var mock = {
					grunt: {
						fail: {
							warn: sinon.spy()
						}
					},
					validate: sinon.spy(),
					listLanguages: function() {
						// No languages should be found.
						return [];
					}
				},
				task = getTaskMockup(),
				ret;

			ret = QuickFixBuilder.prototype.exec.call( mock, task );

			sinon.assert.calledWith( mock.grunt.fail.warn, 'No languages detected, aborting.' );
			assert.isFalse( ret, 'Return value' );
		} );
	} );

	describe( 'createLanguageDirectories', function() {
		var rimraf = require( 'rimraf' ),
			dirCreationPath = fixturesPath + '/' + 'dirCreation';

		beforeEach( function() {
			// Before going here we need to cleanup dir.
			if ( fs.existsSync( dirCreationPath ) ) {
				rimraf.sync( dirCreationPath );
			}
			// Make so it's empty.
			fs.mkdirSync( dirCreationPath );
		} );

		afterEach( function() {
			if ( fs.existsSync( dirCreationPath ) ) {
				rimraf.sync( dirCreationPath );
			}
		} );

		it( 'creates dir structure', function() {
			var mock = {
					langs: [ 'en', 'en-us', 'sp' ],
					targetDir: dirCreationPath,
					classes: []
				},
				files;

			QuickFixBuilder.prototype.createLanguageDirectories.call( mock );

			// Now we'll check languages
			files = fs.readdirSync( dirCreationPath );

			assert.sameMembers( files, mock.langs, 'Created directories' );
		} );
	} );

	describe( 'loadDictionaries', function() {
		it( 'reads dictionaries from directory', function() {
			var mock = {
					langs: [ 'en', 'de' ],
					langDicts: {},
					loadDictionaries: QuickFixBuilder.prototype.loadDictionaries,
					sourceLangsDir: fixturesPath + '/sampleDictionaries'
				};

			mock.loadDictionaries();

			assert.sameMembers( Object.keys( mock.langDicts ), mock.langs, 'langDicts has valid keys' );

			assert.deepEqual( mock.langDicts, {
				en: {
					a: 'en1',
					b: 'en2'
				},
				de: {
					a: 'de1',
					b: 'de2'
				}
			}, 'Dicts fetched correctly' );
		} );
	} );

	describe( '_injectLanguageObject', function() {
		it( 'places lang object correctly', function() {
			var inputFile = '( function() {' +
					'	\'use strict\';' +
					'	function QuickFix( issue ) {}' +
					'	QuickFix.prototype = {};' +
					'	CKEDITOR.plugins.a11ychecker.quickFixes.add( \'QuickFix\', QuickFix );' +
					'}() );',
				expected = '( function() {' +
					'	\'use strict\';' +
					'	function QuickFix( issue ) {}' +
					'	QuickFix.prototype = {};' +
					'	QuickFix.prototype.lang = {"a":"b","foo":"bar"};\n' +
					'	\t\tCKEDITOR.plugins.a11ychecker.quickFixes.add( \'zh/QuickFix\', QuickFix );' +
					'}() );',
				lang = {
					a: 'b',
					foo: 'bar'
				},
				_injectLanguageObject = QuickFixBuilder.prototype._injectLanguageObject;

			assert.strictEqual( _injectLanguageObject( 'QuickFix', inputFile, lang, 'zh' ), expected,
				'Language object inlined into source' );
		} );

		it( 'places langCode property correctly', function() {
			// If QuickFix class calls Repository.get() method we need to make sure that
			// lang code is injected to the options object.
			var inputFile = '( function() {' +
					'	\'use strict\';' +
					'	function SubClass( issue ) {}' +
					'	CKEDITOR.plugins.a11ychecker.quickFixes.get( {\n' +
					'		name: \'QuickFix\', ' +
					'		callback: function( QuickFix ) {' +
					'			SubClass.prototype = new QuickFix();' +
					'			CKEDITOR.plugins.a11ychecker.quickFixes.add( \'SubClass\', SubClass );' +
					'		}' +
					'	} );' +
					'}() );',
				expected = '( function() {' +
					'	\'use strict\';' +
					'	function SubClass( issue ) {}' +
					'	CKEDITOR.plugins.a11ychecker.quickFixes.get( { langCode: \'en\',\n' +
					'		name: \'QuickFix\', ' +
					'		callback: function( QuickFix ) {' +
					'			SubClass.prototype = new QuickFix();' +
					'			SubClass.prototype.lang = {};\n' +
					'			CKEDITOR.plugins.a11ychecker.quickFixes.add( \'en/SubClass\', SubClass );' +
					'		}' +
					'	} );' +
					'}() );',
				lang = {},
				_injectLanguageObject = QuickFixBuilder.prototype._injectLanguageObject;

			assert.strictEqual( _injectLanguageObject( 'SubClass', inputFile, lang, 'en' ), expected,
				'Language object inlined into source' );
		} );
	} );

	describe( '_getJavaScriptFiles', function() {
		it( 'return JS files in dir', function() {
			var ret = QuickFixBuilder.prototype._getJavaScriptFiles( fixturesPath + '/langList' ),
				expected = [ 'cz.js', 'de.js', 'en-us.js', 'en.js', 'it.js', 'pt.js' ];

			assert.isArray( ret, 'Return val is an array' );
			assert.sameMembers( ret, expected, 'Return langs array' );
			// Order should be preserved too.
			assert.deepEqual( ret, expected, 'Returned langs order' );
		} );

		it( 'strips the extension', function() {
			var ret = QuickFixBuilder.prototype._getJavaScriptFiles( fixturesPath + '/langList', true ),
				expected = [ 'cz', 'de', 'en-us', 'en', 'it', 'pt' ];

			assert.isArray( ret, 'Return val is an array' );
			assert.sameMembers( ret, expected, 'Return langs array' );
		} );
	} );


	describe( '_endsWith', function() {
		it( 'works', function() {
			assert.isTrue( QuickFixBuilder._endsWith( 'foo/bar/baz', 'baz' ) );
			assert.isTrue( QuickFixBuilder._endsWith( 'a', 'a' ) );
		} );

		it( 'works negative', function() {
			assert.isFalse( QuickFixBuilder._endsWith( 'a', 'b' ) );
			assert.isFalse( QuickFixBuilder._endsWith( 'a', 'aa' ) );
			assert.isFalse( QuickFixBuilder._endsWith( 'abc', 'd' ) );
		} );
	} );
} );
