/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/*global require*/

( function() {
	/*jshint -W020 */
	'use strict';

	bender.require( [ 'Engine', 'mocking' ], function( Engine, mocking ) {

		bender.test( {
			'test Engine.getFixType': function() {
				var originRequire = require;

				require = mocking.spy();

				Engine.getFixType( 'Foo' );

				assert.areSame( 1, require.callCount, 'require calls count' );
				var requireParam = require.getCalls()[ 0 ].args[ 0 ];
				assert.isInstanceOf( Array, requireParam, 'Invalid param type given to require()' );
				assert.areSame( 'quickfix/Foo', requireParam[ 0 ], 'Invalid param value given to require()' );

				require = originRequire;
			},

			'test Engine.getFixType callback': function() {
				var quickFixMock = {},
					originRequire = require,
					fixCallback = mocking.spy();

				require = mocking.spy( function( name, requireCallback ) {
					requireCallback( quickFixMock );
				} );

				try {
					Engine.getFixType( 'Foo', fixCallback );

					assert.areSame( 1, fixCallback.callCount, 'Callback called once' );
					var requireParam = fixCallback.getCalls()[ 0 ].args[ 0 ];
					assert.areSame( quickFixMock, requireParam, 'Callback has a valid parameter' );
				} catch ( e ) {
					throw e;
				} finally {
					require = originRequire;
				}
			},

			'test Engine.getFixType store types': function() {
				// Types fetched by the getFix method, should be stored statically
				// in Engine.fixes object.
				var quickFixMock = {},
					originRequire = require;

				require = mocking.spy( function( name, requireCallback ) {
					requireCallback( quickFixMock );
				} );

				try {
					Engine.getFixType( 'BomBomFoo' );

					assert.areSame( quickFixMock, Engine.fixes.BomBomFoo,
						'Fetched QuickFix should be stored in Engine.fixes' );
				} catch ( e ) {
					throw e;
				} finally {
					require = originRequire;
				}
			},

			'test Engine.getFixType returns cached type': function() {
				// getFix() should not call require() when it already has requested type
				// cached.
				var quickFixMock = {},
					originRequire = require;

				require = mocking.spy();

				try {
					Engine.fixes.Baz = 1;
					Engine.getFixType( 'Baz', function( param ) {
						assert.areSame( 1, param, 'Valid param given' );
					} );

					assert.areSame( 0, require.callCount, 'require was not called' );
				} catch ( e ) {
					throw e;
				} finally {
					require = originRequire;
				}
			},

			'test Engine.getFixes no matching quickfixes': function() {
				var engine = new Engine(),
					callback = mocking.spy();

				engine.getFixes( {
					// This property should not exist in engine.fixesMapping.
					id: 'foo-bar-baz'
				}, callback );

				assert.areSame( 1, callback.callCount, 'callback calls count' );
				assert.isTrue( callback.alwaysCalledWithExactly( [] ), 'callback parameter' );
			},

			'test Engine.getFixes': function() {
				var engine = new Engine(),
					callback = mocking.spy( function( quickFixes ) {
						resume( function() {
							assert.areSame( 1, callback.callCount, 'callback calls count' );
							assert.isInstanceOf( Array, quickFixes, 'Invalid parameter type given to callback' );
							assert.areSame( 4, quickFixes.length, 'Invalid quickfixes count' );
							assert.isInstanceOf( DummyType, quickFixes[ 0 ], 'Items have proper type' );
						} );
					} ),
					originRequire = require,
					// A sequence of results returned by require() method.
					requireSequence = [ new DummyType(), new DummyType(), new DummyType(), new DummyType() ],
					quickFixGet = mocking.spy( function( options ) {
						setTimeout( function() {
							options.callback( requireSequence.pop() );
						}, 40 );
					} );

				mocking.mockProperty( 'CKEDITOR.plugins.a11ychecker.quickFixes.getInstance', window, quickFixGet );

				// That will force 4 require() calls.
				engine.fixesMapping.foo = [ 1, 2, 3, 4 ];

				engine.getFixes( {
					// This property should not exist in engine.fixesMapping.
					id: 'foo'
				}, callback );

				wait( 3000 );

				function DummyType() {
				}
			},

			'test Engine.filterIssues': function() {
				var engine = new Engine(),
					sketchpad = {},
					issues = {
						filter: mocking.spy( function( fn ) {
							assert.isInstanceOf( Function, fn );
							var ret = fn.call( this, fn );
							assert.isFalse( ret );
							return ret;
						} )
					};

				engine._filterIssue = mocking.spy( function() {
					return false;
				} );

				engine.filterIssues( issues, sketchpad );

				assert.areSame( 1, engine._filterIssue.callCount, 'Engine._filterIssue call count' );
				assert.areSame( sketchpad, engine._filterIssue.args[ 0 ][ 1 ],
					'Sketchpad is given as a second param' );
			},

			'test Engine.filterIssues no filter': function() {
				// By default no IssueList.filter should be called.
				var engine = new Engine(),
					sketchpad = {},
					issues = {
						filter: mocking.spy()
					};

				engine.filterIssues( issues, sketchpad );

				assert.areSame( 0, issues.filter.callCount, 'IssueList.filter call count' );
			}
		} );
	} );
} )();
