/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview This is a localization file for QuickFixes.
 *
 * Note that this is a source of localization, and it specifies language for all the QuickFix classes.
 * In build process content of this file will be inlined to proper lang/<code>/<quickFixClassName>.js
 * files.
 */

( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( 'en', {
		AddTableCaption: {
			captionLabel: 'Caption',
			errorEmpty: 'Caption text can not be empty'
		},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Alternative text',
			errorTooLong: 'Alternative text is too long. It should be up to {limit} characters while your has {length}',
			errorWhitespace: 'Alternative text can not only contain whitespace characters',
			errorSameAsFileName: 'Image alt should not be the same as the file name'
		},
		ImgAltNonEmpty: {
			altLabel: 'Alternative text',
			errorTooLong: 'Alternative text is too long. It should be up to {limit} characters while your has {length}',
			errorWhitespace: 'Alternative text can not only contain whitespace characters',
			errorSameAsFileName: 'Image alt should not be the same as the file name',
			errorEmpty: 'Alternative text can not be empty'
		},
		QuickFix: {},
		ParagraphToHeader: {
			levelLabel: 'Header level',
			suggested: '(Suggested)'
		},
		Repository: {},
		TableHeaders: {
			positionLabel: 'Position',
			positionHorizontally: 'Horizontally',
			positionVertically: 'Vertically',
			positionBoth: 'Both'
		}
	} );
} )();
