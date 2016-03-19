/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
define( function() {
	'use strict';

	/**
	 * A class taking care of registering hotkeys to the editor and balloon.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.HotkeyManager
	 * @constructor
	 * @param {CKEDITOR.plugins.a11ychecker.Controller} controller
	 */
	function HotkeyManager( controller ) {
		this.controller = controller;

		if ( controller ) {
			var mapping = HotkeyManager.parseConfig( controller.editor.config.a11ychecker_keystrokes );

			// Editor hotkeys.
			this.setEditorHotkeys( controller.editor, mapping );

			// And balloon hotkeys.
			this.setBalloonHotkeys( controller.viewerController, mapping );
		}
	}

	HotkeyManager.prototype = {};
	HotkeyManager.prototype.constructor = HotkeyManager;

	/**
	 * Registers hotkeys (keystrokes) in CKEditor.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.HotkeyManager
	 * @param {CKEDITOR.editor} editor
	 * @param {Object} hotkeyMapping Hotkey to command mapping returned by {@link #parseConfig}.
	 */
	HotkeyManager.prototype.setEditorHotkeys = function( editor, hotkeyMapping ) {
		for ( var i in hotkeyMapping ) {
			editor.setKeystroke( Number( i ), hotkeyMapping[ i ] );
		}
	};

	/**
	 * Adds all the hotkey listeners to the balloon panel.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.HotkeyManager
	 * @param {CKEDITOR.plugins.a11ychecker.ui.ViewerController} viewerController
	 * @param {Object} hotkeyMapping Hotkey to command mapping returned by {@link #parseConfig}.
	 */
	HotkeyManager.prototype.setBalloonHotkeys = function( viewerController, hotkeyMapping ) {
		var that = this,
			editor = that.controller.editor,
			panel = viewerController.viewer.panel,
			panelElement = panel.parts.panel;

		// Listener will be applied each time panel is shown.
		panel.addShowListener( function() {
			return panelElement.on( 'keydown', that.getBalloonKeydown( editor, hotkeyMapping ) );
		} );
	};

	/**
	 * This method is extracted, otherwise implementation would become messy and
	 * tricky to test.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.HotkeyManager
	 * @param {CKEDITOR.editor} editor
	 * @param {Object} hotkeyMapping
	 * @returns {Function} Returns a keypress listener.
	 */
	HotkeyManager.prototype.getBalloonKeydown = function( editor, hotkeyMapping ) {
		return function( evt ) {
			var command = hotkeyMapping[ evt.data.getKeystroke() ];

			if ( command ) {
				// If a command was matched.
				editor.execCommand( command );
				evt.data.preventDefault();
			}
		};
	};

	/**
	 * Parses the object given in `config.a11ychecker_keystrokes` object and transforms it to more
	 * programmer-friendly object where keystrokes are obj keys, and the command name is value, eg.
	 *
	 *		{
	 *			5570629: 'a11ychecker', // CTRL + ALT + E
	 *			1114181: 'a11ychecker.next' // CTRL + E
	 *		}
	 *
	 * By design we assume that one keystroke is limited to trigger only one command.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.HotkeyManager
	 * @param {Object/undefined} configEntry A value of {@link CKEDITOR.config.a11ychecker_keystrokes}
	 * @returns {Object}
	 */
	HotkeyManager.parseConfig = function( configEntry ) {
		var ret = {},
			// If configEntry is undefined, use empty object.
			hotkeysConfig = configEntry || {},
			// Default hotkeys.
			defaultMapping = {
				'open': CKEDITOR.CTRL + CKEDITOR.ALT + 69 /*E*/,
				'next': CKEDITOR.CTRL + 69 /*E*/,
				'prev': CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 /*E*/,
				'listen': CKEDITOR.SHIFT + 27 /*Esc*/,
				'close': 27 /*Esc*/
			},
			commandSuffix,
			i;

		for ( i in defaultMapping ) {
			// We assign default value only in case of undefined.
			if ( hotkeysConfig[ i ] === undefined ) {
				hotkeysConfig[ i ] = defaultMapping[ i ];
			}

			// The part which will be added to "a11checker" prefix.
			// In case of "open" we don't want to add any suffixes.
			commandSuffix = ( i == 'open' ? '' : '.' + i );

			ret[ hotkeysConfig[ i ] ] = 'a11ychecker' + commandSuffix;
		}

		return ret;
	};

	return HotkeyManager;
} );
