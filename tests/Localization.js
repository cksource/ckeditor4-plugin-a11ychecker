/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */

( function() {
	'use strict';

	bender.require( [ 'Localization' ], function( Localization ) {
		bender.test( {
			'test Localization.getPreferredLanguage preffered lang': function() {
				// Preffered lang should be returned.
				var navigator = {
						language: 'de'
					},
					ret = Localization.getPreferredLanguage( 'fo-ba', 'bo-mb', [ 'fo', 'en-us', 'fo-ba', 'en-gb' ], navigator );

				assert.areSame( 'fo-ba', ret, 'Return value' );
			},

			'test Localization.getPreferredLanguage preffered lang no locale': function() {
				// Preffered lang should be returned, but without locale.
				var navigator = {
						language: 'de'
					},
					ret = Localization.getPreferredLanguage( 'fo-ba', 'bo-mb', [ 'en-us', 'en-gb', 'fo' ], navigator );

				assert.areSame( 'fo', ret, 'Return value' );
			},

			'test Localization.getPreferredLanguage invalid': function() {
				// If no language is matched, null should be returned.
				var navigator = {
						language: 'de'
					},
					ret = Localization.getPreferredLanguage( 'fo-ba', 'bo-mb', [ 'en-us', 'en-gb' ], navigator );

				assert.isNull( ret, 'Return value' );
			},

			'test Localization.getPreferredLanguage navigator': function() {
				// Navigator lang has higher priority than default lang.
				var navigator = {
						language: 'de'
					},
					ret = Localization.getPreferredLanguage( 'fo', 'bo', [ 'en-us', 'de', 'bo' ], navigator );

				assert.areSame( 'de', ret, 'Return value' );
			},

			'test Localization.getPreferredLanguage navigator.userLanguage': function() {
				// Ensure that also userLanguage proprerty is considered.
				var navigator = {
						userLanguage: 'fr'
					},
					ret = Localization.getPreferredLanguage( 'fo', 'bo', [ 'en-us', 'fr', 'bo' ], navigator );

				assert.areSame( 'fr', ret, 'Return value' );
			},

			'test Localization.getPreferredLanguage empty lang': function() {
				// It might happen that preferred language is not given.
				var navigator = {
						userLanguage: 'fr'
					},
					ret = Localization.getPreferredLanguage( '', 'bo', [ 'en-us', 'fr', 'bo' ], navigator );

				assert.areSame( 'fr', ret, 'Return value' );
			}
		} );
	} );
} )();
