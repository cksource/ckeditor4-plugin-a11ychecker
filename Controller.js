
define( [ 'EditableDecorator', 'ui/Ui' ], function( EditableDecorator, Ui ) {
	'use strict';

	/**
	 * Exposes Accessibility Checker interface.
	 *
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
	}

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
		viewerController: null
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
		var editor = this.editor,
			that = this,
			scratchpad;

		if ( this.issues ) {
			this.issues.clear();
		}

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
			// We need to determine Issue.element properties in each Issue.
			that.editableDecorator.resolveEditorElements( issueList );
			that.editableDecorator.markIssues( issueList );

			console.log( 'checking done' );
			console.log( issueList );

			that.issues = issueList;
			// Notify the UI about update.
			that.ui.update();
		};

		this.engine.process( this, scratchpad, completeCallback );
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
	 * @returns {Boolean} returns `false` if given issue was not found, `true` otherwise.1
	 */
	Controller.prototype.showIssue = function( issue, callback ) {
		var issues = this.issues,
			ret;

		if ( typeof issue != 'number' ) {
			issue = issues.indexOf( issue );
		}

		ret = issues.moveTo( issue );

		if ( ret && this.viewerController ) {
			this.viewerController.showIssue( issues.getItem( issue ), {
				callback: callback
			} );
		}

		return ret;
	};


	/**
	 * Closes the Accessibility Checker, hiding all the UI, reseting internal
	 * data.
	 */
	Controller.prototype.close = function() {
		this.issues.clear();

		// Remove all the DOM changes applied by the EditableDecorator.
		this.editableDecorator.removeMarkup();

		this.ui.hide();
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

	return Controller;
} );
