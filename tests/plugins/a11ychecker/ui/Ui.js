/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'ui/Ui', 'helpers/sinon/sinon_amd.min' ], function( Ui, sinon ) {
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
			},

			'test Ui.getEditorCommand': function() {
				var uiMock = getUiMockup(),
					editor = uiMock.controller.editor,
					ret;

				ret = uiMock.getEditorCommand();

				assert.areEqual( 1, editor.getCommand.callCount, 'editor.getCommand calls count' );
				assert.isTrue( editor.getCommand.alwaysCalledWith( 'a11ychecker' ), 'editor.getCommand argument' );

				assert.areSame( editor.commands.a11ychecker, ret, 'Return value' );
			}
		} );

		function getEditorMockup() {
			return {
				commands: {
					a11ychecker: {
						setState: sinon.spy()
					}
				},
				getCommand: sinon.spy( function() {
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
				getEditorCommand: Ui.prototype.getEditorCommand
			};
		}
	} );
} )();