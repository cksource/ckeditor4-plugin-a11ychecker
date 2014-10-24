
define( function() {
	/**
	 * A class for handling the counter inside the UI balloon, indicating current
	 * issue offset in whole issue list.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.ViewerCounter
	 * @constructor Creates an input instance.
	 * @param {String} template A template string, see {@link #template} for available parameters.
	 */
	function ViewerCounter( template ) {
		/**
		 * Stores a tempalte used for counter inner HTML.
		 *
		 * It takes following parameters:
		 * * **current** - A number indicating current issue offset.
		 * * **total** - Total count of issues.
		 *
		 * @type {CKEDITOR.template}
		 */
		this.template = new CKEDITOR.template( template );

		/**
		 * A wrapping element for the counter.
		 *
		 * @type {CKEDITOR.dom.element}
		 */
		this.wrapper = CKEDITOR.dom.element.createFromHtml( '<div class="cke_a11yc_ui_counter"></div>' );
	}

	ViewerCounter.prototype = {
		/**
		 * Updates counter inner content.
		 *
		 * @param {Number} current 0-based current issue offset within a list.
		 * @param {Number} total 1-based issue count in the list.
		 */
		update: function( current, total ) {
			this.wrapper.setText( this.template.output( {
				current: current + 1,
				total: total
			} ) );
		},

		/**
		 * Removes the counter from the DOM.
		 *
		 * @method remove
		 */
		remove: function() {
			this.wrapper.remove();
		}
	};

	return ViewerCounter;
} );