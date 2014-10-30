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

	var pluginName = 'a11ychecker';

	CKEDITOR.plugins.add( pluginName, {
		requires: 'balloonpanel',
		lang: 'en', // %REMOVE_LINE_CORE%
		icons: pluginName, // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Load skin CSS.
			CKEDITOR.document.appendStyleSheet( this.path + 'skins/moono/a11ychecker.css' );
		},

		beforeInit: function( editor ) {
			var that = this;

			if ( !editor.config.a11ychecker_noIgnoreData ) {
				// Register an ACF rule so it won't remove data-a11y-ignore attributes, only if there
				// is no config setting denying it.
				editor.filter.allow( '*[data-a11y-ignore]', 'a11ychecker' );
			}

			editor.once( 'instanceReady', function() {
				// Loads Engine, Controller and ViewerController classes.
				require( [ 'Controller', 'EngineDefault' ], function( Controller, EngineClass ) {
					var a11ychecker = new Controller( editor );

					a11ychecker.setEngine( new EngineClass( {}, that ) );
					// Assign controller object to the editor protected namespace.
					editor._.a11ychecker = a11ychecker;
				} );
			} );

			that.commandRegister.call( that, editor );
			that.guiRegister( editor );
		},

		// Register buttons, dialogs etc.
		guiRegister: function( editor ) {
			var cssPath = this.path + 'styles/contents.css',
				// We need to be aware that editor.addContentsCss might not be
				// available as it was introduced in CKE 4.4.0.
				addContentsCss = editor.addContentsCss || editorAddContentsCss;

			if ( editor.ui.addButton ) {
				editor.ui.addButton( 'A11ychecker', {
					label: editor.lang.a11ychecker.toolbar,
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
	 * Prevents Accessibility Checker from storing `data-a11y-ignore` attributes in output
	 * content.
	 *
	 * @cfg {Boolean} [a11ychecker_noIgnoreData=false]
	 */
} )();
