/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'mocking', 'EngineMock' ], function( mocking, EngineMock ) {
	'use strict';

	var fnOverride = CKEDITOR.tools.override;

	/**
	 * A testCase object.
	 *
	 * Its main purpose is to expose test method(), but it also contains some useful features:
	 * * It contains often used modules/classes: mocking and EngineMock
	 */
	return {
		// Engine mock type.
		EngineMock: EngineMock,

		// Mocking module.
		mocking: mocking,

		test: function ( tests ) {
			window.bender.test( tests );
		},

		testEditors: function( editors, tests ) {

			var bender = window.bender,
				loader = {
					loaded: 0,
					editorsCount: CKEDITOR.tools.objectKeys( editors ).length,
					editorLoaded: function( evt ) {
						
						if ( !loader.isDone() ) {
							loader.loaded += 1;
						}
						
						if ( loader.isDone() && loader.done ) {
							loader.done();
						}
					},
					done: null,
					isDone: function() {
						return this.loaded >= this.editorsCount;
					}
				},
				originalAsyncInit = tests[ 'async:init' ];

			// Make sure that bender.editors is set.
			bender.editors = editors;

			tests[ 'async:init' ] = function() {
				var that = this;
				
				loader.done = function() {
					if ( !originalAsyncInit ) {
						that.callback();
					} else {
						// It's up to implementer to call that.callback().
						originalAsyncInit.call( that );
					}
				};
				
				for ( var editorName in this.editors ) {
					var editor = this.editors[ editorName ],
						a11ychecker = editor._.a11ychecker;
					
					if ( a11ychecker.exec ) {
						// If by any chance it's already real object, run synchronously.
						// IE tends to laod it synchronously.
						loader.editorLoaded( { editor: this.editors[ editorName ] } );
					} else {
						// Otherwise listen for event.
						a11ychecker.once( 'loaded', loader.editorLoaded, editor );
					}
				}
			};

			bender.test( bender.tools.createTestsForEditors( CKEDITOR.tools.objectKeys( editors ), tests ) );
		},

		/**
		 * Adds a necessary callback logic that will set the default engine type. Useful for mocking the engine.
		 *
		 * **It will be applied to any editor created since it's call**, since it adds a global listener.
		 *
		 * @param {Function} type - A type inheriting from {@link CKEDITOR.plugins.a11ychecker.Engine}, e.g. 
		 * {@link CKEDITOR.plugins.a11ychecker.EngineMock}.
		 */
		useEngine: function( type ) {
			CKEDITOR.on( 'instanceCreated', function( evt ) {
				evt.editor.on( 'instanceReady', function( readyEvt ) {
					readyEvt.editor._.a11ychecker.getEngineType = function( callback ) { callback( EngineMock ); };
				}, null, null, 10 );
			} );
		}
	};
} );
