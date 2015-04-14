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
	// This method is basically a wrapper to _isElementInViewport_internal, but it returns a simple
	// Boolean value, hiding the details.
	BalloonPanel.prototype._isElementInViewport = function( element, window ) {
		return this._isElementInViewport_internal( element, window );
	};

	// Function tells if element is (at least partially) visible within the window viewport.
	// If an elemnt is misplaced (outside of a viewport), it returns an array, giving an indication
	// of element position relative to the `window` viewport.
	// E.g.
	//
	// #-------------------------------------#
	// |            viewport                 |
	// #-------------------------------------#
	//                 #------------------#
	//                 |     element      |
	//                 #------------------#
	//
	// Will return `[ BalloonPanel.MISPLACED_BOTTOM ]`.
	//
	// ## Multiple Return
	//
	// It is possible to return two values, e.g. `[ BalloonPanel.MISPLACED_RIGHT,
	// BalloonPanel.MISPLACED_BOTTOM ]` meaning that the `element` is somewhere under right
	// bottom corner of the viewport, but not directly under nor at the left side of the viewport.
	//
	// #-------------------------------------#
	// |            viewport                 |
	// #-------------------------------------#
	//                                          #------------------#
	//                                          |     element      |
	//                                          #------------------#
	BalloonPanel.prototype._isElementInViewport_internal = function( element, window ) {
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
			conds = [];

		testMisplacementCondition( elemOffset.x2 < scrollOffset.x1, conds, BalloonPanel.MISPLACED_LEFT );
		testMisplacementCondition( elemOffset.x1 > scrollOffset.x2, conds, BalloonPanel.MISPLACED_RIGHT );
		testMisplacementCondition( elemOffset.y2 < scrollOffset.y1, conds, BalloonPanel.MISPLACED_TOP );
		testMisplacementCondition( elemOffset.y1 > scrollOffset.y2, conds, BalloonPanel.MISPLACED_BOTTOM );

		return conds;
	};

	BalloonPanel.MISPLACED_TOP = 1;
	BalloonPanel.MISPLACED_RIGHT = 2;
	BalloonPanel.MISPLACED_BOTTOM = 4;
	BalloonPanel.MISPLACED_LEFT = 8;

	// Checks if `condition` evaluates to `true`. If so **it will push** `errorFlag` to the
	// `conditionsStack` array.
	//
	// @param	{Boolean}	condition
	// @param	{Array}	conditionsStack
	// @param	{Number}	errorFlag
	function testMisplacementCondition( condition, conditionsStack, errorFlag ) {
		if ( condition ) {
			conditionsStack.push( errorFlag );
		}
	}

	return BalloonPanel;
} );