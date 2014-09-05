
define( function() {
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
		this.engine = null;
	}

	Controller.prototype = {
		next: function( editor ) {
		},
		prev: function( editor ) {
		}
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
			scratchpad;

		CKEDITOR.plugins.a11ychecker.clearResults( editor );

		// UI must be visible.
		editor._.a11ychecker.ui.show();

		// Get the element where we will save tmp output.
		scratchpad = this.getTempOutput();

		// Reassinging ids to each element.
		var lastId = 0;
		editor.editable().forEach( function( element ) {
			// Assign lastId incremented by one.
			element.data( 'quail-id', ++lastId );

			// Temp workaround for fakeobjects.
			if ( element.getName( 'a' ) && CKEDITOR.plugins.link.tryRestoreFakeAnchor( editor, element ) )
				updateFakeobjectsAttribute( element, 'data-quail-id', lastId );

			return true;
		}, CKEDITOR.NODE_ELEMENT, false );

		editor._.a11ychecker.disableFilterStrip = true;
		scratchpad.setHtml( editor.getData() );
		editor._.a11ychecker.disableFilterStrip = false;
		CKEDITOR.document.getBody().append( scratchpad );

		// When engine has done its job, lets assign the issue list, and refresh
		// UI.
		var completeCallback = function( issues ) {

		};

		this.engine.process( this, scratchpad, completeCallback );
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

	/**
	 * Adds an attribute to a fake object.
	 * @param	{CKEDITOR.dom.element}	element		Dom element of fakeobject.
	 * @param	{String}	attrName	Attribute name.
	 * @param	{Mixed}	attrValue	New value.
	 */
	function updateFakeobjectsAttribute( element, attrName, attrValue ) {
		attrValue = String( attrValue );

		// Note that we want to make sure that previous value is removed.
		var initialValue = decodeURIComponent( element.data('cke-realelement') ).replace( /(\s+data-quail-id="\d+")/g, '' ),
			//newVal = initialValue.replace( '<a', '<a ' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '"' );
			newVal = initialValue.replace( /^(<\w+\s)/, '$1' + attrName + '="' +  CKEDITOR.tools.htmlEncodeAttr( attrValue ) + '"' );

		element.data( 'cke-realelement', encodeURIComponent( newVal ) );
	}

	return Controller;
} );
