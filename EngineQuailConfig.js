/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

define( function() {
	'use strict';

	function EngineQuailConfig() {
	}

	EngineQuailConfig.prototype = {
		guideline: [
			'aAdjacentWithSameResourceShouldBeCombined',
			'aImgAltNotRepetitive',
			'aLinksAreSeparatedByPrintableCharacters',
			'aMustNotHaveJavascriptHref',
			'aSuspiciousLinkText',
			'blockquoteNotUsedForIndentation',
			'documentVisualListsAreMarkedUp',
			'headerH1',
			'headerH2',
			'headerH3',
			'headerH4',
			'imgAltIsDifferent',
			'imgAltIsTooLong',
			'imgAltNotEmptyInAnchor',
			'imgAltTextNotRedundant',
			'imgHasAlt',
			'imgShouldNotHaveTitle',
			'pNotUsedAsHeader',
			'tableDataShouldHaveTh',
			'imgWithEmptyAlt'
		]
	};

	// This module should return a default config for EngineQuail. It's exported to a separate module, so that it can
	// be replaced in building time.
	return EngineQuailConfig;
} );
