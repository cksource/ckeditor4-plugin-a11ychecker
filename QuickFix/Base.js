
(function() {
	'use strict';

	/**
	 * Base type for the QuickFix objects.
	 *
	 * # Overview
	 *
	 * It encapsulates logic responsible for fixing Accessibility issue.
	 *
	 * Fixes can have following types:
	 * * **automatical** - Fully automatic, doesn't require any input from the end user.
	 * * **manual** - Requires some input from end-user. Information from user are gathered
	 * through form being displayed to the end user.
	 *
	 * You can check type of the issue by checking the {@link #auto} property.
	 *
	 * ## Working with QuickFix objects
	 *
	 * ### Adding controls to the QuickFix form
	 *
	 * Controls can be added in {@link #display} method using {@link CKEDITOR.plugins.a11ychecker.ViwerForm}
	 * methods.
	 *
	 * ### Executing the fix
	 *
	 * The fixing logic is placed in {@link #fix} method, so you need to simply call it when
	 * you're sure to apply the fix.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickfix
	 * @class Base
	 * @constructor
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue QuickFix is created for.
	 */
	function Base( issue ) {
		this.issue = issue;
	}

	Base.prototype = {
		/**
		 * @member CKEDITOR.plugins.a11ychecker.quickfix.Base
		 * @property {Boolean} auto Indicates if QuickFix is fully automatic, or if
		 * it needs a human input.
		 */
		auto: true,
		/**
		 * @member CKEDITOR.plugins.a11ychecker.quickfix.Base
		 * @property {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object that QuickFix was created for.
		 */
		issue: null,

		/**
		 * @todo: Remove these temp title / descr literals.
		 */
		title: 'Generic Quickfix title',

		descr: 'This Quickfix will not do anything amazing, its only a base type'
	};

	Base.prototype.constructor = Base;

	Base.prototype.display = function( form ) {
	};

	/**
	 * @param {Object} formAttributes Object containing serialized form inputs. See
	 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
	 * @param {Function} callback Function to be called when a fix was applied. Gets QuickFix object
	 * as a first parameter.
	 */
	Base.prototype.fix = function( formAttributes, callback ) {
		if ( callback ) {
			callback( this );
		}
	};

	/**
	 * Method used to valide data placed in form.
	 *
	 * @param {Object} formAttributes Object containing serialized form inputs. See
	 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
	 * @returns {String[]} Array of error messages. If array is empty, then it means no errors occured.
	 */
	Base.prototype.validate = function( formAttributes ) {
		return [];
	};

	CKEDITOR.plugins.a11ychecker.quickFixes.add( 'Base', Base );
}());