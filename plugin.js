/**
 * @license Copyright (c) 2014-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/license
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
		lang: 'en,nl,de,de-ch,pt-br', // %REMOVE_LINE_CORE%
		// List of preferred languages for quickfixes.
		quickFixesLang: 'en,nl,de,de-ch,pt-br',
		icons: pluginName, // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			var path = this.path;

			// Load skin CSS.
			CKEDITOR.document.appendStyleSheet( path + 'skins/' + this.getStylesSkinName() + '/a11ychecker.css' );

			// Namespace register.
			require( [
				'Engine',
				'Issue',
				'IssueList',
				'IssueDetails',
				'quickfix/LocalizedRepository'
			], function(
				Engine,
				Issue,
				IssueList,
				IssueDetails,
				LocalizedRepository
			) {
				CKEDITOR.tools.extend( CKEDITOR.plugins.a11ychecker, {
					Engine: Engine,
					Issue: Issue,
					IssueList: IssueList,
					IssueDetails: IssueDetails
				} );

				CKEDITOR.plugins.a11ychecker.quickFixes = new LocalizedRepository( path + 'quickfix/' );
			} );
		},

		beforeInit: function( editor ) {
			var that = this;

			if ( !editor.config.a11ychecker_noIgnoreData ) {
				// Register an ACF rule so it won't remove data-a11y-ignore attributes, only if there
				// is no config setting denying it.
				editor.filter.allow( '*[data-a11y-ignore]', 'a11ychecker' );
			}

			// Create a temp controller placeholder.
			this.createTemporaryNamespace( editor );

			editor.once( 'instanceReady', function() {
				// Loads Engine, Controller and ViewerController classes.
				require( [ 'Controller' ], function( Controller ) {
					var a11ychecker = new Controller( editor ),
						tempNamespace = editor._.a11ychecker;

					// Assign controller object to the editor protected namespace.
					editor._.a11ychecker = a11ychecker;

					tempNamespace.getEngineType( function( EngineType ) {
						a11ychecker.setEngine( new EngineType( that ) );
						/**
						 * @todo: this line should be moved to the EngineQuail constructor.
						 * I've put it here just to avoid conflicts with t/130 branch. After that we should move this.
						 */
						a11ychecker.engine.config = a11ychecker.engine.createConfig( editor );

						// Fire loaded event on old placeholder, so subscribers know that real Controller
						// is available.
						tempNamespace.fire( 'loaded', null, editor );
					} );
				} );
			} );

			that.commandRegister.call( that, editor );
			that.guiRegister( editor );
		},

		// Register buttons, dialogs etc.
		guiRegister: function( editor ) {
			var cssPath = this.path + 'skins/' + this.getStylesSkinName() + '/contents.css',
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
				exec: cmdExec,
				async: true,
				canUndo: false,
				editorFocus: false // (#123)
			} );

			editor.addCommand( pluginName + '.listen', {
				exec: cmdListen,
				canUndo: false,
				editorFocus: false
			} );

			editor.addCommand( pluginName + '.next', {
				exec: cmdNext,
				async: true,
				canUndo: false,
				editorFocus: false
			} );

			editor.addCommand( pluginName + '.prev', {
				exec: cmdPrev,
				async: true,
				canUndo: false,
				editorFocus: false
			} );

			editor.addCommand( pluginName + '.close', {
				exec: cmdClose
			} );
		},

		/**
		 * Creates a temporary editor._.a11ychecker object, implementing event listening.
		 *
		 * The only purpose of this object is to fire `loaded` event, telling that real
		 * Controller was instantiated in editor._.a11ychecker method.
		 */
		createTemporaryNamespace: function( editor ) {
			editor._.a11ychecker = {
				getEngineType: function( callback ) {
					/* @exclude */
					require( [ 'EngineQuail' ], function( EngineQuail ) {
						callback( EngineQuail );
					} );
					/* @endexclude */

					/* @include quailInclude.js */
				}
			};

			CKEDITOR.event.implementOn( editor._.a11ychecker );
		},

		/**
		 * Returns skinName for which CSS is prepared. If there is not CSS for the
		 * current skin, the default skinName (moono-lisa) is returned.
		 *
		 * @returns {String} Skin name which CSS files should be used.
		 */
		getStylesSkinName: function() {
			// Default skin is moono-lisa.
			var skinName = 'moono-lisa';

			// Handle other skins for which CSS is also prepared.
			if ( CKEDITOR.skinName == 'moono' ) {
				skinName = 'moono';
			}
			return skinName;
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
		dev: true, // %REMOVE_LINE%
		rev: '%REV%'
	};

	/*
	 * Editor command functions.
	 * Defined here, so only one function instance is in memory, and they're shared across
	 * editors.
	 */
	function cmdNext( editor ) {
		if ( a11ycheckerInCheckingMode( editor ) ) {
			return generateCommand( editor, 'a11ychecker.next', 'next' );
		}
	}

	function cmdPrev( editor ) {
		if ( a11ycheckerInCheckingMode( editor ) ) {
			return generateCommand( editor, 'a11ychecker.prev', 'prev' );
		}
	}

	function cmdExec( editor ) {
		return generateCommand( editor, 'a11ychecker', 'exec' );
	}

	function cmdListen( editor ) {
		return editor._.a11ychecker.listen();
	}

	function cmdClose( editor ) {
		return editor._.a11ychecker.close();
	}

	// A function to generate an async command exec function.
	//
	// @param {CKEDITOR.editor} editor
	// @param {String} name Name of the command to be registered.
	// @param {String} controllerMethod Name of method in controller that should be called.
	// @returns {Mixed} Any value that related method will return.
	function generateCommand( editor, name, controllerMethod ) {
		return editor._.a11ychecker[ controllerMethod ]( function() {
			// Since the command is async, we need to fire afterCommandExec event
			// on our own.
			editor.fire( 'afterCommandExec', {
				name: name,
				command: editor.getCommand( name ),
				commandData: {}
			} );
		} );
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
		/*jshint validthis: true */
		var cfg = this.config,
			curContentsCss = cfg.contentsCss;

		// Convert current value into array.
		if ( !CKEDITOR.tools.isArray( curContentsCss ) ) {
			cfg.contentsCss = curContentsCss ? [ curContentsCss ] : [];
		}

		cfg.contentsCss.push( cssPath );
	}

	/**
	 * For every Accessibility Checker hotkey you may use `0` in order to disable it.
	 *
	 * @cfg {Object} a11ychecker_keystrokes
	 * @cfg {Number} [a11ychecker_keystrokes.open = CKEDITOR.CTRL + CKEDITOR.ALT + 69 // E] Starts Accessibility Checker.
	 * @cfg {Number} [a11ychecker_keystrokes.close = 27 // ESC] Closes Accessibility Checker.
	 * @cfg {Number} [a11ychecker_keystrokes.next = CKEDITOR.CTRL + 69 // E] Go to next accessibility issue.
	 * @cfg {Number} [a11ychecker_keystrokes.prev = CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 // E] Go to previous
	 * accessibility issue.
	 * @cfg {Number} [a11ychecker_keystrokes.listen = CKEDITOR.SHIFT + 27 // ESC] Toggles listening mode.
	 */

	/**
	 * Prevents Accessibility Checker from storing `data-a11y-ignore` attributes in output
	 * content.
	 *
	 * @cfg {Boolean} [a11ychecker_noIgnoreData=false]
	 */
} )();
