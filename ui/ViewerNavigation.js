/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [ 'ui/ViewerCounter' ], function( ViewerCounter ) {
	/**
	 * The navigation area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewerNavigation
	 * @mixins CKEDITOR.event
	 * @constructor Creates a viewer's navigation instance.
	 * @param {CKEDITOR.plugins.a11ychecker.viewer} viewer
	 * @param {Object} lang An language object for Accessibility Checker
	 */
	function ViewerNavigation( viewer, lang ) {
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
		 */
		this.parts = {};

		/**
		 * A counter object which helps to keep track of focused issue in whole
		 * issue list.
		 *
		 * @type {CKEDITOR.plugins.a11ychecker.ViewerCounter}
		 */
		this.counter = new ViewerCounter( lang.navigationCounter );

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
		 * @property {String} templateDefinitions.buttonWrapper
		 * @property {String} templateDefinitions.button
		 */
		templateDefinitions: {
			wrapper: '<div class="cke_a11yc_ui_navigation"></div>',

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
		update: function( cur, total ) {
			this.counter.update( cur, total );
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
					text: 'Previous'
				} ) ),

				next: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
					title: 'Next',
					'class': 'next',
					text: 'Next'
				} ) )
			};

			// Set up navigation bar with its children.
			var previousButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output() ),
				nextButtonWrapper = previousButtonWrapper.clone();

			// Setting the DOM structure.
			previousButtonWrapper.append( this.parts.previous );
			nextButtonWrapper.append( this.parts.next );

			this.parts.wrapper.append( this.counter.wrapper );
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