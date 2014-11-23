/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
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

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( {
		AddTableCaption: {
			captionLabel: 'Captiono',
			errorEmpty: 'El captiono nuo empty'
		},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Alternativno text e puta',
			errorTooLong: 'Uno too longe alte {limit} cerveza {length}.',
			errorWhitespace: 'Uno charactero needeto',
			errorEmpty: 'Non empto alternative texto'
		},
		QuickFix: {},
		Repository: {}
	} );
} )();
