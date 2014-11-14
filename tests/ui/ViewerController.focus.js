/* bender-tags: a11ychecker,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	// Note that we have an extra (unused) requirement for 'EngineMock' and 'Controller' classes.
	// That way it will force them to be available for the editor, and we have sure that a11ychecker
	// plugin will be ready synchronously.
	require( [ 'ui/ViewerController', 'ui/ViewerDescription', 'EngineMock', 'Controller', 'ui/ViewerController' ], function( ViewerController, ViewerDescription, EngineMock ) {

		bender.test( {
			'async:init': function() {
				var that = this;

				bender.tools.setUpEditors( {
					classic: {
						name: 'editor1',
						config: {},
						startupData: '<p>foo</p>'
					},
					inline: {
						name: 'editor2',
						creator: 'inline',
						config: {},
						startupData: '<p>foo</p>'
					}
				}, function( editors, bots ) {
					that.editorBots = bots;
					that.editors = editors;
					that.editor = editors.classic;

					// We should get rid of that timeout, but without it inline editor
					// will not have _.a11ychecker property inited.
					window.setTimeout( function() {
						for ( var i in that.editors ) {
							that.editors[ i ]._.a11ychecker.engine = new EngineMock();
						}
						that.callback();
					}, 300 );
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

			'test focus on click': function() {
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					expectedFocusElem = viewer.navigation.parts.next;

				// Perform check, so we have a11ychecker.list
				a11ychecker.check();

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

			'test focus trap': function() {
				// Dialog should have focus trap applied.
				// That means that tab press at the last focusable element should take you to the
				// first one and vice versa.
				var a11ychecker = this.editor._.a11ychecker,
					viewer = a11ychecker.viewerController.viewer,
					initialFocusElem = this._getLastFocusable( viewer ),
					expectedFocusElem = viewer.navigation.parts.previous;
				a11ychecker.exec();
				// Will focus the last button.
				initialFocusElem.focus();

				window.setTimeout( function() {
					resume( function() {
						initialFocusElem.fire( 'keydown', getKeyEvent( 9 ) );

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
					expectedFocusElem = this._getLastFocusable( viewer );
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
				// This test will ensure that after showing the balloon (.next() method) editor
				// stays marked as focused, therefore it won't be blured.
				var editor = this.editors.inline,
					a11ychecker = editor._.a11ychecker;

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

			'test a11ychecker.exec focus': function() {
				// For exec function the focus should go to the next button.
				var a11ychecker = this.editor._.a11ychecker,
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
			},

			// Returns the last focusable element in viewer.
			_getLastFocusable: function ( viewer ) {
				return viewer.form.parts.ignoreButton;
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