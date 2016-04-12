/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( [
	'Controller/CheckingMode',
	'Controller/ListeningMode',
	'Controller/BusyMode',
	'EditableDecorator',
	'PreferredIssueFinder',
	'ui/Ui',
	'ui/ViewerController',
	'HotkeyManager',
	'Localization'
], function(
	CheckingMode,
	ListeningMode,
	BusyMode,
	EditableDecorator,
	PreferredIssueFinder,
	Ui,
	ViewerController,
	HotkeyManager,
	Localization
) {
	'use strict';

	/**
	 * Exposes Accessibility Checker interface.
	 *
	 * This type stores the issue list and implements some high-level operations like
	 * going to next issue, focusing a particular issue, closing Accessibility Checker etc.
	 * Most of these methods are directly used by CKEditor commands.
	 *
	 * The controller contains a reference to (and manages) all the most important components
	 * like:
	 *
	 * * {@link CKEDITOR.plugins.a11ychecker.Engine}
	 * * {@link CKEDITOR.plugins.a11ychecker.IssueList}
	 * * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator}
	 * * {@link CKEDITOR.plugins.a11ychecker.ViewerController}
	 * * {@link CKEDITOR.plugins.a11ychecker.HotkeyManager}
	 *
	 * The controller works in one of multiple modes. Currently the following modes are available:
	 *
	 * * Checking
	 * * Listening
	 * * Busy
	 *
	 * States are changed by calling the {@link #setState} method with a property listed
	 * in the {@link CKEDITOR.plugins.a11ychecker.Controller#modes} enumeration.
	 *
	 * @since 4.6.0
	 * @mixins CKEDITOR.event
	 * @class CKEDITOR.plugins.a11ychecker.Controller
	 * @constructor
	 * @param {CKEDITOR.editor} editor
	 */
	function Controller( editor ) {
		this._ = {};
		/**
		 * The editor that this Accessibility Checker instance belongs to.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @type {CKEDITOR.editor}
		 */
		this.editor = editor;

		/**
		 * The accessibility checking engine object. It encapsulates all the logic related
		 * to fetching issues.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.Engine} engine
		 */

		/**
		 * An object dedicated for all modifications of the editable, see
		 * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator}.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.EditableDecorator} editableDecorator
		 */
		this.editableDecorator = new EditableDecorator( this.editor );

		/**
		 * An object managing the user interface.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.ui.Ui} ui
		 */
		this.ui = new Ui( this );

		/**
		 * An object managing the order of focusing the issues when resuming or starting
		 * the checking process.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @type {CKEDITOR.plugins.a11ychecker.PreferredIssueFinder}
		 */
		this.preferredIssueFinder = new PreferredIssueFinder();

		if ( editor ) {
			this.viewerController = new ViewerController( this, {
				title: editor.lang.a11ychecker.balloonLabel
			} );

			this.attachEditorListeners( editor );

			this.hotkeyManager = new HotkeyManager( this );
		}
	}

	/**
	 * Enumerates controller modes, used in {@link #setMode}.
	 *
	 *		console.log( CKEDITOR.plugins.a11ychecker.Controller.modes.LISTENING );
	 *		// Logs the following number: 2
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @static
	 * @readonly
	 */
	Controller.modes = {
		CHECKING: 1,
		LISTENING: 2,
		BUSY: 3
	};

	Controller.prototype = {
		/**
		 * Contains all issues identified by Accessibility Checker.
		 *
		 * @property {CKEDITOR.plugins.a11ychecker.IssueList} issues
		 */
		issues: null,
		/**
		 * An object encapsulating the balloon operations.
		 *
		 * @property {CKEDITOR.plugins.a11ychecker.ViewerController} viewerController
		 */
		viewerController: null,
		/**
		 * A property indicating whether Accessibility Checker is enabled.
		 *
		 * @property {Boolean} enabled
		 * @readonly
		 */
		enabled: false,
		/**
		 * If set to `true`, it prevents the editor from stripping out
		 * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator.ID_ATTRIBUTE_NAME_FULL}
		 * attributes from the element.
		 *
		 * This is desired when generating output for scratchpad.
		 */
		disableFilterStrip: false
	};

	Controller.prototype.constructor = Controller;

	/**
	 * Sets the accessibility checking egnine.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Engine} engine
	 */
	Controller.prototype.setEngine = function( engine ) {
		this.engine = engine;
	};

	/**
	 * Performs an accessibility test against the current editor content.
	 *
	 * This is the main method executed on Accessibility Checker (toolbar) icon click.
	 *
	 * It toggles the state of Accessibility Checker. If Accessibility Checker is disabled,
	 * it will be enabled and will perform content checking. If Accessibility Checker
	 *  has already been enabled, this method will close it.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Function} callback Callback to be called when the function is executed.
	 */
	Controller.prototype.exec = function( callback ) {
		if ( this.enabled ) {
			this.close();
			return;
		}

		if ( this.issues ) {
			this.issues.clear();
		}

		this.enable();

		// Do content checking.
		this.check( {
			ui: true,
			callback: callback
		} );
	};

	/**
	 * Puts Accessibility Checker in listening mode.
	 *
	 * This method is not executed when Accessibility Checker is disabled.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */
	Controller.prototype.listen = function() {
		// AC must be enabled in order to go to listening mode.
		if ( !this.enabled ) {
			return;
		}

		var modes = Controller.modes;
		if ( this.modeType === modes.LISTENING ) {
			this.check();
		} else {
			// When we are switching to listening mode, we want to be sure that the element
			// will be selected.
			var curIssueElement = this.issues.getFocused() && this.issues.getFocused().element;
			this.setMode( modes.LISTENING );
			if ( curIssueElement ) {
				this.editor.getSelection().selectElement( curIssueElement );
			}
		}
	};


	/**
	 * This method will force content checking. It is considered to be an internal method.
	 * If you want to simply trigger Accessibility Checker, consider using {@link #exec}.
	 *
	 * By default it is not showing the user interface.
	 *
	 * This method automatically sets the Controller mode to `BUSY` or `CHECKING`.
	 *
	 * Accessibility Checker does not need to have {@link #enabled} set to `true` in order
	 * to execute this function.
	 *
	 * Note: Depending on checking engine used, results might be asynchronous.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} [options]
	 * @param {Boolean} [options.ui] A poperty telling if the UI should be shown.
	 * @param {Function} [options.callback] A function to be called after the checking process is finished.
	 * It gets two arguments:
	 *
	 * * `Boolean` &ndash; Stating if the content is valid.
	 * * `IssueList` &ndash; An object containing found issues.
	 */
	Controller.prototype.check = function( options ) {

		options = options || {};

		var that = this,
			editor = that.editor,
			scratchpad;

		// Set busy state, so end-user will have "loading" feedback.
		this.setMode( Controller.modes.BUSY );

		if ( options.ui ) {
			// UI must be visible.
			this.ui.show();
		}

		// Get the element where we will save tmp output.
		scratchpad = this.getTempOutput();

		// Editable decorator will assign unique id to each element, so they can be
		// identified even after serialization (output to HTML).
		this.editableDecorator.applyMarkup();

		this.editableDecorator.decorateScratchpad( scratchpad );

		this.disableFilterStrip = true;
		scratchpad.setHtml( editor.getData() );
		this.disableFilterStrip = false;

		// Scratchpad needs to be appended to the document, in fact, the ideal situation would
		// be positioning it as close to the editable, as possible - so it gets its styling (#8).
		CKEDITOR.document.getBody().append( scratchpad );

		// Specify a callback when engine has doon its job. When it's done lets assign the issue list,
		// and refresh the UI.
		var completeCallback = function( issueList ) {
			that._engineProcessed.call( that, issueList, options );
		};

		this.engine.process( this, scratchpad, completeCallback );
	};

	/**
	 * Disables Accessibility Checker.
	 */
	Controller.prototype.disable = function() {
		if ( this.enabled ) {
			this.enabled = false;
			this.fire( 'disabled' );
		}
	};

	/**
	 * Enables Accessibility Checker.
	 */
	Controller.prototype.enable = function() {
		if ( !this.enabled ) {
			this.enabled = true;
			this.fire( 'enabled' );

			this.setMode( Controller.modes.CHECKING );
		}
	};

	/**
	 * Moves the focus to the next issue and shows the balloon panel.
	 *
	 * @param {Function} callback Function to be called when the next issue is focused.
	 */
	Controller.prototype.next = function( callback ) {
		var issues = this.issues,
			curFocusedIssue;

		if ( issues.count() === 0 ) {
			// No issues are available.
			return;
		}

		curFocusedIssue = this.issues.next();

		// Issue list is updated, now we can trigger viewerController to the UI element.
		this.viewerController.showIssue( curFocusedIssue, {
			event: 'next',
			callback: callback
		} );
	};

	/**
	 * Moves the focus to the previous issue and shows the balloon panel.
	 *
	 * @param {Function} callback Function to be called when the previous issue is focused.
	 */
	Controller.prototype.prev = function( callback ) {
		var issues = this.issues,
			curFocusedIssue;

		if ( issues.count() === 0 ) {
			// No issues are available.
			return;
		}

		curFocusedIssue = this.issues.prev();

		this.viewerController.showIssue( curFocusedIssue, {
			event: 'prev',
			callback: callback
		} );
	};

	/**
	 * Focuses Accessibility Checker on a given issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.Issue/Number} Issue object or 0-based index in
	 * the {@link CKEDITOR.plugins.a11ychecker.IssueList}.
	 * @param {Function} callback A function to be called when the issue is focused.
	 * @returns {Boolean} Returns `false` if the given issue was not found, `true` otherwise.
	 */
	Controller.prototype.showIssue = function( issue, callback ) {
		var issues = this.issues,
			// Issue index in the issue list.
			issueIndex = issue,
			// We need to use wrapped callback to make sure that proper focus will be set
			// for balloon (#26).
			wrappedCallback = function() {
				this.viewer.navigation.parts.next.focus();

				if ( callback ) {
					callback.call( this );
				}
			},
			// Issue object instacne, assigned once index is knwon.
			issueObject,
			ret;

		if ( typeof issueIndex != 'number' ) {
			issueIndex = issues.indexOf( issueIndex );
		}

		issueObject = issues.getItem( issueIndex );

		// In case when desired issue is already focused.
		if ( issueObject && issueObject == issues.getFocused() ) {
			// Normally callback would be called with ViewerController context,
			// so we need to keep it consistent.
			wrappedCallback.call( this.viewerController );
			return true;
		}

		ret = issues.moveTo( issueIndex );

		if ( ret && this.viewerController ) {
			this.viewerController.showIssue( issues.getItem( issueIndex ), {
				callback: wrappedCallback
			} );
		}

		return ret;
	};

	/**
	 * Shows the issue given its element (in the editable).
	 *
	 * This function basically uses {@link #showIssue}, but accepts DOM element as a
	 * parameter.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.dom.element} element The element causing the issue. Stored in
	 * {@Link CKEDITOR.plugins.a11ychecker.Issue#element}.
	 * @param {Function} callback A function to be called when the issue is focused.
	 * @returns {Boolean} Returns `false` if the given issue was not found, `true` otherwise.
	 */
	Controller.prototype.showIssueByElement = function( element, callback ) {
		var issue = this.issues.getIssueByElement( element );

		if ( issue ) {
			return this.showIssue( issue, callback );
		} else {
			return false;
		}
	};

	/**
	 * Toggles focused issue ignore state for the currently focused issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */
	Controller.prototype.ignoreIssue = function() {
		var issue  = this.issues.getFocused();

		if ( !issue ) {
			return;
		}

		issue.setIgnored( !issue.isIgnored() );
		// Refresh issue element classes.
		this.editableDecorator.markIssueElement( issue, this.issues );
	};

	/**
	 * Closes Accessibility Checker, hiding the UI and resetting internal
	 * data.
	 */
	Controller.prototype.close = function() {
		if ( !this.enabled ) {
			return;
		}

		this.ui.hide();

		this.disable();

		this.issues.clear();

		this.preferredIssueFinder.unset();

		this.mode.close();

		// Closing AC should result with removing mode object.
		// Otherwise next time we set it in eg. BUSY mode it will call
		// "old" mode.close method.
		this.mode = null;
		this.modeType = null;
	};

	/**
	 * Sets the controller mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Number} mode Mode constant based on {@link CKEDITOR.plugins.a11ychecker.Controller#modes}.
	 */
	Controller.prototype.setMode = function( mode ) {
		var modeConstructors = {},
			ModeConstructor;

		modeConstructors[ Controller.modes.CHECKING ] = CheckingMode;
		modeConstructors[ Controller.modes.LISTENING ] = ListeningMode;
		modeConstructors[ Controller.modes.BUSY ] = BusyMode;

		ModeConstructor = modeConstructors[ mode ];

		if ( !ModeConstructor ) {
			throw new Error( 'Invalid mode value, use Controller.modes members' );
		}

		if ( mode === this.modeType ) {
			// Same mode, no need to process anything.
			return;
		}

		if ( this.mode ) {
			// Old mode should be closed before new one will be inited.
			this.mode.close();
		}

		this.mode = new ModeConstructor( this );
		this.mode.init();
		this.modeType = mode;
	};

	/**
	 * Attaches editor-specific event listeners.
	 *
	 * @param {CKEDITOR.editor} editor
	 */
	Controller.prototype.attachEditorListeners = function( editor ) {
		// Before mode change we want to remove all the a11ychecker markup, hide
		// the whole UI and reset the state.
		var that = this,
			// Commands that are not going to set AC to listening mode, on
			// beforeCommandExec. It even sounds to me like a candidate for a
			// configurable array.
			handledCommands = [
				'a11ychecker',
				'a11ychecker.listen',
				'a11ychecker.next',
				'a11ychecker.prev',
				'a11ychecker.close',
				'wysiwyg',
				'source'
			];

		editor.on( 'beforeSetMode', function() {
			that.close();
		} );

		editor.on( 'beforeCommandExec', function( evt ) {
			// This listener should have fairly low proprity, because one might
			// cancel it for whatever reason.
			var evtName = String( evt.data.name );

			if ( CKEDITOR.tools.indexOf( handledCommands, evtName ) === -1 && that.enabled ) {
				that.setMode( Controller.modes.LISTENING );
			}
		}, null, null, 9999 );
	};

	/**
	 * Applies the given Quick Fix and fires the {@link #fixed} event.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} quickFix
	 * @param {Object} formAttributes An object containing serialized form inputs. See
	 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
	 */
	Controller.prototype.applyQuickFix = function( quickFix, formAttributes ) {
		// We need to make sure that undo manager is unlocked, because most likely
		// it's locked by the CHECKING mode.
		this._withUndoManager( function() {
			var mode = this.mode,
				editor = this.editor;

			// Make sure that no markup is in editable.
			this.editableDecorator.removeMarkup();
			// Selecting issue element.
			quickFix.markSelection( editor, editor.getSelection() );
			if ( mode.unsetStoredSelection ) {
				mode.unsetStoredSelection();
			}
			// We're preferring update, so if only selection changed, the last snapshot
			// will be overriden.
			this.editor.fire( 'updateSnapshot' );
		} );

		// And now apply the QuickFix.
		quickFix.fix( formAttributes, CKEDITOR.tools.bind( this._onQuickFix, this ) );
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} quickFix
	 * @private
	 */
	Controller.prototype._onQuickFix = function( quickFix ) {
		// Adter a QuickFix next snapshot is fired, this time we want to save new one.
		this._withUndoManager( function() {
			this.editor.fire( 'saveSnapshot' );
		} );

		var event = {
				quickFix: quickFix,
				issue: quickFix.issue
			},
			eventResult = this.fire( 'fixed', event, this.editor );

		if ( eventResult !== false ) {
			this.check( {
				ui: true
			} );
		}
	};

	/**
	 * A setter method for issue list.
	 *
	 * It will automatically sort the list and bind necessary event listeners.
	 *
	 * @private
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList
	 */
	Controller.prototype._setIssueList = function( issueList ) {
		var that = this;
		// Sort the issues so they will keep their DOM order.
		issueList.sort();

		issueList.on( 'focusChanged', function( evt ) {
			var currentIssue = evt.data.current;
			if ( currentIssue ) {
				that.preferredIssueFinder.set( currentIssue );
			}
		} );

		that.issues = issueList;
	};

	/**
	 * A method to be called when no issues are detected during the checking. It is supposed
	 * to show information that content is validated positively.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */
	Controller.prototype.onNoIssues = function() {
		alert( this.editor.lang.a11ychecker.noIssuesMessage );
		this.close();
	};

	/**
	 * Returns a detached element, for the editor content.
	 *
	 * It acts as a scratchpad to temporarily copy the editor content, and run validation
	 * against that copy.
	 *
	 * @returns {CKEDITOR.dom.element}
	 */
	Controller.prototype.getTempOutput = function() {
		var protectedSpace = this._;
		if ( !protectedSpace.scratchpad ) {
			protectedSpace.scratchpad = CKEDITOR.document.createElement( 'div' );
			protectedSpace.scratchpad.setStyle( 'display', 'none' );
		}

		return protectedSpace.scratchpad;
	};

	/**
	 * Returns the preferred Quick Fix language.
	 *
	 * @returns {String} Returns a language code used for Quick Fixes.
	 */
	Controller.prototype.getQuickFixLang = function() {
		var editor = this.editor,
			config = editor.config,
			availLangs = editor.plugins.a11ychecker.quickFixesLang.split( ',' );

		return Localization.getPreferredLanguage( config.language, config.defaultLanguage, availLangs ) || availLangs[ 0 ];
	};

	/**
	 * A method to be called when the engine has processed the scratchpad. The engine should
	 * pass the `issueList` parameter.
	 *
	 * @private
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList A complete list of issues found
	 * in the scratchpad.
	 * @param {Object} options Options passed to {@link #check}.
	 */
	Controller.prototype._engineProcessed = function( issueList, options ) {
		var that = this,
			checkedEvent,
			focusIssueOffset;
		// We need to determine Issue.element properties in each Issue.
		that.editableDecorator.resolveEditorElements( issueList );

		// Set new issue list.
		that._setIssueList( issueList );

		that.setMode( Controller.modes.CHECKING );

		if ( options.ui ) {
			// Notify the UI about update.
			that.ui.update();
		}

		// Trigger the checked event. If it's canceled then we should not focus first issue by ourself.
		checkedEvent = that.fire( 'checked', {
			issues: issueList
		} );

		if ( options.callback ) {
			options.callback.call( that, issueList.count( true ) === true, issueList );
		}

		if ( checkedEvent !== false ) {
			if ( issueList.count() ) {
				focusIssueOffset = that.preferredIssueFinder.getFromListIndex( issueList ) || 0;
				// In case when we have any issue, we should move to the next one.
				if ( focusIssueOffset >= issueList.count() ) {
					// Ensure that focusIssueOffset is not bigger than actual size.
					// If it is, we'll start from the begining.
					focusIssueOffset = 0;
				}
				that.showIssue( issueList.getItem( focusIssueOffset ) );
			} else {
				// In case when there's no issue lets inform that content is OK.
				that.onNoIssues();
			}
		}
	};

	/**
	 * Executes `callback` synchronously, making sure that undo manager is unlocked.
	 *
	 * The callback is called in the Controller instance context.
	 *
	 * @private
	 * @param {Function} callback A function to be called when undo is unlocked.
	 */
	Controller.prototype._withUndoManager = function( callback ) {
		var editor = this.editor,
			locked = !!editor.undoManager.locked;

		if ( locked ) {
			editor.fire( 'unlockSnapshot' );
		}

		callback.call( this );

		if ( locked ) {
			// If it was locked before, lock it once again.
			editor.fire( 'lockSnapshot', { dontUpdate: true } );
		}
	};


	CKEDITOR.event.implementOn( Controller.prototype );

	/**
	 * Event fired when Accessibility Checker was disabled.
	 *
	 * @event disabled
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */

	/**
	 * Event fired when Accessibility Checker was enabled.
	 *
	 * Note that at this point {@link #issues} list is still not updated, or not
	 * even initialized.
	 *
	 * @event enabled
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */

	/**
	 * Event fired when content checking is done. At this point Accessibility Checker
	 * contains the full list of issues.
	 *
	 * This event can be canceled. In this case the default Accessibility Checker action will not
	 * be performed, that is:
	 * * Highlighting accessibility issue in case there is any.
	 * * Calling the {@link #onNoIssues} method when no issues are found.
	 *
	 * @event checked
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} data.issues Issues found in the document.
	 * This is exactly the same object as in the {@link #issues} property.
	 */

	/**
	 * Event fired when a single issue was solved using a Quick Fix (either automatic or manual).
	 *
	 * Right after this event Accessibility Checker will reload its content, and recheck
	 * the content.
	 *
	 * This event might be canceled. In this case Accessibility Checker will not perform
	 * content recheck.
	 *
	 * @event fixed
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} data.issue Issue object.
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} data.quickFix Applied Quick Fix object.
	 */

	return Controller;
} );
