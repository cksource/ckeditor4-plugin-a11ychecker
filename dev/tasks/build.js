( function() {
	'use strict';

	module.exports = function( grunt ) {
		// Common tasks for build and build-full.
		var buildCommon = [
				'build-css', 'custom-quail-config', 'copy:build', 'copy:samples', 'copy:readme',
				'custom-quail', 'preprocess:plugin', 'process', 'build-js', 'plugin-versions:build',
				'clean:buildQuickFixes', 'clean:buildLeftOvers', 'build-quickfix:build'
			],
			build = [ 'clean:build' ].concat( buildCommon ),
			// Build-full will contain build tasks + maintenance of external AC plugins.
			buildFull = [ 'clean:build', 'copy:external' ].concat( buildCommon, [
				'plugin-versions:external', 'uglify:external', 'compress:build'
			] ),
			buildFullDescr = 'Generates a sparse build including external plugin dependencies. Use --engines flag ' +
				'to include additional engines plugins.';

		grunt.registerTask( 'build', 'Generates a build.', build );

		if ( grunt.option( 'engines' ) ) {
			buildFull.splice( 1, 0, 'copy:externalEngines', 'plugin-versions:externalEngines' );
			buildFull.splice( buildFull.indexOf( 'uglify:external' ), 0, 'uglify:externalEngines' );
		}

		grunt.registerTask( 'build-full', buildFullDescr, buildFull );
	};
}() );