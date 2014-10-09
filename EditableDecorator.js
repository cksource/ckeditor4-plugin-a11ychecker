
define( function() {
	'use strict';

	/**
	 * Encapsulates all the logic related to modification of issued elements within the
	 * {@link CKEDITOR.editable}.
	 *
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
	 * Attribute name used to mark elements, so A11y Checker can keep track of them, even after
	 * to HTML serialization.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME = 'quail-id';

	/**
	 * Fully qualified attribute name, including data prefix.
	 *
	 * @static
	 * @member CKEDITOR.plugins.a11ychecker.EditableDecorator
	 */
	EditableDecorator.ID_ATTRIBUTE_NAME_FULL = 'data-quail-id';

	/**
	 * @returns {CKEDITOR.editable/null} Returns associated editors `editable` element, or `null` if
	 * editable is not available.
	 */
	EditableDecorator.prototype.editable = function() {
		return this.editor.editable();
	};

	/**
	 * Adds a HTML class to each issue element, indicating that element is causing a11y problems.
	 *
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} list
	 */
	EditableDecorator.prototype.markIssues = function( list ) {
		var len = list.count(),
			issue,
			i;

		for ( i = 0; i < len; i++ ) {
			issue = list.getItem( i );

			issue.element.addClass( 'cke_a11ychecker_error' );
		}
	};

	/**
	 * Adds listeners to the {@link CKEDITOR.editor} instance.
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
					if ( !editor._.a11ychecker.disableFilterStrip )
						delete element.attributes[ EditableDecorator.ID_ATTRIBUTE_NAME_FULL ];

					return element;
				}
			}
		} );
	};

	/**
	 * Adds an extra markuyp to elements inside the editable.
	 *
	 * We're adding `data-quail-id` attribute so we can identify nodes in (string HTML) output,
	 * and vice versa.
	 */
	EditableDecorator.prototype.applyMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects,
			lastId = 1;

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
	 * Cleans the editable from all extra markup applied by the EditableDecorator.
	 */
	EditableDecorator.prototype.removeMarkup = function() {
		var editable = this.editable(),
			editorHasFakeobjectPlugin = !!this.editor.plugins.fakeobjects;

		// Removes all Accessibility Checker attributes from the editable element.
		editable.forEach( function( element ) {
			/**
			 * @todo: Why the hell do we check for removeAttribute here?
			 * Since it's an element it **must** contain removeAttribute.
			 */
			if ( element.removeAttribute ) {
				element.removeAttribute( EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}

			if ( editorHasFakeobjectPlugin && isFakeElement( element ) ) {
				removeFakeObjectAttribute( element, EditableDecorator.ID_ATTRIBUTE_NAME_FULL );
			}

			if ( element.hasClass( 'cke_a11ychecker_error' ) ) {
				element.removeClass( 'cke_a11ychecker_error' );
				// Remove also cke_a11y_focused class.
				element.removeClass( 'cke_a11y_focused' );
			}
		}, CKEDITOR.NODE_ELEMENT, false );
	};

	/**
	 * A listener attached to the {@link CKEDITOR.editable}.
	 *
	 * @param {Object} evt Click event object.
	 */
	EditableDecorator.prototype.clickListener = function( evt ) {
		var target = evt.data.getTarget(),
			a11ychecker = this.editor._.a11ychecker;

		if ( !target.hasClass( 'cke_a11ychecker_error' ) ) {
			// If the clicked node itself isn't marked as a11y error, we'll look for closest
			// parent.
			var parents = target.getParents( true ),
				i;

			target = null;

			for ( i = 0; i < parents.length; i++ ) {
				if ( parents[ i ].hasClass( 'cke_a11ychecker_error' ) ) {
					target = parents[ i ];
					break;
				}
			}
		}

		if ( target ) {
			if ( target.hasClass( 'cke_a11y_focused' ) ) {
				// If clicked issue is already focused, then it means that user wants
				// to edit it.
				a11ychecker.setMode( 2 );
			} else {
				// Otherwise user clicked standard Accessibility issue.
				a11ychecker.showIssueByElement( target, function() {
					// Put the focus on next button. (#10)
					this.viewer.navigation.parts.next.focus();
				} );
				a11ychecker.setMode( 1 ); // REMOVE ME! :((((
			}
		} else if ( a11ychecker.enabled ) {
			// User clicked area without issue.
			// Listening mode...
			a11ychecker.setMode( 2 );
		}
	};

	/**
	 * Takes the {@link CKEDITOR.plugins.a11ychecker.IssueList} object, finds
	 * {@link CKEDITOR.plugins.a11ychecker.Issue#element} for each `Issue` object.
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
			// Having this id we can simply fire a selector looking for matching element in editable.
			curIssue.element = editable.findOne( '*[' + EditableDecorator.ID_ATTRIBUTE_NAME_FULL + '="' + a11yId + '"]' );
		}
	};

	/**
	 * Checks if given element is a fake element.
	 *
	 * @param {CKEDITOR.dom.element} element
	 * @returns {Boolean}
	 */
	function isFakeElement( element ) {
		return element.data( 'cke-real-node-type' ) !== null;
	}

	/**
	 * @todo: It would be perfect to refactor this function later on.
	 * Secondly: this function might reuse removeFakeObjectAttribute instead of doing it on its own.
	 *
	 * Adds an attribute to a fake object.
	 * @param	{CKEDITOR.dom.element}	element		Dom element of fakeobject.
	 * @param	{String}	attrName	Attribute name.
	 * @param	{Mixed}	attrValue	New value.
	 */
	function updateFakeobjectsAttribute( element, attrName, attrValue ) {
		attrValue = String( attrValue );

		// Note that we want to make sure that previous value is removed.
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			initialValue = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' ),
			newVal = initialValue.replace( /^(<\w+\s)/, '$1' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '" ' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	function removeFakeObjectAttribute( element, attrName ) {
		var replRegexp = new RegExp( '(\\s+' + attrName + '="\\d+")' ,'g' ),
			newVal = decodeURIComponent( element.data('cke-realelement') ).replace( replRegexp, '' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	return EditableDecorator;
} );