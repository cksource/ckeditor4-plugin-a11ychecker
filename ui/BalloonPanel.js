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

	// Function tells if element is (at least partially) visible within the window viewport.
	BalloonPanel.prototype._isElementInViewport = function( element, window ) {
		var scrollPos = window.getScrollPosition(),
			elemRect = element.getClientRect(),
			viewportSize = window.getViewPaneSize(),
			// Storing rects as 2 points.
			elemOffset = {
				x1: element.$.offsetLeft,
				y1: element.$.offsetTop,
				x2: element.$.offsetLeft + elemRect.width,
				y2: element.$.offsetTop + elemRect.height
			},
			scrollOffset = {
				x1: scrollPos.x,
				y1: scrollPos.y,
				x2: scrollPos.x + viewportSize.width,
				y2: scrollPos.y + viewportSize.height
			},
			// I know I might initialize conds here, but it's actually app logic, and it wouldn't
			// differentiate well enough from the rest of the code.
			conds;

		// We test this case by a negation.
		// If one rect would be within another it wouldn't match to any of these conditions.
		conds = [
			elemOffset.x1 > scrollOffset.x2,
			elemOffset.x2 < scrollOffset.x1,
			elemOffset.y1 > scrollOffset.y2,
			elemOffset.y2 < scrollOffset.y1
		];

		// If none of the conditions is true, then it's not overlapping.
		return conds.indexOf( true ) === -1;
	};

	return BalloonPanel;
} );