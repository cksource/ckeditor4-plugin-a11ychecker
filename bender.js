/* jshint browser: false, node: true */

'use strict';

var appBaseDir = '/apps/ckeditor/plugins/a11ychecker/',
	testBaseDir = '/plugins/a11ychecker/tests/';

var config = {
	applications: {
		ckeditor: {
			path: '.',
			files: [
				'ckeditor.js'
			]
		}
	},

	framework: 'yui',

	plugins: [
		'benderjs-yui',
		'benderjs-sinon',
		'benderjs-jquery',
		// Tests are executed from CKE4 directory, so the path is relative.
		'plugins/a11ychecker/node_modules/benderjs-amd',
		'tests/_benderjs/ckeditor'
	],

	tests: {
		'AC Tests': {
			applications: [ 'ckeditor' ],
			basePath: 'plugins/a11ychecker',
			paths: [
				'tests/**',
				'!**/_*/**'
			]
		}
	},

	'amd': {
		baseUrl: appBaseDir,
		paths: {
			mock: testBaseDir + '_helpers/mockup',
			helpers: testBaseDir + '_helpers',
			jquery: appBaseDir + 'libs/jquery.min',
			mocking: testBaseDir + '_helpers/mocking',
			'testSuite': testBaseDir + '_helpers/testSuite',
			'Quail': appBaseDir + 'libs/quail/quail.jquery.min',
			// Alias for Quail2.2.1.
			'Quail2.2.1': appBaseDir + 'bower_components/quail/dist/quail.jquery'
		}
	}
};

module.exports = config;