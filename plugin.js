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

		beforeInit: function( editor ) {
			var engineClass = editor.config.a11ychecker_engine || 'EngineQuail',
				engineParams = editor.config.a11ychecker_engineParams || {},
				that = this;

			if ( !editor.config.a11ychecker_noIgnoreData ) {
				// Register a rule so ACF won't remove data-a11y-ignore attributes, only if there
				// is no config setting denying it.
				editor.filter.allow( '*[data-a11y-ignore]', 'a11ychecker' );
			}

			this.guiRegister( editor );

			editor.once( 'instanceReady', function() {
				// Loads Engine, Controller and ViewerController classes.
				require( [ 'Controller', 'EngineDefault' ], function( Controller, EngineClass ) {
					var a11ychecker = new Controller( editor );

					a11ychecker.engine = new EngineClass( engineParams, that );

					// @todo: Check if this flag is needed.
					a11ychecker.disableFilterStrip = true;

					// Assign controller object to the editor protected namespace.
					editor._.a11ychecker = a11ychecker;
				} );

				that.commandRegister.call( that, editor );
			} );

		},

		// Register buttons, dialogs etc.
		guiRegister: function( editor ) {
			var lang = editor.lang.a11ychecker,
				cssPath = this.path + 'styles/contents.css',
				addContentsCss = editor.addContentsCss || editorAddContentsCss;

			if ( editor.ui.addButton ) {
				editor.ui.addButton( 'A11ychecker', {
					label: lang.toolbar,
					command: pluginName,
					toolbar: 'document,10'
				} );
			}

			// Insert contents CSS.
			addContentsCss.call( editor, cssPath );
		},

		/*
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

			editor.addCommand( pluginName + '.close', {
				exec: cmdClose
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

	CKEDITOR.plugins.a11ychecker = {
		/**
		 * @member CKEDITOR.plugins.a11ychecker
		 * @type {Boolean/Undefined}
		 *
		 * Tells whether plugin is in development version or not. For plugin builded version
		 * this property will be `undefined`.
		 */
		dev: true // %REMOVE_LINE%
	};

	// Stores objects defining title/description for given issue type.
	CKEDITOR.plugins.a11ychecker.types = {};

	/**
	 * Performs a11y checking for current editor content.
	 */
	CKEDITOR.plugins.a11ychecker.exec = function( editor ) {
		return editor._.a11ychecker.exec();
	};

	/*
	 * Editor command functions.
	 * Defined here, so only one function instance is in memory, and they're shared across
	 * editors.
	 */
	function cmdNext( editor ) {
		if ( a11ycheckerInCheckingMode( editor ) ) {
			return editor._.a11ychecker.next();
		}
	}

	function cmdPrev( editor ) {
		if ( a11ycheckerInCheckingMode( editor ) ) {
			return editor._.a11ychecker.prev();
		}
	}

	function cmdExec( editor ) {
		return editor._.a11ychecker.exec();
	}

	function cmdClose( editor ) {
		return editor._.a11ychecker.close();
	}

	// Tmp helper method, returns true if given editor Accessibility Checker is in
	// CHECKING mode.
	function a11ycheckerInCheckingMode( editor ) {
		var a11ychecker = editor._.a11ychecker;

		return ( a11ychecker && a11ychecker.modeType === a11ychecker.constructor.modes.CHECKING );
	}

	// Function is a simply copy-n-paste editor.addContentsCss added in CKE 4.4.0.
	// Will be used if function is not available for better backward compatibility.
	function editorAddContentsCss( cssPath ) {
		var cfg = this.config,
			curContentsCss = cfg.contentsCss;

		// Convert current value into array.
		if ( !CKEDITOR.tools.isArray( curContentsCss ) )
			cfg.contentsCss = curContentsCss ? [ curContentsCss ] : [];

		cfg.contentsCss.push( cssPath );
	}

	// Namespace register.
	require( [ 'Controller', 'Engine', 'Issue', 'IssueList', 'IssueDetails', 'QuickFix/Base' ], function( Controller, Engine, Issue, IssueList, IssueDetails, QuickFix ) {
		CKEDITOR.tools.extend( CKEDITOR.plugins.a11ychecker, {
			Controller: Controller,
			Engine: Engine,
			Issue: Issue,
			IssueList: IssueList,
			IssueDetails: IssueDetails,
			QuickFix: QuickFix
		} );
	} );

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

	/**
	 * Prevents Accessibility Checker from storing `data-a11y-ignore` attributes in output
	 * content.
	 *
	 * @cfg {Boolean} [a11ychecker_noIgnoreData=false]
	 */
} )();
