
define( [
	'Controller/CheckingMode',
	'Controller/ListeningMode',
	'Controller/BusyMode',
	'EditableDecorator',
	'ui/Ui',
	'ui/ViewerController',
	'HotkeyManager'
], function(
	CheckingMode,
	ListeningMode,
	BusyMode,
	EditableDecorator,
	Ui,
	ViewerController,
	HotkeyManager
) {
	'use strict';

	/**
	 * Exposes Accessibility Checker interface.
	 *
	 * This type stores the issue list, and implements some high-level operations like
	 * going to next issue, focusing particular issue, closing Accessibility Checker etc.
	 * Most of these methods are directly used by CKEditor commands.
	 *
	 * Controller contains a reference (and manages) all the most important components
	 * like:
	 *
	 * * {@link CKEDITOR.plugins.a11ychecker.Engine}
	 * * {@link CKEDITOR.plugins.a11ychecker.IssueList}
	 * * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator}
	 * * {@link CKEDITOR.plugins.a11ychecker.ViewerController}
	 * * {@link CKEDITOR.plugins.a11ychecker.HotkeyManager}
	 *
	 * Controller works in one of multiple modes. Currently we have following modes:
	 *
	 * * Checking
	 * * Listening
	 * * Busy
	 *
	 * States are changed by calling {@link #setState} method with a property listed
	 * in {@link CKEDITOR.plugins.a11ychecker.Controller#modes} enumeration.
	 *
	 * @since 4.5
	 * @mixins CKEDITOR.event
	 * @class CKEDITOR.plugins.a11ychecker.Controller
	 * @constructor
	 * @param {CKEDITOR.editor} editor
	 */
	function Controller( editor ) {
		this._ = {};
		/**
		 * Editor owning this Accessibility Checker instance.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @type {CKEDITOR.editor}
		 */
		this.editor = editor;

		/**
		 * An accessibility checking engine object. It encapsulates all the logic related
		 * to fetching issues.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.Engine} engine
		 */

		/**
		 * Object dedicated for all the editable modification, see
		 * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator}.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.EditableDecorator} editableDecorator
		 */
		this.editableDecorator = new EditableDecorator( this.editor );

		/**
		 * Object managing the user interface.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Controller
		 * @property {CKEDITOR.plugins.a11ychecker.ui.Ui} ui
		 */
		this.ui = new Ui( this );

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
	 *		// Logs following number: 2
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
		 * Contains all the issues identified by the Accessibility Checker.
		 *
		 * @property {CKEDITOR.plugins.a11ychecker.IssueList} issues
		 */
		issues: null,
		/**
		 * Object encapsulating the balloon operations.
		 *
		 * @property {CKEDITOR.plugins.a11ychecker.ViewerController} viewerController
		 */
		viewerController: null,
		/**
		 * An property indicating whether or not Accessibility Checker is enabled.
		 *
		 * @property {Boolean} enabled
		 * @readonly
		 */
		enabled: false,
		/**
		 * If set to true it prevent editor from stripping out
		 * {@link CKEDITOR.plugins.a11ychecker.EditableDecorator.ID_ATTRIBUTE_NAME_FULL}
		 * attributes from element.
		 *
		 * This is desired when generating an output for scratchpad.
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
	 * Performs an accessibility test against current editor content.
	 *
	 * A main method executed on Accessibility Checker (toolbar) icon click.
	 *
	 * It toggles the state of Accessibility Checker, if it's disabled then Accessibility
	 * Checker will be enabled, and perform content checking. In case of Accessibility
	 * Checker being already enabled, it will close it.
	 */
	Controller.prototype.exec = function() {
		if ( this.enabled ) {
			this.close();
			return;
		}

		if ( this.issues ) {
			this.issues.clear();
		}

		this.enable();

		// Do content checking.
		this.check();
	};

	/**
	 * This method will force content checking. It's considered to be an internal method
	 * if you want to simply trigger Accessibility Checker consider using {@link #exec}.
	 *
	 * Automatically sets the Controller mode to `BUSY` / `CHECKING`.
	 *
	 * Note: depending on used engine results might be asynchronous.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Number} focusIssueOffset Offset of the issue to be focused after checking
	 * is done. If element with given offset doesn't exist, the first one will be focused.
	 */
	Controller.prototype.check = function( focusIssueOffset ) {
		var that = this,
			editor = that.editor,
			scratchpad;

		// Set busy state, so end-user will have "loading" feedback.
		this.setMode( Controller.modes.BUSY );

		// UI must be visible.
		this.ui.show();

		// Get the element where we will save tmp output.
		scratchpad = this.getTempOutput();

		// Editable decorator will assign unique id to each element, so they can be
		// identified even after serialization (output to HTML).
		this.editableDecorator.applyMarkup();

		this.disableFilterStrip = true;
		scratchpad.setHtml( editor.getData() );
		this.disableFilterStrip = false;

		// Scratchpad needs to be appended to the document, in fact, the ideal situation would
		// be positioning it as close to the editable, as possible - so it gets its styling (#8).
		CKEDITOR.document.getBody().append( scratchpad );

		// Specify a callback when engine has doon its job. When it's done lets assign the issue list,
		// and refresh the UI.
		var completeCallback = function( issueList ) {
			that._engineProcessed.call( that, issueList, focusIssueOffset );
		};

		this.engine.process( this, scratchpad, completeCallback );
	};

	/**
	 * Disables the Accessibility Checker.
	 */
	Controller.prototype.disable = function() {
		if ( this.enabled ) {
			this.enabled = false;
			this.fire( 'disabled' );
		}
	};

	/**
	 * Enables the Accessibility Checker.
	 */
	Controller.prototype.enable = function() {
		if ( !this.enabled ) {
			this.enabled = true;
			this.fire( 'enabled' );

			this.setMode( Controller.modes.CHECKING );
		}
	};

	/**
	 * Moves the focus to the next issue, and shows the balloon.
	 *
	 * @param {Function} callback Function to be called when next issue is focused.
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
	 * Moves the focus to the previous issue, and shows the balloon.
	 *
	 * @param {Function} callback Function to be called when previous issue is focused.
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
	 * Focuses Accessibility Checker on given issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.Issue/Number} Issue object or 0-based index in
	 * the {@link CKEDITOR.plugins.a11ychecker.IssueList}.
	 * @param {Function} callback Function to be called when issue is focused.
	 * @returns {Boolean} returns `false` if given issue was not found, `true` otherwise.
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
	 * Shows the issue given its element (in editable).
	 *
	 * This function basically uses {@link #showIssue} but accepts DOM element as a
	 * parameter.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.dom.element} element Element causing the issue. Stored in
	 * {@Link CKEDITOR.plugins.a11ychecker.Issue#element}.
	 * @param {Function} callback Function to be called when issue is focused.
	 * @returns {Boolean} returns `false` if given issue was not found, `true` otherwise.
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
	 * Toggles focused issue ignore state for currently focused issue.
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
	 * Closes the Accessibility Checker, hiding all the UI, reseting internal
	 * data.
	 */
	Controller.prototype.close = function() {
		if ( !this.enabled ) {
			return;
		}

		this.disable();

		this.issues.clear();

		this.ui.hide();

		this.mode.close();
	};

	/**
	 * Sets controller mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Number} mode Mode constant, based on {@link CKEDITOR.plugins.a11ychecker.Controller#modes}.
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
	 * Attaches editor specific listeners.
	 *
	 * @param {CKEDITOR.editor} editor
	 */
	Controller.prototype.attachEditorListeners = function( editor ) {
		// Before mode change we want to remove all the a11ychecker markup, hide
		// whole ui and reset the state.
		var that = this,
			// Commands that's not going to set AC to listening mode, on
			// beforeCommandExec. It even sounds to me like a candidate for a
			// configurable array.
			handledCommands = [
				'a11ychecker',
				'a11ychecker.next',
				'a11ychecker.prev',
				'a11ychecker.close',
				'wysiwyg',
				'source'
			];

		editor.on( 'beforeSetMode', function() {
			that.close();
		} );
		// We want to close the Accessibility Checker when the editor blurs.
		editor.on( 'blur', function() {
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
	 * Applies given quickfix, fires the {@link #fixed} event.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} quickFix
	 * @param {Object} formAttributes Object containing serialized form inputs. See
	 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
	 */
	Controller.prototype.applyQuickFix = function( quickFix, formAttributes ) {
		quickFix.fix( formAttributes, CKEDITOR.tools.bind( this._onQuickFix, this ) );
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} quickFix
	 * @private
	 */
	Controller.prototype._onQuickFix = function( quickFix ) {
		var event = {
				quickFix: quickFix,
				issue: quickFix.issue
			},
			eventResult = this.fire( 'fixed', event, this.editor ),
			// Offset of fixed issue.
			issueOffset = this.issues.indexOf( quickFix.issue );

		if ( eventResult !== false ) {
			this.check( issueOffset );
		}
	};


	/**
	 * Method to be called when no issues are deteted during the checking. It's supposed
	 * to show an information that content is validated positively.
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
	 * It acts as a scratchpad to temporarily copy editor contents, and run validation
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
	 * Method to be called when the Engine has processed the scratchpad. Engine should
	 * pass the `issueList` parameter.
	 *
	 * @private
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList Complete list of issues found
	 * in the scratchpad.
	 */
	Controller.prototype._engineProcessed = function( issueList, focusIssueOffset ) {
		var editor = this.editor,
			checkedEvent;

		focusIssueOffset = focusIssueOffset || 0;

		// We need to determine Issue.element properties in each Issue.
		this.editableDecorator.resolveEditorElements( issueList );

		// Sort the issues so they will keep their DOM order.
		issueList.sort();

		this.issues = issueList;

		this.setMode( Controller.modes.CHECKING );

		// Notify the UI about update.
		this.ui.update();

		// Trigger the checked event. If it's canceled then we should not focus first issue by ourself.
		checkedEvent = this.fire( 'checked', {
			issues: issueList
		} );

		if ( checkedEvent !== false ) {
			if ( issueList.count() ) {
				// In case when we have any issue, we should move to the next one.
				if ( focusIssueOffset >= issueList.count() ) {
					// Ensure this focusIssueOffset is not bigger than actual size.
					// If it is, we'll start from the begining.
					focusIssueOffset = 0;
				}
				this.showIssue( issueList.getItem( focusIssueOffset ) );
			} else {
				// In case when there's no issue lets inform this content is OK.
				this.onNoIssues();
			}
		}
	};

	CKEDITOR.event.implementOn( Controller.prototype );

	/**
	 * Fired when Accessibility Checker was disabled.
	 *
	 * @event disabled
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */

	/**
	 * Fired when Accessibility Checker was enabled.
	 *
	 * Note that at this point {@link #issues} list still is not updated, or not
	 * even initialized.
	 *
	 * @event enabled
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 */

	/**
	 * Fired when content checking is done. At this point Accessibility Checker
	 * contains full list of issues.
	 *
	 * This event can be canceled, in this case default Accessibility Checker action won't be
	 * performed, that is:
	 * * Highlighting accessibility issue in case there is any.
	 * * Calling {@link #onNoIssues} method when no issues are found.
	 *
	 * @event checked
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} data.issues Issues found in the document.
	 * This is exactly the same object as in {@link #issues} property.
	 */

	/**
	 * Fired when a single issue was solved using a QuickFix (either automatic or manual).
	 *
	 * Right after this event Accessibility Checker will reload its content, and recheck
	 * the content.
	 *
	 * This event might be canceled, in this case Accessibility Checker will not perform
	 * content recheck.
	 *
	 * @event fixed
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} data.issue Issue object.
	 * @param {CKEDITOR.plugins.a11ychecker.quickFix.QuickFix} data.quickFix Applied QuickFix object.
	 */

	return Controller;
} );
