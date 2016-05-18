/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar,undo */
/* bender-include: %TEST_DIR%../_assets/jquery.min.js */

( function() {
	'use strict';

	// Note that we have an extra (unused) requirement for 'EngineMock' and 'Controller' classes.
	// That way it will force them to be available for the editor, and we have sure that a11ychecker
	// plugin will be ready synchronously.
	bender.require( [ 'testSuite', 'EngineMock' ], function( testSuite, EngineMock ) {
		testSuite.useEngine( EngineMock );

		bender.editors = {
			classic: {
				name: 'editor1',
				startupData: '<p>foo</p>'
			},
			inline: {
				name: 'editor2',
				creator: 'inline',
				startupData: '<p>foo</p>'
			}
		};

		var tests = {
			tearDown: function() {
				// For each test a11ychecker needs to be closed.
				// Note that we have 2 editor instances, but only 1 can be enabled at
				// a time.
				function cleanupAC( editor ) {
					var a11ychecker = editor._.a11ychecker;

					if ( a11ychecker.issues && a11ychecker.issues.getFocused() ) {
						// @todo: it might be worth to investigate what's causing wrong selection if we won't call resetFocus().
						a11ychecker.issues.resetFocus();
					}

					a11ychecker.close();
				}

				cleanupAC( this.editors.classic );
				cleanupAC( this.editors.inline );
			},

			'test initial focus': function( editor ) {
				var a11ychecker = editor._.a11ychecker;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				assert.isTrue( true );
			},

			'test next focus': function( editor ) {
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				a11ychecker.next( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();

						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( viewer.navigation.parts.next, activeElement, 'The "Next" button is focused' );
					} );
				} );

				wait();
			},

			'test prev focus': function( editor ) {
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				a11ychecker.prev( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();

						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( viewer.navigation.parts.previous, activeElement, 'The "Previous" button is focused' );
					} );
				} );

				wait();
			},

			'test focus on click': function( editor ) {
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.next;

				// Perform check, so we have a11ychecker.list
				a11ychecker.check( {
					ui: true
				} );

				var issuedElement = a11ychecker.issues.getItem( 0 ).element,
					evt = {
						data: {
							getTarget: function() {
								return issuedElement;
							}
						}
					};
				// Ensure that element is not marked as focused.
				issuedElement.removeClass( 'cke_a11yc_focused' );

				a11ychecker.editableDecorator.clickListener( evt );

				// Remember that balloon shows with a delay, so we need to workaround that.
				window.setTimeout( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();

						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( expectedFocusElem, activeElement, 'The "Next" button is focused' );
					} );
				}, 500 );

				wait();
			},

			'test focus trap': function( editor ) {
				// Dialog should have focus trap applied.
				// That means that tab press at the last focusable element should take you to the
				// first one and vice versa.
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					initialFocusElem = getLastFocusable( viewer ),
					expectedFocusElem = viewer.panel.parts.close;
				a11ychecker.exec();
				// Will focus the last button.
				initialFocusElem.focus();

				initialFocusElem.fire( 'keydown', getKeyEvent( 9 ) );

				assert.areSame( expectedFocusElem, CKEDITOR.document.getActive(), 'Invalid element focused' );
			},

			'test focus trap reversed': function( editor ) {
				// Dialog should have focus trap applied.
				// That means that shift-tab at first focusable element should take you to the last one,
				// and vice versa.
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					initialFocusElem = viewer.panel.parts.close,
					expectedFocusElem = getLastFocusable( viewer );
				a11ychecker.exec();

				// Focuses the close button.
				initialFocusElem.focus();

				window.setTimeout( function() {
					resume( function() {
						initialFocusElem.fire( 'keydown', getKeyEvent( CKEDITOR.SHIFT + 9 ) );

						var activeElement = CKEDITOR.document.getActive();
						assert.areSame( expectedFocusElem, activeElement, 'Invalid element focused' );
					} );
				}, 300 );

				wait();
			},

			'test inline editor focus with balloon': function( editor ) {
				// This test will ensure that after showing the balloon (.next() method) editor
				// stays marked as focused, therefore it won't be blured.
				var a11ychecker = editor._.a11ychecker;

				a11ychecker.exec();

				a11ychecker.next( function() {
					// Put an extra timeout.
					window.setTimeout( function() {
						resume( function() {
							assert.isTrue( editor.focusManager.hasFocus, 'Editor has the focus' );
						} );
					}, 500 );
				} );

				wait();
			},

			'test a11ychecker.exec focus': function( editor ) {
				// For exec function the focus should go to the next button.
				var a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.next;
				a11ychecker.exec();

				window.setTimeout( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();
						assert.areSame( expectedFocusElem, activeElement, 'Invalid element focused' );
					} );
				}, 300 );

				wait();
			}
		};

		// Returns the last focusable element in viewer.
		function getLastFocusable( viewer ) {
			return viewer.form.parts.ignoreButton;
		}

		// Returns a key event mockup.
		// @param {Number} keystroke Keystroke with modifiers. eg. CKEDITOR.SHIFT + 9 // shift + tab
		function getKeyEvent( keystroke ) {
			// This fancy construction will remove modifier bits.
			var key = keystroke & ~( CKEDITOR.CTRL | CKEDITOR.ALT | CKEDITOR.SHIFT );

			return {
				getKey: function() {
					return key;
				},
				getKeystroke: function() {
					return keystroke;
				},
				stopPropagation: function() {
				},
				preventDefault: function() {
				}
			};
		}

		testSuite.testEditors( bender.editors, tests );
	} );
} )();
