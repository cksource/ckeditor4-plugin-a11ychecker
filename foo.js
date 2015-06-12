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

/*@include {quailPath} */

Quail = $.fn.quail;

/*@include ../EngineQuail.js */

callback( EngineQuail );