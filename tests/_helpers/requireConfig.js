// We'll place config here to keep things DRY.
(function() {
	var appBaseDir = '/apps/ckeditor/plugins/a11ychecker/',
		testBaseDir = '/tests/plugins/a11ychecker/';

	require.config( {
		baseUrl: appBaseDir,
		paths: {
			mock: testBaseDir + '_helpers/mockup',
			helpers: testBaseDir + '_helpers',
			jquery: appBaseDir + 'libs/jquery.min',
			mocking: testBaseDir + '_helpers/mocking',
			'Quail': appBaseDir + 'libs/quail/2.2.8/quail.jquery.min',
			// Alias for Quail2.2.1.
			'Quail2.2.1': appBaseDir + 'bower_components/quail/dist/quail.jquery'
		},
		shim: {
			'Quail2.2.1': {
				deps: [ 'jquery' ],
				init: function( that ) {
					return that.fn.quail;
				}
			},
			'Quail': {
				deps: [ 'jquery' ]
			}
		}
	} );
}());