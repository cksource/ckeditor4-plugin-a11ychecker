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

		/**
		 * This method overrides test initialization methods, so it's executed right after CKEditor instance
		 * are assinged to this.editor, but before tests are ran.
		 *
		 * You pass code that should be executed in a `fn` callback. This callback **must** call callback given
		 * to it as a first argument.
		 *
		 * This method has crazy implementation, featuring multiple method overriding in order to hook up
		 * to correct function.
		 *
		 * @param {Function} fn Function to be executed.
		 *
		 * It gets has one parameter: `callback`, which needs to be called to run the tests.
		 */
		addInitCode: function( bender, fn ) {
			// Watch out this shit can destroy your brain.
			/*bender.oldTest = fnOverride( bender.oldTest, function( original ) {
				return function( tests ) {
					tests[ 'async:init' ] = fnOverride( tests[ 'async:init' ], function( original ) {
						return function() {
							bender.testCase.callback = fnOverride( bender.testCase.callback, function( original ) {
								return function() {
									var that = this;
									// Here we can essentially add some custom code.
									fn.call( this, function() {
										original.apply( that, arguments );
									} );
								};
							} );
							return original.apply( this, arguments );
						};
					} );

					return original.apply( this, arguments );
				};
			} );*/
		},

		test: function( tests ) {
			var bender = window.bender;

			//bender.test( tests );
			//return;

			// We need to inject code that will run tests when AC is ready.
			/*this.addInitCode( bender, function( callback ) {
				var a11ychecker = bender.editor._.a11ychecker;
				if ( a11ychecker.exec ) {
					// If by any chance it's already real object, run synchronously.
					// IE tends to laod it synchronously.
					callback();
				} else {
					// Otherwise listen for event.
					a11ychecker.once( 'loaded', function() {
						// When Accessibility Checker controller is ready and loaded, we can
						// run tests.
						callback();
					} );
				}
			} );*/

			bender.test( tests );
		}
	};
} );
