/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */

( function() {
	'use strict';

	bender.require( [ 'HotkeyManager' ], function( HotkeyManager ) {
		bender.test( {
			'test HotkeyManager.parseConfig': function() {
				var sampleConfig = {
						open: CKEDITOR.CTRL + CKEDITOR.ALT + 69 /*E*/ ,
						prev: CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 /*E*/ ,
						next: CKEDITOR.CTRL + 69 /*E*/
					},
					ret;

				ret = HotkeyManager.parseConfig( sampleConfig );

				assert.isInstanceOf( Object, ret, 'Return value has a valid type' );
				var keys = CKEDITOR.tools.objectKeys( ret ).sort(),
					expectedKeys = [ '1114181', '2228251', '27', '3342405', '5570629' ],
					expectedValues = [
						'a11ychecker.next',
						'a11ychecker.listen',
						'a11ychecker.close',
						'a11ychecker.prev',
						'a11ychecker'
					],
					i;

				arrayAssert.itemsAreSame( expectedKeys, keys, 'Object has valid keys' );

				for ( i = 0; i < expectedValues.length; i++ ) {
					assert.areEqual( expectedValues[ i ], ret[ expectedKeys[ i ] ],
						'Value of ret[ ' + expectedKeys[ i ] + ' ]' );
				}
			},

			'test HotkeyManager.setEditorHotkeys': function() {
				var editor = {
						setKeystroke: sinon.spy()
					},
					hotkeyMapping = {
						1114181: 'a11ychecker.next',
						3342405: 'a11ychecker.prev',
						5570629: 'a11ychecker'
					};

				HotkeyManager.prototype.setEditorHotkeys.call( {}, editor, hotkeyMapping );

				assert.areEqual( 3, editor.setKeystroke.callCount, 'editor.setKeystroke call count' );

				assert.isTrue( editor.setKeystroke.calledWith( 1114181, 'a11ychecker.next' ), '#1 setKeystroke call' );
				assert.isTrue( editor.setKeystroke.calledWith( 3342405, 'a11ychecker.prev' ), '#2 setKeystroke call' );
				assert.isTrue( editor.setKeystroke.calledWith( 5570629, 'a11ychecker' ), '#3 setKeystroke call' );
			},

			'test HotkeyManager.setBalloonHotkeys': function() {
				var viewerController = {},
					hotkeyMgrMock = {
						setBalloonHotkeys: HotkeyManager.prototype.setBalloonHotkeys,
						getBalloonKeydown: sinon.spy( function() {
							return 'bar';
						} )
					},
					hotkeyMapping = {
						1114181: 'a11ychecker.next',
						3342405: 'a11ychecker.prev',
						5570629: 'a11ychecker'
					},
					panelShowListener = mockProperty( 'viewer.panel.addShowListener', viewerController ),
					panelPartsListener = mockProperty( 'viewer.panel.parts.panel.on', viewerController );

				// Mocking panel.parts.panel.

				mockProperty( 'controller.editor', hotkeyMgrMock );
				hotkeyMgrMock.setBalloonHotkeys( viewerController, hotkeyMapping );

				// First of all, a show listener to the balloon should be added.
				assert.areSame( 1, panelShowListener.callCount, 'panel.addShowListener was called' );
				var showListener = panelShowListener.args[ 0 ][ 0 ];
				assert.isInstanceOf( Function, showListener, 'panel.addShowListener argument type' );

				// Now we need to call the listener manually, because we want ensure that it calls
				// panelElement.on() and returns object.
				showListener();

				// Ensure that panel.parts.panel.on( 'keypress', fn ) was called.
				assert.areEqual( 1, panelPartsListener.callCount, 'panel.parts.panel listeners count' );
				sinon.assert.calledWith( panelPartsListener, 'keydown', 'bar' );
			},

			'test HotkeyManager.getBalloonKeydown': function() {
				var evt = {},
					hotkeymapping = {
						1114181: 'a11ychecker.next'
					},
					editor = {
						execCommand: sinon.spy()
					};

				mockProperty( 'data.getKeystroke', evt, function() {
					return 1114181;
				} );
				evt.data.preventDefault = sinon.spy();

				var listener = HotkeyManager.prototype.getBalloonKeydown( editor, hotkeymapping );

				listener( evt );

				assert.areEqual( 1, editor.execCommand.callCount, 'editor.execCommand call count' );
				assert.isTrue( editor.execCommand.alwaysCalledWith( 'a11ychecker.next' ), 'execCommand parameters' );
			},

			'test HotkeyManager.getBalloonKeydown false': function() {
				// "pressed" keystroke is not in hotkeymapping so editor.execCommand should not be called.
				var evt = {},
					hotkeymapping = {
						1111: 'a11ychecker.next'
					},
					editor = {
						execCommand: sinon.spy()
					};

				mockProperty( 'data.getKeystroke', evt, function() {
					return 2222;
				} );
				evt.data.preventDefault = sinon.spy();

				var listener = HotkeyManager.prototype.getBalloonKeydown( editor, hotkeymapping );

				listener( evt );

				assert.areEqual( 0, editor.execCommand.callCount, 'editor.execCommand call count' );
			}
		} );

		// If no value is given an instance of sinon.spy() will be used
		function mockProperty( propertyPath, object, value ) {
			var members = propertyPath.split('.'),
				propertyName = members.pop(),
				curScope = object;

			value = value || sinon.spy();

			if ( members.length ) {
				for ( var i = 0; i < members.length; i++ ) {
					var inspectedProperty = members[ i ];

					if ( !curScope[ inspectedProperty ] ) {
						curScope[ inspectedProperty ] = {};
					}

					curScope = curScope[ inspectedProperty ];
				}
			}

			curScope[ propertyName ] = value;

			return curScope[ propertyName ];
		}
	} );
} )();
