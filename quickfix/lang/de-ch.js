/**
 * @license Copyright (c) 2014-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/license
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

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( 'de-ch', {
		AddTableCaption: {
			captionLabel: 'Beschriftung',
			errorEmpty: 'Beschriftungen dürfen nicht leer sein'
		},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Alternativtext',
			errorTooLong: 'Der Alternativtext ist zu lang. Er sollte {limit} Zeichen lang sein, ist aber aktuell {length} Zeichen lang',
			errorWhitespace: 'Der Alternativtext kann nicht nur Leerzeichen enthalten',
			errorSameAsFileName: 'Der Alternativtext sollte nicht dem Dateinamen entsprechen'
		},
		ImgAltNonEmpty: {
			altLabel: 'Alternativtext',
			errorTooLong: 'Der Alternativtext ist zu lang. Er sollte {limit} Zeichen lang sein, ist aber aktuell {length} Zeichen lang',
			errorWhitespace: 'Der Alternativtext kann nicht nur Leerzeichen enthalten',
			errorSameAsFileName: 'Der Alternativtext sollte nicht dem Dateinamen entsprechen',
			errorEmpty: 'Der Alternativtext sollte nicht leer sein'
		},
		QuickFix: {},
		ParagraphToHeader: {
			levelLabel: 'Überschriftenebene',
			suggested: '(Vorschlag)'
		},
		Repository: {},
		TableHeaders: {
			positionLabel: 'Position',
			positionHorizontally: 'Horizontal',
			positionVertically: 'Vertikal',
			positionBoth: 'Beide'
		}
	} );
} )();
