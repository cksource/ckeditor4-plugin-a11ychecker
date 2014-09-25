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
		// Should A11ychecker toolbar be hidden on run.
		cfgStartHidden = true;

	CKEDITOR.plugins.add( pluginName, {
		requires: 'dialog,balloonpanel',
		lang: 'en', // %REMOVE_LINE_CORE%
		icons: pluginName, // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			this.loadCss();
		},

		init: function( editor ) {
			var engineClass = editor.config.a11ychecker_engine || 'EngineQuail',
				engineParams = editor.config.a11ychecker_engineParams || {},
				that = this;

			this.guiRegister( editor );

			// Loads Engine, Controller and ViewerController classes.
			require( [ 'Controller', engineClass, 'ui/ViewerController' ], function( Controller, EngineClass, ViewerController ) {
				var a11ychecker = new Controller( editor );

				a11ychecker.engine = new EngineClass( engineParams, that );
				// @todo: viewer controller should be actually created within controller construct.
				a11ychecker.viewerController = new ViewerController( a11ychecker, {
					title: 'Accessibility checker'
				} );
				// @todo: Check if this flag is needed.
				a11ychecker.disableFilterStrip = true;

				// Assign controller object to the editor protected namespace.
				editor._.a11ychecker = a11ychecker;
				// Expose ViewerController class.
				CKEDITOR.plugins.a11ychecker.viewerController = ViewerController;
			} );

			this.commandRegister( editor );
			this.addHotkeys( editor );
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

			if ( editor.ui.addButton ) {
				editor.ui.addButton( 'A11ychecker', {
					label: lang.toolbar,
					command: pluginName,
					toolbar: 'document,10'
				} );
			}

			// Insert contents CSS.
			editor.addContentsCss( this.path + 'styles/contents.css' );
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

	// Stores objects defining title/description for given issue type.
	CKEDITOR.plugins.a11ychecker.types = {};

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

	// Expose UI classes.
	require( [ 'ui/ViewerInputs', 'ui/ViewerInput', 'ui/ViewerDescription', 'ui/ViewerNavigation', 'ui/Viewer', 'ui/ViewerForm' ], function( ViewerInputs, ViewerInput, ViewerDescription, ViewerNavigation, Viewer, ViewerForm ) {

		// Make all Viewer* classes public.
		CKEDITOR.tools.extend( CKEDITOR.plugins.a11ychecker, {
			viewer: Viewer,
			viewerNavigation: ViewerNavigation,
			viewerDescription: ViewerDescription,
			viewerForm: ViewerForm,
			viewerInput: ViewerInput,
			viewerInputs: ViewerInputs
		} );
	} );

	/**
	 * For every Accessibility Checker hotkey you may use `0` in order to disable it.
	 *
	 * @cfg {Object} a11ychecker_hotkeys
	 * @cfg {Number} [a11ychecker_hotkeys.open = CKEDITOR.CTRL + CKEDITOR.ALT + 69 // E] Starts Accessibility checker.
	 * @cfg {Number} [a11ychecker_hotkeys.next = CKEDITOR.CTRL + 69 // E] Go to next accessibility issue.
	 * @cfg {Number} [a11ychecker_hotkeys.next = CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 // E] Go to previous accessibility issue.
	 */

	/**
	 * Accessibility Checker engine name.
	 *
	 * It comes down to setting the name of a engine class which will take a care
	 * of finding accessibility issues.
	 *
	 * @cfg {String} [a11ychecker_engine='EngineQuail']
	 */

	/**
	 * Extra parameters passed to engine constructor.
	 *
	 * @cfg {Object} [a11ychecker_engineParams={}]
	 */
} )();
