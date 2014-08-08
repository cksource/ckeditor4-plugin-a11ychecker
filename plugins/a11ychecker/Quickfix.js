
/**
 * @class
 */
CKEDITOR.plugins.a11ychecker.Quickfix = CKEDITOR.tools.createClass( {
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
	},

	proto: {

		auto: true,

		// Array of handled issue types.
		handledTypes: [],

		title: 'Generic Quickfix title',

		desc: 'This Quickfix will not do anything amazing, its only a base type',

		// Src used for icon image.
		imgSrc: 'http://ckeditor.dev/plugins/docprops/icons/hidpi/docprops.png',

		// Returns icon html as a string.
		getIconHtml: function() {
			var imgTitle = 'Apply fix: ' + this.title;

			return '<span class="quickfix_icon"><img src="' + this.imgSrc + '" alt="' + imgTitle + '" title="' + imgTitle + '" /></span>';
		},

		/**
		 * @param {CKEDITOR.dom.element} element Element causing the a11y issue.
		 * @param {String} issueType
		 * @param {Function} callback Gets called when the fix is done.
		 */
		fix: function( element, issueType, callback ) {
			this._fix( element, issueType, callback );
		},

		_fix: function( element, issueType, callback ) {
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.plugins.a11ychecker.Quickfix
 */
CKEDITOR.plugins.a11ychecker.Manualfix = CKEDITOR.tools.createClass( {
	base: CKEDITOR.plugins.a11ychecker.Quickfix,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
	},

	proto: {
		auto: false,

		// Displays all input fields.
		// @todo: most likely this function will be parametrized with a container,
		//	for created inputs.
		draw: function() {
		},

		fix: function( element, issueType, callback ) {
			this.draw();
		},

		// this is real fixing method
		_fix: function( element, issueType, callback ) {
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.plugins.a11ychecker.Manualfix
 */
CKEDITOR.plugins.a11ychecker.ImgAltfix = CKEDITOR.tools.createClass( {
	base: CKEDITOR.plugins.a11ychecker.Manualfix,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
	},

	proto: {

		handledTypes: [ 'imgHasAlt' ],

		title: 'Fix alt attribute',

		draw: function() {
			// This is bad!
			this.fixedAlt = prompt( 'Type any alt for element' );
		},

		fix: function( element, issueType, callback ) {
			this.draw();
			this._fix( element, issueType, callback );
		},

		_fix: function( element, issueType, callback ) {
			element.setAttribute( 'alt', this.fixedAlt );
			callback && callback();
		}
	}
} );


/**
 * @class
 * @extends CKEDITOR.plugins.a11ychecker.Quickfix
 * Automatic fix, merges all sibling anchors with the same href.
 */
CKEDITOR.plugins.a11ychecker.AnchorSiblingMerge = CKEDITOR.tools.createClass( {
	base: CKEDITOR.plugins.a11ychecker.Quickfix,

	proto: {
		handledTypes: [ 'aAdjacentWithSameResourceShouldBeCombined' ],

		imgSrc: 'http://ckeditor.dev/plugins/link/icons/hidpi/link.png',

		title: 'Merge links',

		desc: 'Merges sibling links pointing to the same resource',

		_fix: function( element, issueType, callback ) {

			var nextSibling = element.getNext(),
				initialHref = element.getAttribute( 'href' ),
				extraInnerHtml = '';

			while ( nextSibling && nextSibling.getName && nextSibling.getName() == 'a' && nextSibling.getAttribute( 'href' ) == initialHref ) {
				// console.log( 'found similar' );
				// This html will be added later on to first anchor.
				extraInnerHtml += nextSibling.getHtml();

				// Prepare nextSibling for next iteration.
				nextSibling = nextSibling.getNext();

				// And we can remove element safely.
				nextSibling.getPrevious().remove();
			}

			// Adding extra html to first anchor.
			if ( extraInnerHtml )
				element.setHtml( element.getHtml() + extraInnerHtml );

			//element.setAttribute( 'alt', this.fixedAlt );
			callback && callback();
		}
	}
} );


/**
 * @class
 * @extends CKEDITOR.plugins.a11ychecker.Quickfix
 * Awesome automatic fix which will solve all the issues! : D if you have problem with
 * an element then... remove it! Attaboy!
 */
CKEDITOR.plugins.a11ychecker.ElementRemovefix = CKEDITOR.tools.createClass( {
	base: CKEDITOR.plugins.a11ychecker.Quickfix,

	proto: {
		handledTypes: [ 'imgHasAlt' ],

		title: 'Element remove fix',

		imgSrc: 'http://ckeditor.dev/plugins/removeformat/icons/hidpi/removeformat.png',

		_fix: function( element, issueType, callback ) {
			element.remove();
			callback && callback();
		}
	}
} );

(function() {
	CKEDITOR.plugins.a11ychecker.fixMapping = {};

	// Building quickfix mapping.,
	var predefClasses = [ 'ImgAltfix', 'AnchorSiblingMerge', 'ElementRemovefix' ],
		classesCount = predefClasses.length,
		fixMapping = CKEDITOR.plugins.a11ychecker.fixMapping,
		quickfix;


	for (var i=0; i < classesCount; i++) {
		quickfix = new CKEDITOR.plugins.a11ychecker[ predefClasses[ i ] ]();

		if ( quickfix.handledTypes && quickfix.handledTypes.length > 0 ) {
			for ( var j = quickfix.handledTypes.length-1; j >= 0; j-- ) {
				if ( !fixMapping[ quickfix.handledTypes[ j ] ] )
					fixMapping[ quickfix.handledTypes[ j ] ] = [];

				fixMapping[ quickfix.handledTypes[ j ] ].push( quickfix );
			}
		}
	}

	// console.log( 'fix mapping', fixMapping );
}());