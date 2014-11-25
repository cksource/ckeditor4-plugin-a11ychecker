
( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'QuickFix',
		callback: function( QuickFix ) {
			/**
			 * QuickFix merging two or more sibling anchors with the same href.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix
			 * @class AnchorsMerge
			 * @constructor
			 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue QuickFix is created for.
			 */
			function AnchorsMerge( issue ) {
				QuickFix.call( this, issue );
			}

			AnchorsMerge.prototype = new QuickFix();

			AnchorsMerge.prototype.constructor = AnchorsMerge;

			/**
			 * @param {Object} formAttributes Object containing serialized form inputs. See
			 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
			 * @param {Function} callback Function to be called when a fix was applied. Gets QuickFix object
			 * as a first parameter.
			 */
			AnchorsMerge.prototype.fix = function( formAttributes, callback ) {
				var issueElement = this.issue.element,
					nextSibling = issueElement.getNext(),
					initialHref = issueElement.getAttribute( 'href' ),
					extraInnerHtml = '',
					isAnchor = function( node ) {
						return node && node.getName && node.getName() == 'a';
					};

				while ( isAnchor( nextSibling ) && nextSibling.getAttribute( 'href' ) == initialHref ) {
					// This html will be added later on to the first anchor.
					extraInnerHtml += nextSibling.getHtml();

					// Prepare nextSibling var for next iteration.
					nextSibling = nextSibling.getNext();

					// And we can remove element safely.
					nextSibling.getPrevious().remove();
				}

				// Adding extra html to first anchor.
				if ( extraInnerHtml ) {
					issueElement.setHtml( issueElement.getHtml() + extraInnerHtml );
				}

				if ( callback ) {
					callback( this );
				}
			};

			CKEDITOR.plugins.a11ychecker.quickFixes.add( 'AnchorsMerge', AnchorsMerge );
		}
	} );
}() );