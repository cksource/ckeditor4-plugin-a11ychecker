/* bender-tags: a11ychecker,unit,balloonpanel */
/* bender-ckeditor-plugins: balloonpanel */

( function() {
	'use strict';

	// Tests for all the method related to scrolling detection.
	var screenSize = CKEDITOR.document.getWindow().getViewPaneSize();

	bender.require( [ 'ui/BalloonPanel', 'mocking' ], function( BalloonPanel, mocking ) {
		var styles = {
				height: screenSize.height * 3 + 'px',
				width: screenSize.width * 3 + 'px'
			},
			BallonProto = BalloonPanel.prototype;

		CKEDITOR.document.getBody().setStyles( styles );

		bender.test( {
			setUp: function() {
				// Same viewport position forced for all tests, so there will be no random viewport position. And
				// TC order won't matter.
				CKEDITOR.document.getWindow().$.scrollTo( screenSize.width, screenSize.height );
			},

			tearDown: function() {
				// Scroll to 0, 0 - so we can actualy see test runner results :).
				CKEDITOR.document.getWindow().$.scrollTo( 0, 0 );
			},

			'test _isElementInViewport out of viewport y-axis': function() {
				var elem = CKEDITOR.document.getById( 'top' ),
					window = CKEDITOR.document.getWindow(),
					ret = BallonProto._isElementInViewport.call( {}, elem, window );

				assert.isFalse( ret, 'Return value' );
			},

			'test _isElementInViewport out of viewport x-axis': function() {
				var elem = CKEDITOR.document.getById( 'right' ),
					window = CKEDITOR.document.getWindow(),
					ret = BallonProto._isElementInViewport.call( {}, elem, window );

				assert.isFalse( ret, 'Return value' );
			},

			'test _isElementInViewport in viewport': function() {
				var elem = CKEDITOR.document.getById( 'inBottom' ),
					window = CKEDITOR.document.getWindow(),
					ret = BallonProto._isElementInViewport.call( {}, elem, window );

				assert.isTrue( ret, 'Return value' );
			},

			'test _isElementInViewport partially in viewport': function() {
				var elem = CKEDITOR.document.getById( 'edgeBottomRight' ),
					window = CKEDITOR.document.getWindow(),
					ret = BallonProto._isElementInViewport.call( {}, elem, window );

				assert.isTrue( ret, 'Return value' );
			},

			'test _isElementInViewport partially in viewport second': function() {
				var elem = CKEDITOR.document.getById( 'edgeTopLeft' ),
					window = CKEDITOR.document.getWindow(),
					ret = BallonProto._isElementInViewport.call( {}, elem, window );

				assert.isTrue( ret, 'Return value' );
			}
		} );

		function positionMisplacedElements() {
			var screenWidth = screenSize.width,
				screenHeight = screenSize.height,
				refElement = CKEDITOR.document.getById( 'reference' ),
				reposition = function( elemId, x, y ) {
					CKEDITOR.document.getById( elemId ).setStyles( {
						top: y + 'px',
						left: x + 'px'
					} );
				};

			reposition( 'top', screenWidth + 100, 0 );
			reposition( 'right', screenWidth * 3 - 100, screenHeight + 100 );
			reposition( 'outTopRight', screenWidth * 3 - 100, 0 );
			reposition( 'inBottom', screenWidth + 100, screenHeight * 2 - 100 );
			reposition( 'edgeBottomRight', 2 * screenWidth - 25, screenHeight * 2 - 25 );
			reposition( 'edgeTopLeft', screenWidth - 25, screenHeight - 25 );

			// Taking care of a reference element.
			refElement.setStyles( {
				height: screenSize.height + 'px',
				width: screenSize.width + 'px'
			} );

			reposition( 'reference', screenWidth, screenHeight );
		}

		positionMisplacedElements();
	} );
} )();