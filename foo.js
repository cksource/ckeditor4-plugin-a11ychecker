//jscs:disable
/* jshint ignore:start */
/**
 * @todo Describe the file.
 */

var acNamespace = CKEDITOR.plugins.a11ychecker,
	Engine = acNamespace.Engine,
	IssueList = acNamespace.IssueList,
	Issue = acNamespace.Issue,
	IssueDetails = acNamespace.IssueDetails,
	Quail,
	EngineQuailConfig;

// EngineQuailConfig class can still be loaded with RequireJS as it does not have any deps.
require( [ 'EngineQuailConfig' ], function( _EngineQuailConfig ) {
	EngineQuailConfig = _EngineQuailConfig;
} );

(function() {
	// We'll load custom Quail only if it's not already registered.
	if ( $.fn.quail ) {
		return;
	}
/*@include libs/quail/quail.jquery.min.js */
}());

Quail = $.fn.quail;

/*@include ../../EngineQuail.js */

callback( EngineQuail );
/* jshint ignore:end */