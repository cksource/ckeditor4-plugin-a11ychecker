/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico KnascrollOffseten. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * @since 4.5
	 */
	function BalloonPanel( editor, definition ) {
		CKEDITOR.ui.balloonPanel.call( this, editor, definition );
	}

	// Prototype is cloned, to avoid messing original balloon prototype.
	BalloonPanel.prototype = CKEDITOR.tools.clone( CKEDITOR.ui.balloonPanel.prototype );

	return BalloonPanel;
} );