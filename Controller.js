
define( [ 'EditableDecorator' ], function( EditableDecorator ) {
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
		 */
		//this.engine = null;

		this.editableDecorator = new EditableDecorator( this.editor );
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

	Controller.prototype.engine = {
		/**
		 * Performs accessibility checking for the current editor content.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.Engine
		 * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
		 * @param {CKEDITOR.dom.element} contentElement DOM object of container which contents will be checked.
		 * @param {Function} callback
		 *
		 * @todo: Still contains Quail implementation, in next steps we need to make it
		 * engine independent.
		 * @todo: Should be moved to separate class like Engine
		 */
		process: function( a11ychecker, contentElement, callback ) {

			var $ = window.jQuery,
				editor = a11ychecker.editor;

			// Calls quail.
			var quailConfig = {
				guideline : [ 'imgHasAlt', 'aMustNotHaveJavascriptHref', 'aAdjacentWithSameResourceShouldBeCombined', 'pNotUsedAsHeader' ],
				//guideline : 'wcag',
				jsonPath : editor._.a11ychecker.basePath + 'dist',
				// Causes total.results to be new in each call.
				reset: true,
				complete: function( total ) {
					var results = total.results,
						errors = [];

					editor._.a11ychecker.issues.setQuailIssues( results );

					execUiUpdate( editor, total, results );

					// Looking for unknown issue types.
					var knownTypes = CKEDITOR.plugins.a11ychecker,
						curTestObject;

					for ( var issueType in results ) {

						if ( !knownTypes.types[ issueType ] ) {
							curTestObject = results[ issueType ].test;

							knownTypes.types[ issueType ] = {
								title: curTestObject.title.en,
								desc: curTestObject.description.en,
								testability: curTestObject.testability
							};
						}
					}

					// Now we can iterate over all found issues, and mark them with specific class.
					editor._.a11ychecker.issues.each( function( element, issueGroup ) {
						element.addClass( 'cke_a11ychecker_error' );

						errors.push( {
							element: element,
							type: issueGroup
						} );
					} );
				}
			};

			$( contentElement.$ ).quail( quailConfig );
		}
	};

	/**
	 * Sets the accessibility checking egnine.
	 * @param {Object} engine
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

		CKEDITOR.plugins.a11ychecker.clearResults( editor );

		// UI must be visible.
		editor._.a11ychecker.ui.show();

		// Get the element where we will save tmp output.
		scratchpad = this.getTempOutput();

		// Editable decorator will assign unique id to each element, so they can be
		// identified even after serialization (output to HTML).
		this.editableDecorator.applyMarkup();

		editor._.a11ychecker.disableFilterStrip = true;
		scratchpad.setHtml( editor.getData() );
		editor._.a11ychecker.disableFilterStrip = false;

		/**
		 * @todo: Do we really need to append this to the document?
		 */
		CKEDITOR.document.getBody().append( scratchpad );

		// When engine has done its job, lets assign the issue list, and refresh
		// UI.
		var completeCallback = function( issueList ) {

			// We need to determine Issue.element.
			that.editableDecorator.resolveEditorElements( issueList );
			that.editableDecorator.markIssues( issueList );

			console.log( 'checking done' );
			console.log( issueList );

			that.issues = issueList;
			editor._.a11ychecker.issues = issueList;

			/**
			 * @todo: this is a temp fix:
			 */
			issueList.on( 'focusChanged', function( evt ) {
				var ui = editor._.a11ychecker.ui,
					evtData = evt.data;

				if ( evtData.current ) {
					ui.markFocus( evtData.current.element );
				}
				if ( evtData.previous ) {
					ui.unmarkFocus( evtData.previous.element );
				}
			} );
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
		var namespace = this.editor._.a11ychecker;

		this.issues.clear();

		// Remove all the DOM changes applied by the EditableDecorator.
		this.editableDecorator.removeMarkup();

		namespace.ui.hide();
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

	/**
	 * Returns human friendly representation of given element.
	 * @param {jQuery} el jQuery wrapped element
	 * @return {String}
	 */
	function humanReadableElement( el ) {
		el = new CKEDITOR.dom.element( el[0] );
		if ( el.getName() == 'a' ) {
			if ( el.getText() )
				return 'a: ' + el.getText();
			else
				return 'a[name="' + el.getAttribute( 'name' ) + '"]';
		}
	}

	/**
	 * @param {Object} results Object returned by Quail as total.results
	 * @returns {Array}
	 */
	function toGroupedOptions( results ) {
		var ret = [];

		for ( var i in results ) {
			var curResult = results[ i ];

			if ( !curResult.elements.length )
				continue;

			var obj = {
				name: i,
				options: {
				}
			};

			for (var j=0; j < curResult.elements.length; j++) {
				var innerText = humanReadableElement( curResult.elements[ j ] ) || 'Issue #' + (j + 1);
				obj.options[ j ] = innerText;
			}

			ret.push( obj );
		}

		return ret;
	}

	function execUiUpdate( editor, total, results ) {
		var ui = editor._.a11ychecker.ui;

		ui.issues.setOptionsGrouped( toGroupedOptions( total.results ) );
		ui.update();
	}

	return Controller;
} );
