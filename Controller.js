
define( [ 'Controller/CheckingMode', 'Controller/ListeningMode', 'Controller/BusyMode', 'EditableDecorator', 'ui/Ui', 'ui/ViewerController', 'HotkeyManager' ], function( CheckingMode, ListeningMode, BusyMode, EditableDecorator, Ui, ViewerController, HotkeyManager ) {
	'use strict';

	/**
	 * Exposes Accessibility Checker interface.
	 *
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
				title: 'Accessibility checker'
			} );

			this.attachEditorListeners( editor );

			this.hotkeyManager = new HotkeyManager( this );
		}
	}

	/**
	 * Enumerates controller modes, used in {@link #setMode}.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.Controller
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
		 * @property {CKEDITOR.plugins.a11ychecker.ViewerController} viewerController
		 */
		viewerController: null,
		/**
		 * An property indicating whether or not Accessibility Checker is enabled.
		 *
		 * @property {Boolean} enabled
		 * @readonly
		 */
		enabled: false
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
	 */
	Controller.prototype.exec = function() {

		if ( this.enabled ) {
			this.close();
			return;
		}

		var editor = this.editor,
			that = this,
			scratchpad;

		if ( this.issues ) {
			this.issues.clear();
		}

		this.enable();

		// Do content checking.
		this.check();
	};

	/**
	 * Dispatches accessiblity check function. Noe that results might be asynchronous.
	 *
	 * Automatically sets the Controller mode to `BUSY` / `CHECKING`.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Number} focusIssueOffset Offset of the issue to be focused after checking
	 * is done. If element with given offset doesn't exist, the first one will be focused.
	 */
	Controller.prototype.check = function( focusIssueOffset ) {
		var that = this,
			editor = that.editor,
			scratchpad;

		focusIssueOffset = focusIssueOffset || 0;

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

		/**
		 * @todo: Do we really need to append this to the document?
		 */
		CKEDITOR.document.getBody().append( scratchpad );

		// When the engine has done its job, lets assign the issue list, and refresh
		// UI.
		var completeCallback = function( issueList ) {
			var checkedEvent;

			// We need to determine Issue.element properties in each Issue.
			that.editableDecorator.resolveEditorElements( issueList );

			// Sort the issues so they will keep their DOM order.
			issueList.sort();

			console.log( 'checking done', issueList );

			that.issues = issueList;

			that.setMode( Controller.modes.CHECKING );

			// Notify the UI about update.
			that.ui.update();

			checkedEvent = that.fire( 'checked', {
				issues: issueList
			} );

			if ( checkedEvent !== false ) {
				if ( issueList.count() ) {
					// In case when we have any issue, we should move to the next one.
					if ( focusIssueOffset >= issueList.count() ) {
						// Ensure that focusIssueOffset is not bigger than actual size.
						// If it is, we'll start from the begining.
						focusIssueOffset = 0;
					}
					that.showIssue( issueList.getItem( focusIssueOffset ) );
				} else {
					that.onNoIssues();
				}
			}
		};

		this.engine.process( this, scratchpad, completeCallback );
	};


	Controller.prototype.disable = function() {
		if ( this.enabled ) {
			this.enabled = false;
			this.fire( 'disabled' );
		}
	};

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
			console.log( 'no issues :(' );
			return;
		}

		curFocusedIssue = this.issues.next();

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
			console.log( 'no issues :(' );
			return;
		}

		curFocusedIssue = this.issues.prev();

		this.viewerController.showIssue( curFocusedIssue, {
			event: 'prev',
			callback: callback
		} );
	};

	/**
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
	 * Toggles focused issue ignore state.
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
			targetConstructor;

		modeConstructors[ Controller.modes.CHECKING ] = CheckingMode;
		modeConstructors[ Controller.modes.LISTENING ] = ListeningMode;
		modeConstructors[ Controller.modes.BUSY ] = BusyMode;

		targetConstructor = modeConstructors[ mode ];

		if ( !targetConstructor ) {
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

		this.mode = new targetConstructor( this );
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
		var that = this;
		editor.on( 'beforeSetMode', function() {
			that.close();
		} );
	};

	/**
	 * Applies given quickfix, fires the {@link #fixed} event.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.QuickFix} quickFix
	 * @param {Object} formAttributes Object containing serialized form inputs. See
	 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
	 */
	Controller.prototype.applyQuickFix = function( quickFix, formAttributes ) {
		quickFix.fix( formAttributes, CKEDITOR.tools.bind( this._onQuickFix, this ) );
	};

	/**
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {CKEDITOR.plugins.a11ychecker.QuickFix} quickFix
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
		alert( 'Document does not contain Accessibility Issues! Good job!' );
		this.close();
	};

	/**
	 * Returns a detached element, containing the content.
	 *
	 * It acts as a scratchpad to temporarily output editor contents, and run validation
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
	 * @event checked
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {Object} data.issues Issues found in the document. This is exactly the same
	 * object as in {@link #issues} property.
	 */

	/**
	 * Fired when a single issue was solved using a QuickFix (either automatic or manual).
	 *
	 * Right after this event Accessibility Checker will reload its content, and recheck
	 * the content.
	 *
	 * @event fixed
	 * @member CKEDITOR.plugins.a11ychecker.Controller
	 * @param {Object} data
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} data.issue Issue object.
	 * @param {CKEDITOR.plugins.a11ychecker.QuickFix} data.quickFix Applied QuickFix object.
	 */

	return Controller;
} );
