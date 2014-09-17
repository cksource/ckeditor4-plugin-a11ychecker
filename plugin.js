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
		Controller,
		EngineQuailOld;

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
			// Create controller object in protected namespace.
			editor._.a11ychecker = new Controller( editor );
			editor._.a11ychecker.engine = new EngineQuailOld( {
				//jsonPath: this.path + quailDirectory + 'dist'
				jsonPath: this.path + '/libs/quail/2.2.8/'
			} );

			editor._.a11ychecker.viewerController = new ViewerController( editor, {
				title: 'Accessibility checker'
			} );

			// @todo: Check if this flag is needed.
			editor._.a11ychecker.disableFilterStrip = true;

			this.guiRegister( editor );
			this.commandRegister( editor );
			// We may combine two functions below.
			this.addDataTransformationListeners( editor );
			this.addEditorListeners( editor );
			this.addHotkeys( editor );
		},

		/**
		 * @todo: this responsibility should be moved to EditableDecorator.
		 */
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

						var issueList = editor._.a11ychecker.issues,
							issue = issueList.getIssueByElement( target ),
							offset = issueList.indexOf( issue );

						if ( issue ) {
							editor._.a11ychecker.viewerController.showIssue( issue );
							editor._.a11ychecker.issues.moveTo( offset );
						} else {
							console.warn( 'unidentified issue for element' + offset ); // %REMOVE_LINE_CORE%
						}
					}
				} );
			} );
		},

		/**
		 * Adds hotkey mappings.
		 */
		addHotkeys: function( editor ) {
			var config = editor.config,
				hotkeysConfig = config.a11ychecker_hotkeys || {},
				defaultMapping = {
					'open': CKEDITOR.CTRL + CKEDITOR.ALT + 69 /*E*/,
					'next': CKEDITOR.CTRL + 69 /*E*/,
					'prev': CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 /*E*/
				},
				commandSuffix,
				i;

			for ( i in defaultMapping ) {
				// We assign default value only in case of undefined.
				if ( hotkeysConfig[ i ] === undefined ) {
					hotkeysConfig[ i ] = defaultMapping[ i ];
				}

				// The part which will be added to a11checker.
				// In case of "open" we don't want to add any suffixes.
				commandSuffix = ( i == 'open' ? '' : '.' + i );

				editor.setKeystroke( hotkeysConfig[ i ], pluginName + commandSuffix );
			}

			/**
			 * @todo: Remove this hotkey, it's for testing ease only.
			 * Also fixIssue is a legacy part, might be removed soon.
			 */
			editor.setKeystroke( CKEDITOR.ALT + 13 /*ENTER*/, 'maximize' );
			//editor.setKeystroke( CKEDITOR.CTRL + CKEDITOR.ALT + 32 /*SPACE*/, pluginName + '.fixIssue' );

			if ( !config.a11ychecker_hotkeys ) {
				// We need to change config, so viewer might reuse values.
				config.a11ychecker_hotkeys = hotkeysConfig;
			}
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
				exec: cmdExec
			} );

			editor.addCommand( pluginName + '.next', {
				exec: cmdNext
			} );

			editor.addCommand( pluginName + '.prev', {
				exec: cmdPrev
			} );
		},

		// Loads external JavaScript libs.
		loadJs: function() {
			// Sync dependencies.
			var syncDependencies = [ 'UiComponent.js', 'Ui.js' ];

			for (var i=0; i < syncDependencies.length; i++) {
				CKEDITOR.scriptLoader.load( this.path + syncDependencies[ i ] );
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

	//require( [ 'Controller', 'EngineQuailOld' ], function( _Controller, _EngineQuailOld ) {
	require( [ 'Controller', 'EngineQuail' ], function( _Controller, _EngineQuailOld ) {
		Controller = _Controller;
		EngineQuailOld = _EngineQuailOld;
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

	CKEDITOR.plugins.a11ychecker.clearResults = function( editor ) {
		var issues = editor._.a11ychecker.issues;

		if ( issues ) {
			issues.clear();
		}
	};

	/**
	 * Performs a11y checking for current editor content.
	 */
	CKEDITOR.plugins.a11ychecker.exec = function( editor ) {
		return editor._.a11ychecker.exec();
	};

	/**
	 * Editor command functions.
	 * Defined here, so only one function instance is in memory, and they're shared across
	 * editors.
	 */

	function cmdNext( editor ) {
		return editor._.a11ychecker.next();
	}

	function cmdPrev( editor ) {
		return editor._.a11ychecker.prev();
	}

	function cmdExec( editor ) {
		return editor._.a11ychecker.exec();
	}

	function cmdClose( editor ) {
		return editor._.a11ychecker.close();
	}

	/**
	 * For every Accessibility Checker hotkey you may use `0` in order to disable it.
	 *
	 * @cfg {Object} a11ychecker_hotkeys
	 * @cfg {Number} [a11ychecker_hotkeys.open = CKEDITOR.CTRL + CKEDITOR.ALT + 69 // E] Starts Accessibility checker.
	 * @cfg {Number} [a11ychecker_hotkeys.next = CKEDITOR.CTRL + 69 // E] Go to next accessibility issue.
	 * @cfg {Number} [a11ychecker_hotkeys.next = CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 // E] Go to previous accessibility issue.
	 */
} )();
