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
	 * @param {CKEDITOR.plugins.a11ychecker.viewer} viewer The viewer instance that the object
	 * will be attached to.
	 */
	function ViewerNavigation( viewer ) {
		/**
		 * Parent {@link CKEDITOR.plugins.a11ychecker.viewer}.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.viewer}
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

		// A template of the counter text uses editor lang files.
		this.templates.counterText = new CKEDITOR.template( this.viewer.editor.lang.a11ychecker.navigationCounter );

		/**
		 * @property parts UI elements of the navigation.
		 * @property {CKEDITOR.dom.element} parts.wrapper Wrapper of the navigation.
		 * @property {CKEDITOR.dom.element} parts.counter Issue counter.
		 * @property {CKEDITOR.dom.element} parts.previous "Previous" button.
		 * @property {CKEDITOR.dom.element} parts.next "Next" button.
		 */
		this.parts = {};

		// Build the navigation.
		this.build();

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
		 * @property {String} templateDefinitions.counter
		 * @property {String} templateDefinitions.buttonWrapper
		 * @property {String} templateDefinitions.button
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_navigation"></div>',

			counter: '<div class="cke_a11yc_ui_navigation_counter"></div>',

			buttonWrapper: '<div class="cke_a11yc_ui_button_wrapper"></div>',

			button:
				'<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button cke_a11yc_ui_{class}" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>'
		},

		/**
		 * Update the navigation component.
		 *
		 * @param {Number} cur 0-based current issue offset in issue list.
		 * @param {Number} cur 1-based issue list length.
		 */
		update: function( current, total ) {
			this.parts.counter.setText( this.templates.counterText.output( {
				current: current + 1,
				total: total
			} ) );
		},

		/**
		 * Builds the UI of the navigation.
		 */
		build: function() {
			var lang = this.viewer.editor.lang.a11ychecker;

			this.parts = {
				wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

				counter: CKEDITOR.dom.element.createFromHtml( this.templates.counter.output() ),

				previous: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: lang.navigationPrevTitle,
					'class': 'previous',
					text: lang.navigationPrev
				} ) ),

				next: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: lang.navigationNextTitle,
					'class': 'next',
					text: lang.navigationNext
				} ) )
			};

			// Set up navigation bar with its children.
			var previousButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output() ),
				nextButtonWrapper = previousButtonWrapper.clone();

			// Setting the DOM structure.
			previousButtonWrapper.append( this.parts.previous );
			nextButtonWrapper.append( this.parts.next );

			this.parts.wrapper.append( this.parts.counter );
			this.parts.wrapper.append( previousButtonWrapper );
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