
define( function() {
	'use strict';

	function EngineQuailConfig() {
	}

	EngineQuailConfig.prototype = {
		guideline: [
			'imgHasAlt',
			'aMustNotHaveJavascriptHref',
			'aAdjacentWithSameResourceShouldBeCombined',
			'imgNonDecorativeHasAlt',
			'imgImportantNoSpacerAlt',
			'KINGUseLongDateFormat',
			'aTitleDescribesDestination',
			'blockquoteNotUsedForIndentation',
			'imgAltNotEmptyInAnchor',
			'tableUsesCaption',
			'imgShouldNotHaveTitle',
			'imgAltIsTooLong',
			'pNotUsedAsHeader'
		]
	};

	// This module should return a default config for EngineQuail. It's exported to a separate module, so that it can
	// be replaced in building time.
	return EngineQuailConfig;
} );