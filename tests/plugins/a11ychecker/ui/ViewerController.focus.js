/* bender-tags: a11ychecker,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	// Note that we have an extra (unused) requirement for 'EngineMock' and 'Controller' classes.
	// That way it will force them to be available for the editor, and we have sure that a11ychecker
	// plugin will be ready synchronously.
	require( [ 'ui/ViewerController', 'EngineMock', 'Controller', 'ui/ViewerController' ], function( ViewerController ) {

		bender.test( {
			'async:init': function() {
				var that = this;

				bender.tools.setUpEditors( {
					classic: {
						name: 'editor1',
						config: {
							a11ychecker_engine: 'EngineMock'
						},
						startupData: '<p>foo</p>'
					},
					inline: {
						name: 'editor2',
						creator: 'inline',
						config: {
							a11ychecker_engine: 'EngineMock'
						},
						startupData: '<p>foo</p>'
					}
				}, function( editors, bots ) {
					that.editorBots = bots;
					that.editors = editors;
					that.editor = editors.classic;

					that.callback();
				} );
			},

			tearDown: function() {
				// For each test a11ychecker needs to be closed.
				// Note that we have 2 editor instances, but only 1 can be enabled at
				// a time.
				this.editor._.a11ychecker.close();
				this.editors.inline._.a11ychecker.close();
			},

			'test initial focus': function() {
				var a11ychecker = this.editor._.a11ychecker;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );
				assert.isTrue( true );
			},

			'test next focus': function() {
				var a11ychecker = this.editor._.a11ychecker,
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

			'test prev focus': function() {
				var a11ychecker = this.editor._.a11ychecker,
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

			'test navigation select change focus': function() {
				// After changing the navigation in the select, navigation should not be lost.
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.list;
				a11ychecker.exec();
				a11ychecker.showIssue( 0 );

				// Fake the value change.
				viewer.navigation.fire( 'change', 1 );

				window.setTimeout( function() {
					resume( function() {
						var activeElement = CKEDITOR.document.getActive();
						assert.isNotNull( activeElement, 'An element is focused' );
						assert.areSame( expectedFocusElem, activeElement, 'The issue list is focused' );
					} );
				}, 300 );

				wait();
			},

			'test focus trap': function() {
				// Dialog should have focus trap applied.
				// That means that shift-tab at first focusable element should take you to the last one,
				// and vice versa.
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.previous;
				a11ychecker.exec();
				// Will focus next button.
				a11ychecker.next();

				window.setTimeout( function() {
					resume( function() {
						viewer.navigation.parts.next.fire( 'keydown', getKeyEvent( 9 ) );

						var activeElement = CKEDITOR.document.getActive();
						assert.areSame( expectedFocusElem, activeElement, 'Invalid element focused' );
					} );
				}, 300 );

				wait();
			},

			'test focus trap reversed': function() {
				// Dialog should have focus trap applied.
				// That means that shift-tab at first focusable element should take you to the last one,
				// and vice versa.
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.next;
				a11ychecker.exec();
				// Will focus prev button.
				a11ychecker.prev();

				window.setTimeout( function() {
					resume( function() {
						viewer.navigation.parts.previous.fire( 'keydown', getKeyEvent( CKEDITOR.SHIFT + 9 ) );

						var activeElement = CKEDITOR.document.getActive();
						assert.areSame( expectedFocusElem, activeElement, 'Invalid element focused' );
					} );
				}, 300 );

				wait();
			},

			'test inline editor focus with balloon': function() {
				var editor = this.editors.inline,
					a11ychecker = editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.next;
				a11ychecker.exec();
				// Will focus prev button.
				a11ychecker.next( function() {
					// Put an extra timeout.
					window.setTimeout( function() {
						resume( function() {
							assert.isTrue( editor.focusManager.hasFocus, 'Editor has the focus' );
						} );
					}, 500 );
				} );

				wait();
			}
		} );

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
	} );
} )();