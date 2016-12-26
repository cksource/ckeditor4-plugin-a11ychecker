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

	CKEDITOR.plugins.a11ychecker.quickFixes.lang( 'pt-br', {
		AddTableCaption: {
			captionLabel: 'Legenda da tabela',
			errorEmpty: 'O texto da legenda da tabela não pode estar vazio'
		},
		AnchorsMerge: {},
		AttributeRename: {},
		DateUnfold: {},
		ElementRemove: {},
		ImgAlt: {
			altLabel: 'Texto alternativo',
			errorTooLong: 'O texto alternativo é muito longo. Este deve conter no máximo {limit} caracteres, enquanto o seu possui {length}',
			errorWhitespace: 'O texto alternativo não pode conter somente espaços em branco.',
			errorSameAsFileName: 'O texto alternativo da imagem não deve ter o mesmo nome do arquivo da imagem'
		},
		ImgAltNonEmpty: {
			altLabel: 'Texto alternativo',
			errorTooLong: 'O texto alternativo é muito longo. Este deve conter no máximo {limit} caracteres, enquanto o seu possui {length}',
			errorWhitespace: 'O texto alternativo não pode conter somente espaços em branco.',
			errorSameAsFileName: 'O texto alternativo da imagem não deve ter o mesmo nome do arquivo da imagem',
			errorEmpty: 'O texto alternativo não deve estar vazio'
		},
		QuickFix: {},
		ParagraphToHeader: {
			levelLabel: 'Nível de cabeçalho',
			suggested: '(Sugerido)'
		},
		Repository: {},
		TableHeaders: {
			positionLabel: 'Posição',
			positionHorizontally: 'Horizontal',
			positionVertically: 'Vertical',
			positionBoth: 'Ambos'
		}
	} );
} )();
