/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * Encapsulates all the logic related to modification of issued elements within the
	 * {@link CKEDITOR.editable}.
	 *
	 * @since 4.6.0
	 * @class CKEDITOR.plugins.a11ychecker.EditableDecorator
	 * @constructor
	 * @param {CKEDITOR.editor} editor
	 */
	function EditableDecorator( editor ) {
		this.editor = editor;

		if ( editor ) {
			this.addListeners();
		}
	}

	EditableDecorator.prototype = {};
	EditableDecorator.prototype.constructor = EditableDecorator;

	/**
	 * An enumeration for CSS classes being applied to the issue
	 * {CKEDITOR.plugins.a11ychecker.Issue#element}.
	 *
	 * Keys should be values used as {CKEDITOR.plugins.a11ychecker.Issue#testability}.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 * @enum
	 */
	EditableDecorator.prototype.testabilityClasses = {
		0: 'cke_a11yc_notice',
		0.5: 'cke_a11yc_warning',
		1: 'cke_a11yc_error'
	};

	/**
	 * The attribute name used to mark elements to make it possible for Accessibility Checker to
	 * keep track of them, even after the HTML serialization.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME = 'quail-id';

	/**
	 * A fully qualified attribute name, including the data prefix.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME_FULL = 'data-quail-id';

	/**
	 * The initial value of attribute {@link #ID_ATTRIBUTE_NAME_FULL}.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.INITIAL_ID_VALUE = 1;

	/**
	 * @returns {CKEDITOR.editable/null} Returns associated editor `editable` element, or `null` if
	 * the editable is not available.
	 */
	EditableDecorator.prototype.editable = function() {
		return this.editor.editable();
	};

	/**
	 * Adds an HTML class to each issue element, indicating that the element is causing accessibility problems.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} list
	 */
	EditableDecorator.prototype.markIssues = function( list ) {
		var len = list.count(),
			issue,
			i;

		for ( i = 0; i < len; i++ ) {
			issue = list.getItem( i );

			this.markIssueElement( issue, list );
		}
	};

	/**
	 * Adds event listeners to the {@link CKEDITOR.editor} instance.
	 */
	EditableDecorator.prototype.addListeners = function() {
		var editor = this.editor,
			editable = editor.editable(),
			that = this,
			boundListener = CKEDITOR.tools.bind( that.clickListener, that );

		// We presume that editable is already up and running. If it would not, we'd
		// need to use editor#contentDom event.
		if ( !editable ) {
			throw new Error( 'Editable not available' );
		}

		// Detects a single clicks to on elements marked as accessibility errors. Moves
		// focus to issue associated with given element.
		// This one might be called synhronously, since addListeners() requires editable be ready.
		editable.attachListener( editable, 'click', boundListener );

		editor.on( 'contentDom', function() {
			// This is actually other object than the editable used in outer scope.
			var newEditable = editor.editable();
			newEditable.attachListener( newEditable, 'click', boundListener );
		} );

		// Add transformation rule, that will make sure that no data-quail-id attributes
		// are given to output.
		editor.dataProcessor.htmlFilter.addRules( {
			elements: {
				$: function( element ) {
					if ( !editor._.a11ychecker.disableFilterStrip ) {
						delete element.attributes[ EditableDecorator.ID_ATTRIBUTE_NAME_FULL ];
					}

					if ( editor.config.a11ychecker_noIgnoreData ) {
						// If data-a11y-ignore attr is not desired, remove it.
						delete element.attributes[ 'data-a11y-ignore' ];
					}

					return element;
				}
			}
		} );
	};

	/**
	 * Adds extra markup to elements inside the editable.
	 *
	 * The `data-quail-id` attribute is added to make it possible to identify nodes in (string HTML) output,
	 * and vice versa.
	 */
	EditableDecorator.prototype.applyMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects,
			lastId = EditableDecorator.INITIAL_ID_VALUE;

		// Note: id 1 will be assigned to editable itself, which is fine.
		editable.forEach( function( element ) {
			// Assign lastId incremented by one.
			element.data( EditableDecorator.ID_ATTRIBUTE_NAME, lastId );

			// We also need to apply this attribute to fake elements.
			// Note: we're skipping this step in case of missing fakeobject plugin,
			// because there's really no reason to do that.
			if ( editorHasFakeobjectPlugin && isFakeElement( element ) ) {
				updateFakeobjectsAttribute( element, EditableDecorator.ID_ATTRIBUTE_NAME_FULL, lastId );
			}

			// Prepare id for next iteration.
			lastId += 1;

			return true;
		}, CKEDITOR.NODE_ELEMENT, false );
	};

	/**
	 * Since the scratchpad is created by the Controller, we need a way to apply the first identifier to the scratchpad.
	 * Otherwise it would not have an ID.
	 */
	EditableDecorator.prototype.decorateScratchpad = function( scratchpad ) {
		scratchpad.data( EditableDecorator.ID_ATTRIBUTE_NAME, EditableDecorator.INITIAL_ID_VALUE );
	};

	/**
	 * Cleans the editable from all extra markup applied by the EditableDecorator.
	 */
	EditableDecorator.prototype.removeMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects,
			unmarkIssueElement = this.unmarkIssueElement;

		// Removes all Accessibility Checker attributes from the editable element.
		editable.forEach( function( element ) {
			/**
			 * @todo: Why do we need to check for removeAttribute here?
			 * Since it's an element it **must** contain removeAttribute.
			 */
			if ( element.removeAttribute ) {
				element.removeAttribute( EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}

			if ( editorHasFakeobjectPlugin && isFakeElement( element ) ) {
				removeFakeObjectAttribute( element, EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}

			if ( element.hasClass( 'cke_a11yc_issue' ) ) {
				unmarkIssueElement( element );
			}
		}, CKEDITOR.NODE_ELEMENT, false );
	};

	/**
	 * An event listener attached to the {@link CKEDITOR.editable}.
	 *
	 * @param {Object} evt Click event object.
	 */
	EditableDecorator.prototype.clickListener = function( evt ) {
		var target = evt.data.getTarget(),
			a11ychecker = this.editor._.a11ychecker;

		if ( !target.hasClass( 'cke_a11yc_issue' ) ) {
			// If the clicked node itself isn't marked as a11y error, we'll look for closest
			// parent.
			var parents = target.getParents( true ),
				i;

			target = null;

			for ( i = 0; i < parents.length; i++ ) {
				if ( parents[ i ].hasClass( 'cke_a11yc_issue' ) ) {
					target = parents[ i ];
					break;
				}
			}
		}

		// Note: If clicked issue is already focused, then it means that user wants
		// to edit it (switch to LISTENING mode).
		// Magic numbers remark: until we won't export modes enum (Controller.modes) to
		// a separate module, we won't be able to use it here, because it would cause circular
		// dependency.
		if ( target && !target.hasClass( 'cke_a11yc_focused' ) ) {
			// User clicked a standard Accessibility issue.
			a11ychecker.showIssueByElement( target, function() {
				// Put the focus on next button. (#10)
				this.viewer.navigation.parts.next.focus();
			} );
			a11ychecker.setMode( 1 );
		} else if ( a11ychecker.enabled ) {
			if ( a11ychecker.mode.unsetStoredSelection ) {
				// Part of Chrome workaround for #39.
				a11ychecker.mode.unsetStoredSelection();
			}

			// User clicked area without issue.
			// Listening mode...
			a11ychecker.setMode( 2 );
		}
	};

	/**
	 * Takes the {@link CKEDITOR.plugins.a11ychecker.IssueList} object and finds
	 * an {@link CKEDITOR.plugins.a11ychecker.Issue#element} for each `Issue` object.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} list
	 */
	EditableDecorator.prototype.resolveEditorElements = function( list ) {
		var editable = this.editable(),
			curIssue,
			a11yId,
			i,
			len;

		for ( i = 0, len = list.count(); i < len; i++ ) {
			curIssue = list.getItem( i );
			// originalElement (the one in sketchpad) holds the id attribute.
			a11yId = curIssue.originalElement.data( EditableDecorator.ID_ATTRIBUTE_NAME );

			if ( a11yId === String( EditableDecorator.INITIAL_ID_VALUE ) ) {
				// Special case: first id is reserved always for editable.
				curIssue.element = editable;
			} else {
				// Having this id we can simply fire a selector looking for matching element in editable.
				curIssue.element = editable.findOne( '*[' + EditableDecorator.ID_ATTRIBUTE_NAME_FULL + '="' + a11yId + '"]' );
			}
		}
	};

	/**
	 * Refreshes the ignored state of a given issue.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue An issue whose element has to be refreshed.
	 */
	EditableDecorator.prototype.markIgnoredIssue = function( issue ) {
		// Depending on issue.isIgnored() return value, either addClass or removeClass
		// will be assigned to this variable.
		issue.element.addClass( 'cke_a11yc_ignored' );
	};

	/**
	 * Applies formatting markup to the issue element.
	 *
	 * It automatically determines if the issue element should be marked as ignored
	 * or not.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} list
	 */
	EditableDecorator.prototype.markIssueElement = function( issue, list ) {
		var issueElement = issue.element,
			testability = issue.testability,
			// To be ignored, issue isIgnored() must return true AND there
			// can be no other non-ignored issue for this element.
			shouldBeIgnored = issue.isIgnored() &&
				!list.getIssuesByElement( issueElement, true ).length;

		if ( testability === undefined ) {
			testability = 1;
		}

		// All issues have a cke_a11yc_issue class, no matter if it's ignored.
		issueElement.addClass( 'cke_a11yc_issue' );

		if ( shouldBeIgnored ) {
			this.markIgnoredIssue( issue );
		} else {
			// When issue is not marked as an ignored issue we're going to add
			// testability mapping class.
			issueElement.addClass( this.testabilityClasses[ testability ] );
			issueElement.removeClass( 'cke_a11yc_ignored' );
		}
	};

	/**
	 * Removes the element formatting markup for the given issue.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.Issue/CKEDITOR.dom.element} issue An issue object or DOM
	 * element associated with an issue.
	 * @param {Boolean} skipCommonClass If `true`, the `cke_a11yc_issue` class will not be removed.
	 * All other classes like `cke_a11yc_error` and `cke_a11yc_ignored` are
	 * going to be removed.
	 */
	EditableDecorator.prototype.unmarkIssueElement = function( issue, skipCommonClass ) {
		var issueElement = issue.removeClass ? issue : issue.element;

		if ( !skipCommonClass ) {
			issueElement.removeClass( 'cke_a11yc_issue' );
		}

		issueElement.removeClass( 'cke_a11yc_error' )
			.removeClass( 'cke_a11yc_warning' )
			.removeClass( 'cke_a11yc_notice' )
			.removeClass( 'cke_a11yc_ignored' )
			.removeClass( 'cke_a11yc_focused' );
	};

	/**
	 * Checks if the given element is a fake element.
	 *
	 * @param {CKEDITOR.dom.element} element
	 * @returns {Boolean}
	 */
	function isFakeElement( element ) {
		return element.data( 'cke-real-node-type' ) !== null;
	}

	/**
	 * @todo: It would be perfect to refactor this function later on.
	 * Secondly: This function might reuse `removeFakeObjectAttribute` instead of doing it on its own.
	 *
	 * Adds an attribute to a fake object.
	 * @param	{CKEDITOR.dom.element}	element		The DOM element of the fake object.
	 * @param	{String}	attrName	An attribute name.
	 * @param	{Mixed}	attrValue	The new value.
	 */
	function updateFakeobjectsAttribute( element, attrName, attrValue ) {
		attrValue = String( attrValue );

		// Note that we want to make sure that previous value is removed.
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			initialValue = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' ),
			newVal = initialValue.replace( /^(<\w+\s)/, '$1' + attrName +
				'="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '" ' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	function removeFakeObjectAttribute( element, attrName ) {
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			newVal = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	return EditableDecorator;
} );
