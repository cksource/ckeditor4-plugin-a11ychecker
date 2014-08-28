
/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The "a11ychecker" plugin.
 *
 */

( function() {
	'use strict';

	var pluginName = 'a11ychecker',
		// Path to QUAIL directory, relative to plugin.js tailed with "/".
		quailDirectory = 'bower_components/quail/',
		// Should A11ychecker toolbar be hidden on run.
		cfgStartHidden = true;

	CKEDITOR.plugins.add( pluginName, {
		requires: 'dialog,balloonpanel',
		lang: 'en', // %REMOVE_LINE_CORE%
		icons: pluginName, // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			this.loadJs();
			this.loadCss();
		},

		init: function( editor ) {
			// Create protected namespace.
			editor._.a11ychecker = {
				basePath: CKEDITOR.getUrl( this.path + quailDirectory ),
				disableFilterStrip: true,
				issues: new CKEDITOR.plugins.a11ychecker.Issues( editor )
			};

			// Some extra functions which will make api usage from command line,
			// a little bit easier.
			editor._.a11ychecker.exec = ( function( editor ) {
				return function() {
					return CKEDITOR.plugins.a11ychecker.exec( editor );
				};
			} )( editor );

			editor._.a11ychecker.viewer = new Viewer( editor, {
				title: 'Accessibility checker'
			} );

			this.guiRegister( editor );
			this.commandRegister( editor );
			// We may combine two functions below.
			this.addDataTransformationListeners( editor );
			this.addEditorListeners( editor );
			this.addHotkeys( editor );
		},

		// Transformation listener will make sure that data-quail-id attributes
		// are stripped for output.
		addDataTransformationListeners: function( editor ) {
			editor.dataProcessor.htmlFilter.addRules( {
				elements: {
					$: function( element ) {

						if ( !editor._.a11ychecker.disableFilterStrip )
							delete element.attributes[ 'data-quail-id' ];
						//'data-quail-id'
						//element.attributes['foo'] = 'bar';
						return element;
					}
				}
			} );
		},

		addEditorListeners: function( editor ) {

			editor.on( 'contentDom', function() {
				// Detects a single clicks to propse some quickfixes, and bring
				// the focus.
				editor.document.on( 'click', function( evt ) {
					var target = evt.data.getTarget();
					if ( target.hasClass( 'cke_a11ychecker_error' ) ) {
						//console.log( 'show quickfixes for ', target );

						var offset = editor._.a11ychecker.issues.getIssueIndexByElement( target );

						editor._.a11ychecker.viewer.showIssue( target );

						if ( offset !== null ) {
							//console.log( 'identified offset: ' + offset );
							editor._.a11ychecker.issues.moveTo( offset );
						}
					}
				} );
			} );

			editor.on( 'instanceReady', function( evt ) {
				// Listens for doubleclick to show a tooltip describing the issue.
				editor.editable().on( 'dblclick', function( evt ) {
					// @todo: srcElement might be not safe for FF AFAIR.
					var elem = new CKEDITOR.dom.element( evt.data.$.srcElement );

					// WE REQUIRE ALT KEY TO BE PRESSET!
					if ( !evt.data.$.altKey )
						return;

					if ( elem ) {
						var closestErrorParent = null;

						elem.getParents( true ).map( function( parent ) {
							if ( !closestErrorParent && parent.hasClass( 'cke_a11ychecker_error' ) ) {
								closestErrorParent = parent;
							}
						} );

						if ( closestErrorParent ) {
							//console.log( 'parent found', closestErrorParent );
							evt.stop();
							evt.cancel();
							CKEDITOR.plugins.a11ychecker.displayTooltip( editor, closestErrorParent );
						}
					}
				}, null, null, 5 );
			} );
		},

		/**
		 * Adds hotkey mappings.
		 */
		addHotkeys: function( editor ) {
			editor.setKeystroke( CKEDITOR.CTRL + CKEDITOR.ALT + 69 /*E*/, pluginName );
			editor.setKeystroke( CKEDITOR.CTRL + 69 /*E*/, pluginName + '.next' );
			editor.setKeystroke( CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 /*E*/, pluginName + '.prev' );

			editor.setKeystroke( CKEDITOR.CTRL + CKEDITOR.ALT + 32 /*SPACE*/, pluginName + '.fixIssue' );
			/**
			 * @todo: Remove this hotkey, it's for testing ease only.
			 */
			editor.setKeystroke( CKEDITOR.ALT + 13 /*ENTER*/, 'maximize' );
		},

		// Register buttons, dialogs etc.
		guiRegister: function( editor ) {
			var lang = editor.lang.a11ychecker;

			editor._.a11ychecker.ui = new CKEDITOR.plugins.a11ychecker.ui( editor );

			editor.ui.addButton && editor.ui.addButton( 'A11ychecker', {
				label: lang.toolbar,
				command: pluginName,
				toolbar: 'document,10'
			} );

			CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/a11ychecker.js' );
			// For some reason CKE has big issues loading issuetooltip
			//CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/issuetooltip.js' );

			// thus we need to hardcode dialog for time being
			CKEDITOR.dialog.add( 'issuetooltip', function( editor ) {
				var lang = editor.lang.a11ychecker;

				return {
					title: lang.title,
					minWidth: 300,
					minHeight: 80,
					contents: [
						{
							id: 'info',
							label: 'info',
							title: 'info',
							elements: [
								// Dialog window UI elements.
								{
									id: 'title',
									type: 'html',
									html: '<div style="width: 450px;white-space: pre; word-break: break-word;"><div class="typeTitle">foo</div><div class="typeDesc">bar</div><div class="typeQuickfixes">baz</div></div>'
								}
							]
						}
					]
				};
			} );

			// Insert contents CSS.
			editor.addContentsCss( this.path + 'styles/contents.css' );

			this._createToolbox( editor );
		},

		_createToolbox: function( editor ) {
			editor.on( 'uiReady', function( evt ) {
				var ui = editor._.a11ychecker.ui;

				if ( cfgStartHidden ) {
					ui.hide();
				}

				editor.ui.space( 'top' ).append( ui.bar.element );
			} );
		},

		/**
		 * Registers commands like:
		 * a11ychecker
		 * a11ychecker.next
		 * a11ychecker.prev
		 *
		 * etc
		 */
		commandRegister: function( editor ) {
			editor.addCommand( pluginName, {
				exec: function( editor ) {
					editor._.a11ychecker.exec();
				}
			} );

			editor.addCommand( pluginName + '.next', {
				exec: function( editor ) {
					CKEDITOR.plugins.a11ychecker.next( editor );
				}
			} );

			editor.addCommand( pluginName + '.prev', {
				exec: function( editor ) {
					CKEDITOR.plugins.a11ychecker.prev( editor );
				}
			} );

			editor.addCommand( pluginName + '.fixIssue', {
				exec: function( editor ) {
					CKEDITOR.plugins.a11ychecker.fixIssue( editor );
				}
			} );
		},

		// Loads external JavaScript libs.
		loadJs: function() {
			var quailPath = CKEDITOR.getUrl( this.path + quailDirectory ),
				jQueryPath = quailPath + 'lib/jquery/jquery.js',
				quailPath = quailPath + 'dist/quail.jquery.js';

			CKEDITOR.scriptLoader.load(  jQueryPath, function() {
				//console.log( 'jqueryu loaded' );
				// Quail requires jQuery first.
				CKEDITOR.scriptLoader.load( quailPath, function() {
					//console.log( 'quail loaded' );
					// Marks that external scripts has been loaded.
					// quailLoaded = true;
				} );
			} );

			// Sync dependencies
			var syncDependencies = [ 'UiComponent.js', 'Ui.js', 'Issues.js', 'Controller.js', 'Quickfix.js' ],
				dependenciesCallbacks = {
					'Issues.js': function() {
						//console.log( 'issues loaded' );
					}
				},
				customCallback;

			for (var i=0; i < syncDependencies.length; i++) {
				CKEDITOR.scriptLoader.load( this.path + syncDependencies[ i ], dependenciesCallbacks[ syncDependencies[ i ] ] );
			}
		},

		// Loads global CSS, mainly needed for skin.
		loadCss: function() {
			var doc = CKEDITOR.document,
				node = doc.createElement( 'link', {
					attributes: {
						rel: 'stylesheet',
						href: this.path + 'styles/skin.css'
					}
				} );

			doc.getHead().append( node );

			CKEDITOR.document.appendStyleSheet( this.path + 'skins/moono/a11ychecker.css' );
		}
	} );

	function keyListener( keystroke, callback ) {
		return function( evt ) {
			var pressed = evt.data.getKeystroke();

			if ( pressed == keystroke ) {
				callback.call( this );
				evt.data.preventDefault();
			}
		}
	}

	CKEDITOR.plugins.a11ychecker = {};

	/**
	 * A class which represents the end-user interface of a11ychecker. Viewer is a panel
	 * which allows to browse and fix issues in the contents.
	 *
	 * *Note*: The panel is built upon the {@link CKEDITOR.ui.panel}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer
	 * @constructor Creates a viewer instance.
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} definition An object containing panel definition.
	 */
	function Viewer( editor, definition ) {
		this.env = {
			editor: editor
		};

		this.currentElement = null;
		this.a11ychecker = editor._.a11ychecker;
		this.panel = new CKEDITOR.ui.balloonPanel( editor, definition );

		this.panel.on( 'show', function() {
			// CTRL+SHIFT+[
			this.addListener( this.ui.panel.on( 'keydown', keyListener( CKEDITOR.CTRL + CKEDITOR.SHIFT + 219, function() {
				CKEDITOR.plugins.a11ychecker.prev( editor );
			} ) ) );

			// CTRL+SHIFT+]
			this.addListener( this.ui.panel.on( 'keydown', keyListener( CKEDITOR.CTRL + CKEDITOR.SHIFT + 221, function() {
				CKEDITOR.plugins.a11ychecker.next( editor );
			} ) ) );

			// Hide on iframe window's scroll.
			if ( !this.editor.editable().isInline() ) {
				this.addListener( this.editor.window.on( 'scroll', function() {
					this.blur();
					this.hide();
				}, this ) );
			}

			// Hide the panel on editor resize.
			this.addListener( editor.on( 'resize', function() {
				this.blur();
				this.hide();
			}, this ) );
		} );

		this.panel.on( 'attach', function() {
			this.updateList();
			this.updateDescription();
			this.updateForm();
		}, this );

		this.setup.navigation.call( this );
		this.setup.description.call( this );
		this.setup.form.call( this );
	};

	Viewer.prototype = {
		setup: {
			/**
			 * Setups the navigation bar.
			 *
			 * @method navigation
			 * @member CKEDITOR.plugins.a11ychecker.viewer.setup
			 */
			navigation: function() {
				this.navigation = new ViewerNavigation();

				// Register focusables.
				this.panel.registerFocusable( this.navigation.ui.previous );
				this.panel.registerFocusable( this.navigation.ui.list );
				this.panel.registerFocusable( this.navigation.ui.next );

				// Handle change in the list of issues.
				this.navigation.on( 'change', function( evt ) {
					this.showIssue( evt.data );
				}, this );

				// Handle "previous" button click.
				this.navigation.on( 'previous', function( evt ) {
					CKEDITOR.plugins.a11ychecker.prev( this.env.editor );
				}, this );

				// Handle "next" button click.
				this.navigation.on( 'next', function( evt ) {
					CKEDITOR.plugins.a11ychecker.next( this.env.editor );
				}, this );

				this.panel.ui.content.append( this.navigation.ui.wrapper );
			},

			/**
			 * Setups the description area.
			 *
			 * @method description
			 * @member CKEDITOR.plugins.a11ychecker.viewer.setup
			 */
			description: function() {
				this.description = new ViewerDescription();

				this.panel.ui.content.append( this.description.ui.wrapper );
			},

			/**
			 * Setups the "quick fix" form.
			 *
			 * @method form
			 * @member CKEDITOR.plugins.a11ychecker.viewer.setup
			 */
			form: function() {
				this.form = new ViewerForm();

				this.form.on( 'addInput', function( evt ) {
					this.panel.registerFocusable( evt.data.input );
				}, this );

				this.form.on( 'removeInput', function( evt ) {
					this.panel.deregisterFocusable( evt.data.input );
				}, this );

				this.panel.registerFocusable( this.form.ui.button );
				this.panel.ui.content.append( this.form.ui.wrapper );
			}
		},

		/**
		 * Shows the panel next to the issue in the contents.
		 *
		 * @method
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		showIssue: function( indexOrElement ) {
			if ( !( indexOrElement instanceof CKEDITOR.dom.element ) )
				indexOrElement = this.a11ychecker.issues.getIssueByIndex( indexOrElement );

			this.currentElement = indexOrElement;
			indexOrElement.scrollIntoView();

			// Wait for the scroll to stabilize.
			CKEDITOR.tools.setTimeout( function() {
				this.panel.attach( indexOrElement );
			}, 50, this );
		},

		/**
		 * Updates the list of issues.
		 *
		 * @method
		 */
		updateList: function() {
			this.navigation.updateList( this.a11ychecker.issues, this.currentElement );
		},

		/**
		 * Updates description according to the type of the current issue.
		 *
		 * @method
		 */
		updateDescription: function() {
			var issues = this.a11ychecker.issues,
				type = issues.getIssueTypeByElement( this.currentElement ),
				descHtml = CKEDITOR.plugins.a11ychecker.types[ type ].desc;

			this.description.setTitle( CKEDITOR.plugins.a11ychecker.types[ type ].title );
			this.description.setInfo( descHtml + ' <a href="#" tabindex="-1">Read more...</a>' );
		},

		/**
		 * Updates "quick fix" section with proper fields according to
		 * the type of the current issue.
		 *
		 * @method
		 */
		updateForm: function() {
			this.form.setInputs( {
				foo: {
					type: 'text',
					label: 'Alternative text'
				},
				bar: {
					type: 'checkbox',
					label: 'Something easy'
				},
				boom: {
					type: 'select',
					label: 'Selectable',
					options: {
						11: 'Option #1',
						22: 'Option #2'
					}
				}
			} );
		}
	}

	/**
	 * The navigation area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer.navigation
	 * @mixins CKEDITOR.event
	 * @constructor Creates a viewer's navigation instance.
	 */
	function ViewerNavigation() {
		this.ui = {
			/**
			 * The navigation bar.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.ui
			 * @property {CKEDITOR.dom.element} wrapper
			 */
			wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

			/**
			 * The "previous" button.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.ui
			 * @property {CKEDITOR.dom.element} previous
			 */
			previous: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
				title: 'Previous',
				'class': 'previous',
				text: ''
			} ) ),

			/**
			 * The "next" button.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.ui
			 * @property {CKEDITOR.dom.element} next
			 */
			next: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
				title: 'Next',
				'class': 'next',
				text: 'Next'
			} ) ),

			/**
			 * The list of issues.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.ui
			 * @property {CKEDITOR.dom.element} list
			 */
			list: CKEDITOR.dom.element.createFromHtml( this.templates.list.output() ),
		}

		// Setup click listeners for previous and next.
		this.ui.previous.on( 'click', function() {
			this.fire( 'previous' );
		}, this );

		this.ui.next.on( 'click', function() {
			this.fire( 'next' );
		}, this );

		// Set up navigation bar with its children.
		var previousButtonWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.buttonWrapper.output() ),
			nextButtonWrapper = previousButtonWrapper.clone(),
			listWrapper = CKEDITOR.dom.element.createFromHtml( this.templates.listWrapper.output() );

		previousButtonWrapper.append( this.ui.previous );
		listWrapper.append( this.ui.list );
		nextButtonWrapper.append( this.ui.next );

		this.ui.wrapper.append( previousButtonWrapper );
		this.ui.wrapper.append( listWrapper );
		this.ui.wrapper.append( nextButtonWrapper );

		this.ui.previous.unselectable();
		this.ui.next.unselectable();

		// Handle issue selection from list.
		this.ui.list.on( 'change', function( evt ) {
			this.fire( 'change', this.getListValue() )
		}, this );

		/**
		 * Event fired when the value of issues list is changed.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation
		 * @event change
		 */

		/**
		 * Event fired when the "previous issue" button is clicked.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation
		 * @event previous
		 */

		/**
		 * Event fired when the "next issue" button is clicked.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation
		 * @event next
		 */
	}

	ViewerNavigation.prototype = {
		templates: {
			/**
			 * Template of navigations's wrapper.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} wrapper
			 */
			wrapper: new CKEDITOR.template( '<div class="cke_a11yc_ui_navigation"></div>' ),

			/**
			 * Template of navigation button's wrapper.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} buttonWrapper
			 */
			buttonWrapper: new CKEDITOR.template( '<div class="cke_a11yc_ui_button_wrapper"></div>' ),

			/**
			 * Template of navigation button.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} button
			 */
			button:
				new CKEDITOR.template( '<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button cke_a11yc_ui_{class}" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>' ),

			/**
			 * Template of navigation's issue list.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} list
			 */
			list: new CKEDITOR.template( '<select class="cke_a11yc_ui_input_select"></select>' ),

			/**
			 * Template of navigation issue list's wrapper.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} listWrapper
			 */
			listWrapper: new CKEDITOR.template( '<div class="cke_a11yc_ui_select_wrapper"></div>' ),

			/**
			 * Template of navigation issue list's option.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} listOption
			 */
			listOption: new CKEDITOR.template( '<option value="{value}" {selected}>{text}</option>' ),

			/**
			 * Template of navigation issue list's group.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.navigation.templates
			 * @property {CKEDITOR.template} listGroup
			 */
			listGroup: new CKEDITOR.template( '<optgroup label="{label}"></optgroup>' )
		},

		/**
		 * Updates the list of issues.
		 *
		 * @method updateList
		 * @param {Object} issues
		 * @param {CKEDITOR.dom.element} currentElement
		 */
		updateList: ( function() {
			function trimText( text, length ) {
				if ( text.length > length ) {
					return CKEDITOR.tools.trim( text ).slice( 0, length - 3 ) + '[...]';
				} else {
					return text;
				}
			}

			var relevantNames = [ 'title', 'alt', 'src', 'href', 'id', 'name' ],
				infoTemplate = new CKEDITOR.template( ' ({name}="{value}")' );

			function getElementInfo( element ) {
				var rawAttributes = Array.prototype.slice.call( element.$.attributes ),
					namedAttributes = {},
					elementInfo;

				for ( var a in rawAttributes ) {
					namedAttributes[ rawAttributes[ a ].name ] = rawAttributes[ a ].value;
				}

				for ( var i = 0; i < relevantNames.length; ++i ) {
					if ( namedAttributes[ relevantNames[ i ] ] !== undefined ) {
						elementInfo = infoTemplate.output( {
							name: relevantNames[ i ],
							value: trimText( namedAttributes[ relevantNames[ i ] ], 50 )
						} );
						break;
					}
				}

				if ( !elementInfo )
					elementInfo = ' ("' + trimText( element.getText(), 50 ) + '")';

				return element.getName() + elementInfo;
			}

			return function( issues, currentElement ) {
				var i, j, group, issueIndex, element;

				// Clean-up the list first.
				this.cleanList();

				// For each group of issues.
				for ( i in issues.issues ) {
					group = CKEDITOR.dom.element.createFromHtml( this.templates.listGroup.output( {
						label: i
					} ) );

					// Append <optgroup>.
					this.ui.list.append( group );

					// For each issue in the group.
					for ( j = 0; j < issues.issues[ i ].length; ++j ) {
						element = issues.issues[ i ][ j ];

						// Append <option> to <optgroup>.
						issueIndex = issues.getIssueIndexByElement( element );

						group.append( CKEDITOR.dom.element.createFromHtml( this.templates.listOption.output( {
							value: issueIndex,
							text: getElementInfo( element ),
							selected: element.equals( currentElement ) ? 'selected="selected"' : ''
						} ) ) );
					}
				}
			}
		} )(),

		/**
		 * Cleans up the list of issues.
		 *
		 * @method cleanList
		 */
		cleanList: function() {
			this.ui.list.setHtml( '' );
		},

		/**
		 * Returns the index of currently selected issue.
		 *
		 * @method getListValue
		 * @returns {String}
		 */
		getListValue: function() {
			return this.ui.list.getValue();
		}
	};

	CKEDITOR.event.implementOn( ViewerNavigation.prototype );

	/**
	 * The description area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer.description
	 * @constructor Creates a viewer's description instance.
	 */
	function ViewerDescription() {
		this.ui = {
			/**
			 * Wrapper of the description.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.ui
			 * @property {CKEDITOR.dom.element} wrapper
			 */
			wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

			/**
			 * Title of the current issue.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.ui
			 * @property {CKEDITOR.dom.element} title
			 */
			title: CKEDITOR.dom.element.createFromHtml( this.templates.title.output() ),

			/**
			 * Information about the issue.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.ui
			 * @property {CKEDITOR.dom.element} info
			 */
			info: CKEDITOR.dom.element.createFromHtml( this.templates.info.output() ),
		};

		this.ui.title.appendTo( this.ui.wrapper );
		this.ui.info.appendTo( this.ui.wrapper );
	}

	ViewerDescription.prototype = {
		templates: {
			/**
			 * Template of description's wrapper.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.templates
			 * @property {CKEDITOR.template} wrapper
			 */
			wrapper: new CKEDITOR.template( '<div class="cke_a11yc_ui_desc_wrapper"></div>' ),

			/**
			 * Template of description's title.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.templates
			 * @property {CKEDITOR.template} title
			 */
			title: new CKEDITOR.template( '<strong class="cke_a11yc_ui_desc_title"></strong>' ),

			/**
			 * Template of description's info.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.description.templates
			 * @property {CKEDITOR.template} info
			 */
			info: new CKEDITOR.template( '<p class="cke_a11yc_ui_desc_info"></p>' )
		},

		/**
		 * Sets the new title of the issue.
		 *
		 * @method setTitle
		 * @param {String} text
		 */
		setTitle: function( text ) {
			this.ui.title.setHtml( text );
		},

		/**
		 * Sets the info of the issue.
		 *
		 * @method setInfo
		 * @param {String} text
		 */
		setInfo: function( text ) {
			this.ui.info.setHtml( text );
		}
	}

	/**
	 * The "quick fix" area of {@link CKEDITOR.plugins.a11ychecker.viewer}.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer.form
	 * @mixins CKEDITOR.event
	 * @constructor Creates a "quick fix" form instance.
	 */
	function ViewerForm() {
		this.inputs = {};

		this.ui = {
			/**
			 * Wrapper of the form.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.ui
			 * @property {CKEDITOR.dom.element} wrapper
			 */
			wrapper: CKEDITOR.dom.element.createFromHtml( this.templates.wrapper.output() ),

			/**
			 * Wrapper of the form inputs.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.ui
			 * @property {CKEDITOR.dom.element} fieldset
			 */
			fieldset: CKEDITOR.dom.element.createFromHtml( this.templates.fieldset.output() ),

			/**
			 * The "quick fix" button of the form.
			 *
			 * @readonly
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.ui
			 * @property {CKEDITOR.dom.element} button
			 */
			button: CKEDITOR.dom.element.createFromHtml( this.templates.button.output( {
				title: 'Quick fix',
				text: 'Quick fix'
			} ) ),
		};

		this.ui.fieldset.appendTo( this.ui.wrapper );
		this.ui.button.appendTo( this.ui.wrapper );
		this.ui.button.on( 'click', function( evt ) {
			console.log( this.serialize() );

			evt.data.preventDefault();
		}, this );
	};

	ViewerForm.prototype = {
		templates: {
			/**
			 * Template of form's wrapper.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.templates
			 * @property {CKEDITOR.template} wrapper
			 */
			wrapper: new CKEDITOR.template( '<div role="presentation" class="cke_a11yc_ui_form"></div>' ),

			/**
			 * Template of inputs' fieldset.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.templates
			 * @property {CKEDITOR.template} fieldset
			 */
			fieldset: new CKEDITOR.template( '<div role="presentation" class="cke_a11yc_ui_form_fieldset"></div>' ),

			/**
			 * Template form's "quick fix" button.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.viewer.form.templates
			 * @property {CKEDITOR.template} button
			 */
			button:
				new CKEDITOR.template( '<a href="javascript:void(0)" title="{title}" hidefocus="true" class="cke_a11yc_ui_button cke_a11yc_ui_button_ok" role="button">' +
					'<span class="cke_a11yc_ui_button">{text}</span>' +
				'</a>' )
		},

		/**
		 * Adds a new input to the fieldset.
		 *
		 * @method addInput
		 * @param {String} name
		 * @param {Object} definition
		 */
		addInput: function( name, definition ) {
			this.inputs[ name ] = new ViewerInputs[ CKEDITOR.tools.capitalize( definition.type ) ]( name, definition );
			this.inputs[ name ].wrapper.appendTo( this.ui.fieldset );

			this.fire( 'addInput', this.inputs[ name ] );
		},

		/**
		 * Removes the input from the fieldset.
		 *
		 * @method removeInput
		 */
		removeInput: function( name ) {
			this.inputs[ name ].remove();

			this.fire( 'removeInput', this.inputs[ name ] );

			this.inputs[ name ] = null;
		},

		/**
		 * Adds multiple inputs to the fieldset according to the definition.
		 *
		 * @method setInputs
		 * @param {Object} definition
		 */
		setInputs: function( definition ) {
			this.removeInputs();
			this.inputs = {};

			for ( var name in definition ) {
				this.addInput( name, definition[ name ] );
			}
		},

		/**
		 * Removes all inputs from the fieldset.
		 *
		 * @method removeInputs
		 */
		removeInputs: function() {
			for ( var name in this.inputs )
				this.removeInput( name );
		},

		/**
		 * Retrieves inputs' data of the form.
		 *
		 * @returns {Object}
		 */
		serialize: function() {
			var data = {};

			for ( var i in this.inputs )
				data[ i ] = this.inputs[ i ].getValue();

			return data;
		}
	};

	CKEDITOR.event.implementOn( ViewerForm.prototype );

	/**
	 * The generic class of {@link CKEDITOR.plugins.a11ychecker.viewer.form} input.
	 *
	 * @since 4.5
	 * @class CKEDITOR.plugins.a11ychecker.viewer.input
	 * @constructor Creates an input instance.
	 */
	function ViewerInput( name, definition ) {
		if ( definition ) {
			this._ = {
				definition: definition
			};

			this.name = name;
			this.id = 'cke_' + CKEDITOR.tools.getNextId() + '_input';
			this.wrapper = CKEDITOR.dom.element.createFromHtml( this.wrapperTemplate.output( {
				label: definition.label,
				id: this.id
			} ) );
		}
	}

	ViewerInput.prototype = {
		/**
		 * Template of input's wrapper.
		 *
		 * @property {CKEDITOR.template} wrapperTemplate
		 */
		wrapperTemplate: new CKEDITOR.template(
			'<div role="presentation" class="cke_a11yc_ui_input_wrapper">' +
				'<label class="cke_a11yc_ui_input_label" for="{id}">{label}</label>' +
			'</div>' ),

		/**
		 * Gets the value of the input.
		 *
		 * @method getValue
		 */
		getValue: function() {
			return this.input.getValue();
		},

		/**
		 * Sets the value of the input.
		 *
		 * @method setValue
		 * @param {String} value
		 */
		setValue: function( value ) {
			this.input.setValue( value );
		},

		/**
		 * Removes input from DOM.
		 *
		 * @method remove
		 */
		remove: function() {
			this.wrapper.remove();
		}
	};

	var ViewerInputs = {
		/**
		 * The text input of {@link CKEDITOR.plugins.a11ychecker.viewer.form}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewer.inputs.text
		 * @extends CKEDITOR.plugins.a11ychecker.viewer.input
		 * @constructor Creates a text input instance.
		 */
		Text: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			this.input.appendTo( this.wrapper );
		},

		/**
		 * The checkbox input of {@link CKEDITOR.plugins.a11ychecker.viewer.form}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewer.inputs.checkbox
		 * @extends CKEDITOR.plugins.a11ychecker.viewer.input
		 * @constructor Creates a checkbox input instance.
		 */
		Checkbox: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			this.input.appendTo( this.wrapper );
		},

		/**
		 * The select input of {@link CKEDITOR.plugins.a11ychecker.viewer.form}.
		 *
		 * @since 4.5
		 * @class CKEDITOR.plugins.a11ychecker.viewer.inputs.select
		 * @extends CKEDITOR.plugins.a11ychecker.viewer.input
		 * @constructor Creates a select input instance.
		 */
		Select: function( name, definition ) {
			ViewerInput.apply( this, arguments );

			this.options = {};

			this.input = CKEDITOR.dom.element.createFromHtml( this.inputTemplate.output( {
				id: this.id
			} ) );

			for ( var o in definition.options ) {
				this.options[ o ] = CKEDITOR.dom.element.createFromHtml( this.optionTemplate.output( {
					value: o,
					text: definition.options[ o ]
				} ) );

				this.options[ o ].appendTo( this.input );
			}

			this.input.appendTo( this.wrapper );
		}
	};

	ViewerInputs.Text.prototype = CKEDITOR.tools.extend( new ViewerInput, {
		/**
		 * Template of the input.
		 *
		 * @property {CKEDITOR.template} inputTemplate
		 */
		inputTemplate: new CKEDITOR.template(
			'<input class="cke_a11yc_ui_input cke_a11yc_ui_input_text" type="text" id={id} aria-labelledby="id" aria-required="true">' )
	} );

	ViewerInputs.Checkbox.prototype = CKEDITOR.tools.extend( new ViewerInput, {
		/**
		 * Template of the input.
		 *
		 * @property {CKEDITOR.template} inputTemplate
		 */
		inputTemplate: new CKEDITOR.template(
			'<input class="cke_a11yc_ui_input cke_a11yc_ui_input_checkbox" type="checkbox" id={id} aria-labelledby="id" aria-required="true">' ),

		getValue: function() {
			return this.input.$.checked;
		}
	}, true );

	ViewerInputs.Select.prototype = CKEDITOR.tools.extend( new ViewerInput, {
		/**
		 * Template of the input.
		 *
		 * @property {CKEDITOR.template} inputTemplate
		 */
		inputTemplate: new CKEDITOR.template( '<select class="cke_a11yc_ui_input_select" id={id} aria-labelledby="id" aria-required="true"></select>' ),

		/**
		 * Template of the option.
		 *
		 * @property {CKEDITOR.template} inputTemplate
		 */
		optionTemplate: new CKEDITOR.template( '<option value="{value}">{text}</select>' )
	} );

	// Stores objects defining title/description for given issue type.
	CKEDITOR.plugins.a11ychecker.types = {};

	// Moves focus to next known a11y issue.
	CKEDITOR.plugins.a11ychecker.next = function( editor ) {
		var namespace = editor._.a11ychecker,
			issues = namespace.issues,
			ui = namespace.ui,
			curFocusedElement;

		if ( issues.issuesCount == 0 ) {
			//console.log( 'no issues :(' );
			return;
		}

		curFocusedElement = issues.getFocused();

		// Remove focus indicator from current one.
		//if ( curFocusedElement )
		//	ui.unmarkFocus( curFocusedElement );

		curFocusedElement = issues.next();

		// Mark it in fancy fashion.
		//if ( curFocusedElement )
		//	ui.markFocus( curFocusedElement );

		editor._.a11ychecker.viewer.showIssue( curFocusedElement );
	};


	CKEDITOR.plugins.a11ychecker.prev = function( editor ) {
		var namespace = editor._.a11ychecker,
			issues = namespace.issues,
			curFocusedElement;

		if ( issues.issuesCount == 0 ) {
			//console.log( 'no issues :(' );
			return;
		}

		curFocusedElement = issues.getFocused();

		//if ( curFocusedElement ) {
		//	// Remove focus indicator from current one.
		//	curFocusedElement.removeClass( 'cke_a11y_focused' );
		//}

		curFocusedElement = issues.prev();

		// Mark it in fancy fashion.
		//curFocusedElement.addClass( 'cke_a11y_focused' );

		editor._.a11ychecker.viewer.showIssue( curFocusedElement );
	};

	CKEDITOR.plugins.a11ychecker.clearResults = function( editor ) {
		var namespace = editor._.a11ychecker,
			issues = namespace.issues;

		if ( issues.getFocused() )
			issues.getFocused().removeClass( 'cke_a11y_focused' );

		issues.each( function( element ) {
			element.removeClass( 'cke_a11ychecker_error' );
		} );

		issues.clear();
	};

	CKEDITOR.plugins.a11ychecker.close = function( editor ) {
		var namespace = editor._.a11ychecker;

		CKEDITOR.plugins.a11ychecker.clearResults( editor );

		// Removes all data-quail-id attributes from editable elements.
		editor.editable().forEach( function( element ) {
			element.removeAttribute && element.removeAttribute( 'data-quail-id' );
		}, CKEDITOR.NODE_ELEMENT, false );

		namespace.ui.hide();
	};

	// Attempts to fix currently focused issue.
	CKEDITOR.plugins.a11ychecker.fixIssue = function( editor ) {
		var namespace = editor._.a11ychecker,
			issues = namespace.issues,
			focusedIssue = issues.getFocused();

		if ( !focusedIssue ) {
			alert( 'No issue focused!' );
			return;
		}

		//console.log( 'fixing issue...' );
		CKEDITOR.plugins.a11ychecker.displayTooltip( editor, focusedIssue );
	};

	/**
	 * Displays a tooltip for given node.
	 */
	CKEDITOR.plugins.a11ychecker.displayTooltip = function( editor, element ) {
		//console.log('tooltip for ', element);

		var namespace = editor._.a11ychecker,
			type = namespace.issues.getIssueTypeByElement( element );

		if ( !type ) {
			alert( 'No type found!' );
			return;
		}

		editor.openDialog('issuetooltip');

		var dialog = CKEDITOR.dialog.getCurrent(),
			wrapperElement = dialog.getContentElement( 'info', 'title' ).getElement();

		wrapperElement.findOne('.typeTitle').setText( CKEDITOR.plugins.a11ychecker.types[ type ].title );
		//wrapperElement.findOne('.typeDesc').setText( CKEDITOR.plugins.a11ychecker.types[ type ].desc );
		wrapperElement.findOne('.typeDesc').setHtml( CKEDITOR.plugins.a11ychecker.types[ type ].desc );

		// Include quickfix icons.
		var availableQuickfixes = CKEDITOR.plugins.a11ychecker.fixMapping[ type ],
			quickfixHtmlParts = [];

		if ( availableQuickfixes ) {
			quickfixHtmlParts = availableQuickfixes.map( function( element ) {
				return element.getIconHtml();
			} );
		}

		var quickfixWrapper =  wrapperElement.findOne('.typeQuickfixes'),
			quickfixCallback = function() {
				// Hides the dialog, and refreshes results.
				dialog && dialog.hide();
				CKEDITOR.plugins.a11ychecker.exec( editor );
			};

		quickfixWrapper.setHtml( quickfixHtmlParts.join( '' ) );

		if ( availableQuickfixes ) {
			// Horrible workaround detected: Once again iterate to dynamically attach click listeners :D
			for ( var i = availableQuickfixes.length-1; i >= 0; i-- ) {
				(function( i ) {
				quickfixWrapper.getChild( i ).on( 'click', function() {
					availableQuickfixes[ i ].fix( element, type, quickfixCallback );
				} );
				}( i ));
			}
		}
	};

	/**
	 * Adds an attribute to a fake object.
	 * @param	{CKEDITOR.dom.element}	element		Dom element of fakeobject.
	 * @param	{String}	attrName	Attribute name.
	 * @param	{Mixed}	attrValue	New value.
	 */
	function updateFakeobjectsAttribute( element, attrName, attrValue ) {
		attrValue = String( attrValue );

		// Note that we want to make sure that previous value is removed.
		var initialValue = decodeURIComponent( element.data('cke-realelement') ).replace( /(\s+data-quail-id="\d+")/g, '' ),
			//newVal = initialValue.replace( '<a', '<a ' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '"' );
			newVal = initialValue.replace( /^(<\w+\s)/, '$1' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '"' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	/**
	 * Performs a11y checking for current editor content.
	 */
	CKEDITOR.plugins.a11ychecker.exec = function( editor ) {
		var $ = window.jQuery,
			elem;

		CKEDITOR.plugins.a11ychecker.clearResults( editor );

		// UI must be visible.
		editor._.a11ychecker.ui.show();

		// Updates tmp div innerhtml.
		if ( !( elem = CKEDITOR.document.getBody().findOne( '#quailOutput' ) ) )
			elem = CKEDITOR.document.createElement( 'div', { attributes: { 'id': 'quailOutput', 'style': 'display: none' } } );
			//elem = CKEDITOR.document.createElement( 'div', { attributes: { 'id': 'quailOutput' } } );

		// Reassinging ids to each element.
		var lastId = 0;
		editor.editable().forEach( function( element ) {
			// Assign lastId incremented by one.
			element.data( 'quail-id', ++lastId );

			// Temp workaround for fakeobjects.
			if ( element.getName( 'a' ) && CKEDITOR.plugins.link.tryRestoreFakeAnchor( editor, element ) )
				updateFakeobjectsAttribute( element, 'data-quail-id', lastId );

			return true;
		}, CKEDITOR.NODE_ELEMENT, false );

		editor._.a11ychecker.disableFilterStrip = true;
		elem.setHtml( editor.getData() );
		editor._.a11ychecker.disableFilterStrip = false;
		CKEDITOR.document.getBody().append( elem );

		var customTests = {
            "imgHasAlt": {
                "type": "selector",
                "selector": "img:not(img[alt])",
                "severity": "severe"
            }
        };

		// Calls quail.
		var quailConfig = {
			guideline : [ 'imgHasAlt', 'aMustNotHaveJavascriptHref', 'aAdjacentWithSameResourceShouldBeCombined', 'pNotUsedAsHeader' ],
			//guideline : 'wcag',
			jsonPath : editor._.a11ychecker.basePath + 'dist',
			// Causes total.results to be new in each call.
			reset: true,
			complete: function( total ) {
				var results = total.results,
					errors = [];

				editor._.a11ychecker.issues.setQuailIssues( results );

				execUiUpdate( editor, total, results );

				// Looking for unknown issue types.
				var knownTypes = CKEDITOR.plugins.a11ychecker,
					curTestObject;

				for ( var issueType in results ) {

					if ( !knownTypes.types[ issueType ] ) {
						curTestObject = results[ issueType ].test;

						knownTypes.types[ issueType ] = {
							title: curTestObject.title.en,
							desc: curTestObject.description.en,
							testability: curTestObject.testability
						};
					}
				}

				// Now we can iterate over all found issues, and mark them with specific class.
				editor._.a11ychecker.issues.each( function( element, issueGroup ) {
					element.addClass( 'cke_a11ychecker_error' );

					errors.push( {
						element: element,
						type: issueGroup
					} );
				} );

				//console.log( 'Issued problems:', errors );
				//console.log( 'Problem issued (filtered:)', errors.map( function( el, index ) {
				//	return [ el.element.$, el.type ];
				//} ) );
			}
		};

		//console.log( 'performing quail test' );
		$( elem.$ ).quail( quailConfig );
	};

	// Returns human friendly representation of given element.
	// @param {jQuery} el jQuery wrapped element
	// @return {String}
	function humanReadableElement( el ) {
		el = new CKEDITOR.dom.element( el[0] );
		if ( el.getName() == 'a' ) {
			if ( el.getText() )
				return 'a: ' + el.getText();
			else
				return 'a[name="' + el.getAttribute( 'name' ) + '"]';
		}
	}

	/**
	 * @param {Object} results Object returned by Quail as total.results
	 * @returns {Array}
	 */
	function toGroupedOptions( results ) {
		var ret = [];

		for ( var i in results ) {
			var curResult = results[ i ];

			if ( !curResult.elements.length )
				continue;

			var obj = {
				name: i,
				options: {
				}
			};

			for (var j=0; j < curResult.elements.length; j++) {
				var innerText = humanReadableElement( curResult.elements[ j ] ) || 'Issue #' + (j + 1);
				obj.options[ j ] = innerText;
			}

			ret.push( obj );
		}

		return ret;
	}

	function execUiUpdate( editor, total, results ) {
		var ui = editor._.a11ychecker.ui;

		ui.issues.setOptionsGrouped( toGroupedOptions( total.results ) );
		ui.update();
	}
} )();
