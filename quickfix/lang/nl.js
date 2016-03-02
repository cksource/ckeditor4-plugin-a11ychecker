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

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( 'nl', {
		AddTableCaption: {
			captionLabel: 'Caption',
			errorEmpty: 'Caption (bijschtift) tekst mag niet leeg zijn'
		},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Alternatieve tekst',
			errorTooLong: 'Alternatieve tekst is te lang. Deze mag maximaal {limit} karakters' +
				'bevatten terwijl opgegeven tekst {length} bevat',
			errorWhitespace: 'Alternatieve tekst mag niet alleen uit spaties bestaan',
			errorSameAsFileName: 'Alt-tekst van de afbeelding mag niet hetzelfde zijn als de bestandsnaam'
		},
		ImgAltNonEmpty: {
			altLabel: 'Alternatieve tekst',
			errorTooLong: 'Alternatieve tekst is te lang. Deze mag maximaal {limit} karakters' +
				'bevatten terwijl opgegeven tekst {length} bevat',
			errorWhitespace: 'Alternatieve tekst mag niet alleen uit spaties bestaan',
			errorSameAsFileName: 'Alt-tekst van de afbeelding mag niet hetzelfde zijn als de bestandsnaam',
			errorEmpty: 'Alternatieve tekst mag niet leeg zijn'
		},
		QuickFix: {},
		ParagraphToHeader: {
			levelLabel: 'Header niveau',
			suggested: '(Suggestie)'
		},
		Repository: {}
	} );
} )();
