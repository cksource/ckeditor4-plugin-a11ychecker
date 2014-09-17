/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	/**
	 * The navigation area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewerNavigation
	 * @mixins CKEDITOR.event
	 * @constructor Creates a viewer's navigation instance.
	 */
	function ViewerNavigation( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
		 */
		this.viewer = viewer;

		/**
		 * Templates of UI elements in this navigation.
		 * See {@link #templateDefinitions}, {@link #parts}.
		 */
		this.templates = {};

		for ( var t in this.templateDefinitions ) {
			this.templates[ t ] = new CKEDITOR.template( this.templateDefinitions[ t ] );
		}

		/**
		 * @property parts UI elements of the navigation.
		 * @property {CKEDITOR.dom.element} parts.wrapper Wrapper of the navigation.
		 * @property {CKEDITOR.dom.element} parts.previous "Previous" button.
		 * @property {CKEDITOR.dom.element} parts.next "Next" button.
		 * @property {CKEDITOR.dom.element} parts.list List of issues.
		 */
		this.parts = {};

		// Build the navigation.
		this.build();

		/**
		 * Event fired when the value of issues list is changed.
		 *
		 * @event change
		 */

		/**
		 * Event fired when the "previous issue" button is clicked.
		 *
		 * @event previous
		 */

		/**
		 * Event fired when the "next issue" button is clicked.
		 *
		 * @event next
		 */
	}

	ViewerNavigation.prototype = {
		/**
		 * @property templateDefinitions Templates of the navigation. Automatically converted into {@link CKEDITOR.template} in the constructor.
		 * @property {String} templateDefinitions.wrapper
		 * @property {String} templateDefinitions.buttonWrapper
		 * @property {String} templateDefinitions.button
		 * @property {String} templateDefinitions.list
		 * @property {String} templateDefinitions.listWrapper
		 * @property {String} templateDefinitions.listOption
		 * @property {String} templateDefinitions.listGroup
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_navigation"></div>',

			buttonWrapper: '<div class="cke_a11yc_ui_button_wrapper"></div>',

			button:
				'<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button cke_a11yc_ui_{class}" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>',

			list: '<select class="cke_a11yc_ui_input_select"></select>',

			listWrapper: '<div class="cke_a11yc_ui_select_wrapper"></div>',

			listOption: '<option value="{value}" {selected}>{text}</option>',

			listGroup: '<optgroup label="{label}"></optgroup>'
		},

		/**
		 * Updates the list of issues.
		 *
		 * @param {Object} entries
		 */
		updateList: function( entries ) {
			// Clean-up the list first.
			this.cleanList();

			// For each group of entries.
			for ( var groupName in entries ) {
				var group = CKEDITOR.dom.element.createFromHtml( this.templates.listGroup.output( {
					label: groupName
				} ) );

				// Append <optgroup>.
				this.parts.list.append( group );

				// For each entry in the group.
				for ( var entryIndex in entries[ groupName ] ) {
					var entry = entries[ groupName ][ entryIndex ];

					group.append( CKEDITOR.dom.element.createFromHtml( this.templates.listOption.output( {
						value: entry.value,
						text: entry.text,
						selected: entry.selected
					} ) ) );
				}
			}
		},

		/**
		 * Cleans up the list of issues.
		 *
		 * @method cleanList
		 */
		cleanList: function() {
			this.parts.list.setHtml( '' );
		},

		/**
		 * Returns the index of currently selected issue.
		 *
		 * @method getListValue
		 * @returns {String}
		 */
		getListValue: function() {
			return this.parts.list.getValue();
		},

		/**
		 * Builds the UI of the navigation.
		 */
		build: function() {
			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				previous: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: 'Previous',
					'class': 'previous',
					text: ''
				} ) ),

				next: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: 'Next',
					'class': 'next',
					text: 'Next'
				} ) ),

				list: CKEDITOR.dom.element.createFromHtml( this.templates.list.output() ),
			};

			// Set up navigation bar with its children.
			var previousButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output() ),
				nextButtonWrapper = previousButtonWrapper.clone(),
				listWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.listWrapper.output() );

			// Setting the DOM structure.
			previousButtonWrapper.append( this.parts.previous );
			listWrapper.append( this.parts.list );
			nextButtonWrapper.append( this.parts.next );

			this.parts.wrapper.append( previousButtonWrapper );
			this.parts.wrapper.append( listWrapper );
			this.parts.wrapper.append( nextButtonWrapper );

			this.parts.previous.unselectable();
			this.parts.next.unselectable();

			// Adding listeners.
			var spaceListener = keyListener( 32, function ( evt ) {
				this.fire( 'click' );
			} );

			this.parts.previous.on( 'keydown', spaceListener );

			this.parts.next.on( 'keydown', spaceListener );

			// Setup click listeners for previous and next.
			this.parts.previous.on( 'click', function() {
				this.fire( 'previous' );
			}, this );

			this.parts.next.on( 'click', function() {
				this.fire( 'next' );
			}, this );

			// Handle issue selection from list.
			this.parts.list.on( 'change', function( evt ) {
				this.fire( 'change', this.getListValue() );
			}, this );

			// Setup listeners for keyboard previous and next.
			this.viewer.panel.on( 'show', function() {
				var hotkeysConfig = this.viewer.editor.config.a11ychecker_hotkeys;

				if ( hotkeysConfig.prev ) {
					this.viewer.panel.addListener(
						CKEDITOR.document.getBody().on( 'keydown', keyListener( hotkeysConfig.prev, function() {
							this.fire( 'previous' );
						} ), this )
					);
				}

				if ( hotkeysConfig.next ) {
					this.viewer.panel.addListener(
						CKEDITOR.document.getBody().on( 'keydown', keyListener( hotkeysConfig.next, function() {
							this.fire( 'next' );
						} ), this )
					);
				}
			}, this );
		}
	};

	CKEDITOR.event.implementOn( ViewerNavigation.prototype );

	function keyListener( keystroke, callback ) {
		return function( evt ) {
			var pressed = evt.data.getKeystroke();

			if ( pressed == keystroke ) {
				callback.call( this );
				evt.data.preventDefault();
			}
		};
	}

	return ViewerNavigation;
} );