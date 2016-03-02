/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'ui/Ui', 'mocking' ], function( Ui, mocking ) {
		bender.test( {
			'test Ui constuctor': function() {
				var controller = {},
					ret = new Ui( controller );

				assert.areSame( controller, ret.controller, 'Ui stores controller reference.' );
			},

			'test Ui show turns on the command': function() {
				var uiMock = getUiMockup(),
					editor = uiMock.controller.editor,
					a11yCommand = editor.getCommand( 'a11ychecker' );

				uiMock.show();

				assert.areEqual( 1, a11yCommand.setState.callCount, 'Command setState calls count' );
				assert.areSame( CKEDITOR.TRISTATE_ON, a11yCommand.setState.args[ 0 ][ 0 ], 'setState first arg' );
			},

			'test Ui hide turns off the command': function() {
				var uiMock = getUiMockup(),
					editor = uiMock.controller.editor,
					a11yCommand = editor.getCommand( 'a11ychecker' );

				uiMock.hide();

				assert.areEqual( 1, a11yCommand.setState.callCount, 'Command setState calls count' );
				assert.areSame( CKEDITOR.TRISTATE_OFF, a11yCommand.setState.args[ 0 ][ 0 ], 'setState first arg' );

				mocking.assert.calledOnce( uiMock._selectIssue );
			},

			'test Ui.getEditorCommand': function() {
				var uiMock = getUiMockup(),
					editor = uiMock.controller.editor,
					ret;

				ret = uiMock.getEditorCommand();

				assert.areEqual( 1, editor.getCommand.callCount, 'editor.getCommand calls count' );
				assert.isTrue( editor.getCommand.alwaysCalledWith( 'a11ychecker' ), 'editor.getCommand argument' );

				assert.areSame( editor.commands.a11ychecker, ret, 'Return value' );
			},

			'test Ui.focusChanged': function() {
				var uiMock = getUiMockup(),
					evt = {
						data: {
							current: {
								element: 3
							},
							previous: {
								element: 5
							}
						}
					};

				uiMock.markFocus = mocking.spy();
				uiMock.unmarkFocus = mocking.spy();

				uiMock.focusChanged( evt );

				assert.areSame( 1, uiMock.markFocus.callCount, 'uiMock.markFocus call count' );
				mocking.assert.alwaysCalledWith( uiMock.markFocus, 3 );
				mocking.assert.alwaysCalledWith( uiMock.unmarkFocus, 5 );
			},

			'test Ui.focusChanged no previous': function() {
				// Event does not contain previous entry, so unmark should not be called.
				var uiMock = getUiMockup(),
					evt = {
						data: {
							current: {
								element: 3
							}
						}
					};

				uiMock.markFocus = mocking.spy();
				uiMock.unmarkFocus = mocking.spy();

				uiMock.focusChanged( evt );

				assert.areSame( 0, uiMock.unmarkFocus.callCount, 'uiMock.unmarkFocus call count' );
			},

			'test focus change within the same element': function() {
				// In this TC focus was changed to next issue, but this issue is coming
				// still from the same element (#28).
				var uiMock = getUiMockup(),
					commonElement = {
						equals: function() {
							return true;
						}
					},
					evt = {
						data: {
							current: {
								element: commonElement
							},
							previous: {
								element: commonElement
							}
						}
					};

				uiMock.markFocus = mocking.spy();
				uiMock.unmarkFocus = mocking.spy();

				uiMock.focusChanged( evt );

				// markFocus needs to be called after unmark. Otherwise the class added in markFocus would be
				// removed in unmark focus.
				assert.isTrue( uiMock.markFocus.calledAfter( uiMock.unmarkFocus ), 'markFocus call order' );
			}
		} );

		function getEditorMockup() {
			return {
				commands: {
					a11ychecker: {
						setState: mocking.spy()
					}
				},
				getCommand: mocking.spy( function() {
					return this.commands.a11ychecker;
				} )
			};
		}

		function getUiMockup() {
			return {
				controller: {
					editor: getEditorMockup()
				},
				show: Ui.prototype.show,
				hide: Ui.prototype.hide,
				focusChanged: Ui.prototype.focusChanged,
				getEditorCommand: Ui.prototype.getEditorCommand,
				_selectIssue: mocking.spy()
			};
		}
	} );
} )();
