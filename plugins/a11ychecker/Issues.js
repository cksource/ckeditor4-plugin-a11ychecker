
/**
 * Stores issues list and provides iterator for it.
 *
 * @class
 */
CKEDITOR.plugins.a11ychecker.Issues = CKEDITOR.tools.createClass( {
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function( editor ) {
		this.editor = editor;
	},

	proto: {
		editor: null,

		issues: [],

		issuesCount: 0,

		_currentIndex: -1,

		/**
		 * Sets issues list, based on result returned by Quail.
		 *
		 * @param {Object} results Object provided by Quail callback as results variable
		 */
		setQuailIssues: function( results ) {
			var totalIssuesCount = 0,
				curResult;

			this.clear();

			for ( var i in results ) {
				curResult = results[ i ];

				//console.log( i, curResult);

				if ( curResult.elements.length ) {
					if ( !this.issues[ i ] ) {
						// Issue appeared for a very first time.
						this.issues[ i ] =  [];
					}

					// Transfering each element to our internal representation,
					// casting jQuery to CKEDITOR.dom.element.
					for ( var j=0; j < curResult.elements.length; j++ ) {
						// Custom elements lookup if editor is avbailable. The non-editor method
						// is used only in test mockups.
						if ( this.editor ) {
							this.issues[ i ].push( this.editor.editable().findOne( '*[data-quail-id="'+ curResult.elements[ j ][ 0 ].dataset.quailId +'"]' ) );
						} else {
							this.issues[ i ].push( new CKEDITOR.dom.element( curResult.elements[ j ][ 0 ] ) );
						}

					}

					totalIssuesCount += curResult.elements.length;
				}
			}

			this.issuesCount = totalIssuesCount;
		},

		/**
		 * Clears issues list.
		 */
		clear: function() {
			this.issues = {};
			this.issuesCount = 0;
			this.resetFocus();
		},

		/**
		 * Iterates over each issue element.
		 * @param {Function} callback Callback function which is meant to iterate.
		 *	It gains following args:
		 * - element - CKEDITOR.dom.element - iterated element
		 * - type - String - type of issue (aka test) as a string identifier
		 */
		each: function( callback ) {
			var curIssueGroup;

			for ( var i in this.issues ) {
				curIssueGroup = this.issues[ i ];
				for (var j=0; j < curIssueGroup.length; j++) {
					callback( curIssueGroup[ j ], i );
				}
			}
		},

		next: function() {
			if ( !this.issuesCount )
				return;

			// If we have no more item to iterate with.
			if ( this._currentIndex + 1 > this.issuesCount -1 ) {
				// We're moving to first item if we're at the end of the list,
				// and list contains some issues.
				if ( this._currentIndex != 0 )
					this.moveTo( 0 );
			} else {
				// And the default behaviour.
				this.moveTo( this._currentIndex + 1 );
			}

			return this.getFocused();
		},

		prev: function() {

			var maxIndex = this.issuesCount - 1;

			if ( !this.issuesCount )
				return;

			// If we have first focused, or no item focused at all.
			if ( this._currentIndex == 0 || this._currentIndex == -1 ) {
				// Ensure that currently focused item is not the last one.
				if ( this._currentIndex != maxIndex )
					this.moveTo( maxIndex );
			} else {
				// For each other situation.
				this.moveTo( this._currentIndex - 1 );
			}


			return this.getFocused();
		},

		/**
		 * Moves focus to given index.
		 * @param {Number} index - 0 based index
		 */
		moveTo: function( index ) {

			var prevFocused = this.getFocused();

			if ( prevFocused && this.editor )
				this.editor._.a11ychecker.ui.unmarkFocus( prevFocused );

			this._currentIndex = index;

			if ( this.editor )
				this.editor._.a11ychecker.ui.markFocus( this.getFocused() );
		},

		resetFocus: function() {
			this._currentIndex = -1;
		},

		/**
		 * Returns focused issue.
		 * @returns {CKEDITOR.dom.element}
		 */
		getFocused: function() {
			if ( this._currentIndex != -1 )
				return this.getIssueByIndex( this._currentIndex );
			else
				return;
		},

		/**
		 * Returns issue at given index.
		 * @returns {CKEDITOR.dom.element}
		 */
		getIssueByIndex: function( index ) {
			var iteratedItemsCount = 0,
				issues = this.issues,
				i;

			for ( i in issues ) {
				if ( iteratedItemsCount + issues[ i ].length > index ) {
					return issues[ i ][ index - iteratedItemsCount ];
				}

				iteratedItemsCount += issues[ i ].length;
			}
		},

		/**
		 * Returns the issue type for given element.
		 * @param {CKEDITOR.dom.element} element
		 * @returns {String}
		 */
		getIssueTypeByElement: function( element ) {
			var ret = '';

			this.each( function( curElement, type ) {
				if ( curElement.$.isSameNode( element.$ ) )
					ret = type;
			} );

			return ret;
		},

		getIssueIndexByElement: function( element ) {
			var ret = null,
				curIter = -1;

			this.each( function( curElement, type ) {
				curIter++;
				if ( curElement.$.isSameNode( element.$ ) )
					ret = curIter;
			} );

			return ret;
		}

	}
} );
