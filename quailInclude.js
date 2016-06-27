/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
//jscs:disable
/* jshint ignore:start */

/**
 * @fileOverview This file contains a code that will be inlined to plugin.js in partucilar place when
 * building AC distro.
 *
 * The reason for such approach is that AMDClean was automatically hoisting all the AMD types to the
 * beginning of the file, and executing them. Therefore Quail would... require jQuery! No matter if
 * it's overriden by any custom plugin or not.
 *
 * So with this file Quail is simply inlined inside the plugin.js file (still I'd say that we might
 * actually load it async at runtime, it would keep the file smaller).
 */

/* @exclude */
define( [
	'window',
	'callback',
	'EngineQuail'
], function( window, callback, EngineQuail ) {
/* @endexclude */
	function quailInclude() {
		var acNamespace = CKEDITOR.plugins.a11ychecker,
			Engine = acNamespace.Engine,
			IssueList = acNamespace.IssueList,
			Issue = acNamespace.Issue,
			IssueDetails = acNamespace.IssueDetails,
			Quail,
			EngineQuailConfig,
			$ = window.jQuery || window.$;

		// EngineQuailConfig class can still be loaded with RequireJS as it does not have any deps.
		require( [ 'EngineQuailConfig' ], function( _EngineQuailConfig ) {
			EngineQuailConfig = _EngineQuailConfig;
		} );


		if ( !$ || !$.fn ) {
			throw new Error( 'Missing jQuery. Accessibility Checker\'s default engine, Quail.js requires jQuery ' +
				'to work correctly.' );
		}

		// We'll load custom Quail only if it's not already registered.
		if ( $.fn.quail ) {
			includeEngineQuailAndContinue();
			return;
		}

		var quailPath = 'plugins/a11ychecker/libs/quail/quail.jquery.min.js' || CKEDITOR.config.a11ychecker_quailPath;

		CKEDITOR.scriptLoader.load( [ quailPath ], function( completed ) {

			if ( completed.length ) {
				includeEngineQuailAndContinue();
			} else {
				throw new Error( 'Could not load Quail' );
			}
		} );

		function includeEngineQuailAndContinue() {
			Quail = $.fn.quail;

			/*@include ../../EngineQuail.js */

			callback( EngineQuail );
		}
	}

	quailInclude();
/* @exclude */
	return quailInclude;
} );
/* @endexclude */

/* jshint ignore:end */
