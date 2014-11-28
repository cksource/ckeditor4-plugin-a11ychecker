// We'll place config here to keep things DRY.
(function() {
	var appBaseDir = '/apps/ckeditor/plugins/a11ychecker/',
		testBaseDir = '/plugins/a11ychecker/tests/';

	require.config( {
		baseUrl: appBaseDir,
		paths: {
			mock: testBaseDir + '_helpers/mockup',
			helpers: testBaseDir + '_helpers',
			jquery: appBaseDir + 'libs/jquery.min',
			mocking: testBaseDir + '_helpers/mocking',
			'Quail': appBaseDir + 'libs/quail/quail.jquery.min',
			// Alias for Quail2.2.1.
			'Quail2.2.1': appBaseDir + 'bower_components/quail/dist/quail.jquery'
		}
	} );
}());