
/**
 * @fileOverview This is a localization file for QuickFixes.
 *
 * Note that this is a source of localization, and it specifies language for all the QuickFix classes.
 * In build process content of this file will be inlined to proper lang/<code>/<quickFixClassName>.js
 * files.
 */

( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( {
		AddTableCaption: {},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Alternative text',
			errorTooLong: 'Alternative text is too long. It should be up to {limit} characters while your has {length}.',
			errorWhitespace: 'Alternative text can not only contain whitespace characters',
			errorEmpty: 'Alternative text can not be empty'
		},
		QuickFix: {},
		Repository: {}
	} );
} )();
