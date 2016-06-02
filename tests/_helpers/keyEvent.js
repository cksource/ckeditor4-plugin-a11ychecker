define( function() {
	'use strict';

	return {
		// Returns a key event mockup.
		// @param {Number} keystroke Keystroke with modifiers. eg. CKEDITOR.SHIFT + 9 // shift + tab
		getKeyEvent: function( keystroke ) {
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
	}
} );
