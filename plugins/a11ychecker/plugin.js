
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

			editor._.a11ychecker.viewer = new CKEDITOR.plugins.a11ychecker.viewer( editor, {
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

						editor._.a11ychecker.viewer.showError( target );

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
		}
	} );

	CKEDITOR.plugins.a11ychecker = {};

	/**
	 * A class which is responsible for creating the end-user interface – a panel
	 * which allows to browse and fix errors in the contents. The panel is built
	 * upon the {@link CKEDITOR.ui.balloonPanel}.
	 *
	 * @class
	 * @since 4.5
	 * @param {CKEDITOR.editor} editor The editor instance for which the panel is created.
	 * @param {Object} def An object containing panel definition.
	 */
	CKEDITOR.plugins.a11ychecker.viewer = function( editor, def ) {
		this._ = {
			panel: new CKEDITOR.ui.balloonPanel( editor, def )
		};

		this.templates = {
			bar: new CKEDITOR.template( '<div class="cke_a11yc_bar"></div>' ),
			previous: new CKEDITOR.template( '<a href="javascript:void(0)" title="Previous" hidefocus="true" class="cke_a11yc_button cke_a11yc_previous" role="button">' +
				'<span class="cke_a11yc_button">Previous</span>' +
			'</a>' ),
			next: new CKEDITOR.template( '<a href="javascript:void(0)" title="Next" hidefocus="true" class="cke_a11yc_button cke_a11yc_next" role="button">' +
				'<span class="cke_a11yc_button">Next</span>' +
			'</a>' ),
		};

		this.ui = {
			navigation: {
				/**
				 * The navigation bar.
				 *
				 * @readonly
				 * @member CKEDITOR.plugins.a11ychecker.viewer.ui.navigation
				 * @property {CKEDITOR.dom.element} bar
				 */
				bar: CKEDITOR.dom.element.createFromHtml( this.templates.bar.output() ),

				/**
				 * The "previous" button.
				 *
				 * @readonly
				 * @member CKEDITOR.plugins.a11ychecker.viewer.ui.navigation
				 * @property {CKEDITOR.dom.element} previous
				 */
				previous: CKEDITOR.dom.element.createFromHtml( this.templates.previous.output() ),

				/**
				 * The "next" button.
				 *
				 * @readonly
				 * @member CKEDITOR.plugins.a11ychecker.viewer.ui.navigation
				 * @property {CKEDITOR.dom.element} next
				 */
				next: CKEDITOR.dom.element.createFromHtml( this.templates.next.output() ),
			}
		};

		this.ui.navigation.previous.on( 'click', function() {
			CKEDITOR.plugins.a11ychecker.prev( editor );
		} );

		this.ui.navigation.next.on( 'click', function() {
			CKEDITOR.plugins.a11ychecker.next( editor );
		} );

		this.ui.navigation.bar.append( this.ui.navigation.previous );
		this.ui.navigation.bar.append( this.ui.navigation.next );

		this._.panel.ui.content.append( this.ui.navigation.bar, 1 );
	};

	CKEDITOR.plugins.a11ychecker.viewer.prototype = {
		/**
		 * Shows the panel next to the error in the contents.
		 *
		 * @param {CKEDITOR.dom.element} element An element to which the panel is attached.
		 */
		showError: function( element ) {
			element.scrollIntoView();

			// Wait for the scroll to stabilize.
			CKEDITOR.tools.setTimeout( function() {
				this._.panel.attach( element );
			}, 50, this );
		}
	};

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

		editor._.a11ychecker.viewer.showError( curFocusedElement );
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

		editor._.a11ychecker.viewer.showError( curFocusedElement );
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
