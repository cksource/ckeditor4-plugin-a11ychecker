/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ImgAltNonEmpty,
			tests = {
				setUp: function() {
					ImgAltNonEmpty = this.quickFixType;
				},

				'test ImgAltNonEmpty.validate no alt': function() {
					var fixMock = {
							lang: {
								errorEmpty: 'aabb'
							}
						},
						attributes = {
							alt: ''
						},
						ret;

					ret = ImgAltNonEmpty.prototype.validate.call( fixMock, attributes );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 1, ret.length, 'Return array length' );
					assert.areSame( 'aabb', ret[ 0 ], 'Error message' );
				}
			};

		quickFixTest( 'ImgAltNonEmpty', tests );
	} );
} )();
