/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define( function() {
	'use strict';

	/**
	 * Helper type used for language localization related operations.
	 *
	 * @since 4.6.0
	 * @static
	 * @class CKEDITOR.plugins.a11ychecker.Localization
	 */
	function Localization() {
	}

	/**
	 * Returns a preferred language code, based on list in `languages` parameter.
	 *
	 *
	 * Language values are picked in following order:
	 *
	 * * preferredLanguage
	 * * navigator language
	 * * defaultLanguage
	 * * `'en'` literal as a last proposition
	 *
	* @static
	* @member CKEDITOR.plugins.a11ychecker.Localization
	* @param {String} preferredLang Language to be preferrred over the browser language.
	* @param {String} defaultLanguage A fallback language, used when neither `preferredLang`
	* or browser language are not available.
	* @param {String[]} languages List of available languages.
	* @param {Navigator} [navigator] Optional navigator object, if not present will be picked
	* from the window object.
	* @returns {String/null} Language code, or `null` if not found. Note that returned value
	* is always lowercased.
	*/
	Localization.getPreferredLanguage = function( preferredLang, defaultLanguage, languages, navigator ) {
		navigator = navigator || window.navigator;

		var checkLangs = [ preferredLang, defaultLanguage, 'en' ],
			// RegExp used to split language locale.
			localeRegExp = /([a-z]+)(?:-([a-z]+))?/,
			navigatorLang = navigator.language || navigator.userLanguage,
			indexOf = CKEDITOR.tools.indexOf;

		if ( navigatorLang ) {
			// If navigatgor language is available insert it at 1 index,
			// after preferredLang.
			checkLangs.splice( 1, 0, navigatorLang );
		}

		// Iterating over all interesting possibilities.
		for ( var i = 0, len = checkLangs.length; i < len; i++ ) {
			if ( !checkLangs[ i ] ) {
				continue;
			}

			// Currently iterated language.
			var curLangCode = checkLangs[ i ].toLowerCase(),
				parts = curLangCode.match( localeRegExp ),
				lang = parts[ 1 ],
				locale = parts[ 2 ];

			if ( locale && indexOf( languages, curLangCode ) !== -1 ) {
				// First we want to see if lang in given locale is available.
				return curLangCode;
			} else if ( indexOf( languages, lang ) !== -1 ) {
				// Eventually lang without a locale might be available, which is OK too.
				return lang;
			}
		}

		return null;
	};

	return Localization;
} );
