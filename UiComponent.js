/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * Base class for UiComponents.
 *
 * @class
 */
CKEDITOR.ui.UiComponent = CKEDITOR.tools.createClass( {
	/**
	 * Creates a UiComponent instance.
	 *
	 * @constructor
	 */
	$: function() {
		this.elementTagName = this.elementTagName || 'div';
		this.parent = null;

		this.element = new CKEDITOR.dom.element( this.elementTagName );

		this.initElement();
	},

	proto: {

		/**
		 * Element of the component.
		 */
		element: null,

		/**
		 * Method use to customize componentes main {@link CKEDITOR.ui.UiComponent.element}.
		 */
		initElement: function() {
		},

		show: function() {
			this.element.removeStyle( 'display' );
		},

		hide: function() {
			this.element.setStyle( 'display', 'none' );
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.ui.UiComponent
 */
CKEDITOR.ui.Button = CKEDITOR.tools.createClass( {
	base: CKEDITOR.ui.UiComponent,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
		//this.elementTagName = 'span';
		this.elementTagName = 'a';
		this.base();
	},

	proto: {
		setText: function( text ) {
			this.element.setText( text );
		},
		initElement: function() {
			this.element.setAttributes( {
				'class': 'cke_button cke_button_off',
				role: 'button',
				tabindex: -1
			} );
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.ui.UiComponent
 */
CKEDITOR.ui.Container = CKEDITOR.tools.createClass( {
	base: CKEDITOR.ui.UiComponent,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
		this.base();
		this.children = [];
	},

	proto: {

		addChild: function( newComponent ) {
			if ( newComponent.parent )
				newComponent.parent.removeChild( newComponent );

			newComponent.parent = this;
			this.children.push( newComponent );
			this.element.append( newComponent.element );
		},

		removeChild: function( componentToRemove ) {
			var childIndex = CKEDITOR.tools.indexOf( this.children, componentToRemove );
			if ( childIndex != -1 )
				this.children.splice( childIndex, 1 );

			// Remove children DOM element.
			componentToRemove.element.remove();
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.ui.Container
 */
CKEDITOR.ui.HBox = CKEDITOR.tools.createClass( {
	base: CKEDITOR.ui.Container,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
		this.base();
	}
} );

/**
 * @class
 * @extends CKEDITOR.ui.Container
 */
CKEDITOR.ui.ToolGroup = CKEDITOR.tools.createClass( {
	base: CKEDITOR.ui.Container,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
		this.elementTagName = 'span';
		this.base();
	},

	proto: {
		initElement: function() {
			this.element.setAttributes( {
				role: 'presentation',
				'class': 'cke_toolgroup'
			} );
		}
	}
} );

/**
 * @class
 * @extends CKEDITOR.ui.UiComponent
 */
CKEDITOR.ui.Select = CKEDITOR.tools.createClass( {
	base: CKEDITOR.ui.UiComponent,
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 */
	$: function() {
		this.elementTagName = 'select';
		this.base();
	},

	proto: {
		setOptions: function( options ) {
			// Remove all current children.
			this.element.setHtml('');
		},

		/**
		 * @param {Array} groups Array of { name: 'str', options: <optionsObject> }
		 */
		setOptionsGrouped: function( groups ) {
			var innerHtml = '',
				groupsCount = groups.length,
				encodeAttr = CKEDITOR.tools.htmlEncodeAttr,
				encodeHtml = CKEDITOR.tools.htmlEncode,
				i,
				curGroup;

			for ( i = 0; i < groupsCount; i++ ) {
				curGroup = groups[ i ];

				innerHtml += '<optgroup label="' + encodeAttr( curGroup.name ) + '">';

				if ( curGroup.options ) {
					for ( var j in curGroup.options )
						innerHtml += '<option value="' + encodeAttr( j ) + '">' + encodeHtml( curGroup.options[ j ] ) + '</option>';
				}

				innerHtml += '</optgroup>';
			}

			// Now replace current html.
			this.element.setHtml( innerHtml );
		}
	}
} );
