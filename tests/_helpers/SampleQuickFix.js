/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 */
(function() {
	'use strict';
	/**
	 * @constructor
	 */
	function SampleQuickFix() {}

	SampleQuickFix.prototype = {};
	SampleQuickFix.prototype.constructor = SampleQuickFix;

	SampleQuickFix.prototype.foo = function() {
		return 'bar';
	};

	CKEDITOR.plugins.a11ychecker.quickFixRepo.add( 'SampleQuickFix', SampleQuickFix );
}());