(function() {
	/**
	 * @constructor
	 */
	function SampleQuickFix() {}

	SampleQuickFix.prototype = {};
	SampleQuickFix.prototype.constructor = SampleQuickFix;

	SampleQuickFix.prototype.foo = function() {
		return 'bar';
	};

	CKEDITOR.plugins.a11ychecker.quickFixRepo.register( 'SampleQuickFix', SampleQuickFix );
}());