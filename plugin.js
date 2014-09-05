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
		cfgStartHidden = true,
		// Viewer controller class, will be loaded later on.
		ViewerController,
		// A11y checker controller class loaded by Requirejs.
		Controller;

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

			editor._.a11ychecker_new = new Controller( editor );

			// Some extra functions which will make api usage from command line,
			// a little bit easier.
			editor._.a11ychecker.exec = ( function( editor ) {
				return function() {
					return CKEDITOR.plugins.a11ychecker.exec( editor );
				};
			} )( editor );

			editor._.a11ychecker.viewerController = new ViewerController( editor, {
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
						console.log( 'show quickfixes for ', target );

						var offset = editor._.a11ychecker.issues.getIssueIndexByElement( target );

						editor._.a11ychecker.viewerController.showIssue( target );

						if ( offset !== null ) {
							console.log( 'identified offset: ' + offset );
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
							console.log( 'parent found', closestErrorParent );
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
			var basePath = CKEDITOR.getUrl( this.path + quailDirectory ),
				jQueryPath = basePath + 'lib/jquery/jquery.js',
				quailPath = basePath + 'dist/quail.jquery.js';

			CKEDITOR.scriptLoader.load(  jQueryPath, function() {
				// After loading jQuery, we might load Quail.
				CKEDITOR.scriptLoader.load( quailPath );
			} );

			// Sync dependencies.
			var syncDependencies = [ 'UiComponent.js', 'Ui.js', 'Issues.js', 'Controller.js', 'Quickfix.js' ],
				dependenciesCallbacks = {
					'Issues.js': function() {
						console.log( 'issues loaded' );
					}
				};

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

	CKEDITOR.plugins.a11ychecker = {};

	require( [ 'Controller' ], function( _Controller ) {
		Controller = _Controller;
	} );

	require( [ 'ui/ViewerInputs', 'ui/ViewerInput', 'ui/ViewerDescription', 'ui/ViewerNavigation', 'ui/ViewerController', 'ui/Viewer', 'ui/ViewerForm' ], function( ViewerInputs, ViewerInput, ViewerDescription, ViewerNavigation, _ViewerController, Viewer, ViewerForm ) {
		ViewerController = _ViewerController;

		// Make all Viewer* classes public.
		CKEDITOR.tools.extend( CKEDITOR.plugins.a11ychecker, {
			viewerController: ViewerController,
			viewer: Viewer,
			viewerNavigation: ViewerNavigation,
			viewerDescription: ViewerDescription,
			viewerForm: ViewerForm,
			viewerInput: ViewerInput,
			viewerInputs: ViewerInputs
		} );
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
			console.log( 'no issues :(' );
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
		editor._.a11ychecker.viewerController.showIssue( curFocusedElement );
	};


	CKEDITOR.plugins.a11ychecker.prev = function( editor ) {
		var namespace = editor._.a11ychecker,
			issues = namespace.issues,
			curFocusedElement;

		if ( issues.issuesCount == 0 ) {
			console.log( 'no issues :(' );
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
		editor._.a11ychecker.viewerController.showIssue( curFocusedElement );
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

		console.log( 'fixing issue...' );
		CKEDITOR.plugins.a11ychecker.displayTooltip( editor, focusedIssue );
	};

	/**
	 * Displays a tooltip for given node.
	 */
	CKEDITOR.plugins.a11ychecker.displayTooltip = function( editor, element ) {
		console.log('tooltip for ', element);

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
	 * Performs a11y checking for current editor content.
	 */
	CKEDITOR.plugins.a11ychecker.exec = function( editor ) {
		return editor._.a11ychecker_new.exec();
	};

} )();
