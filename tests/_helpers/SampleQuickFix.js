/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
