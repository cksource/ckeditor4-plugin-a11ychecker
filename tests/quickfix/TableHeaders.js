/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var TableHeaders,
			tests = {
				setUp: function() {
					TableHeaders = this.quickFixType;
				},

				'test TableHeaders.fix both': function() {
					var table = CKEDITOR.document.getById( 'sampleTable' ),
						fixMock = {
							issue: {
								element: table
							}
						},
						form = {
							position: 'both'
						};

					TableHeaders.prototype.fix.call( fixMock, form );

					assert.areNotEqual( 0, table.find( 'th' ).count(), 'Table has no th elems' );
					assert.areSame( 'aa', table.findOne( 'th' ).getText(), 'First th inner text' );
				},

				'test TableHeaders.fix horizontally': function() {
					var table = CKEDITOR.document.getById( 'sampleTableHorizontal' ),
						fixMock = {
							issue: {
								element: table
							}
						},
						form = {
							position: 'row'
						};

					TableHeaders.prototype.fix.call( fixMock, form );

					assert.areSame( 2, table.findOne( 'tr' ).find( 'th' ).count(), 'Invalid th count in first tr' );
					assert.areSame( 2, table.find( 'th' ).count(), 'th count in whole table' );
					assert.areSame( 'aa', table.findOne( 'th' ).getText(), 'First th inner text' );
				},

				'test TableHeaders.fix vertically': function() {
					var table = CKEDITOR.document.getById( 'sampleTableVertical' ),
						fixMock = {
							issue: {
								element: table
							}
						},
						form = {
							position: 'col'
						};

					TableHeaders.prototype.fix.call( fixMock, form );

					assert.areSame( 1, table.findOne( 'tr' ).find( 'th' ).count(), 'Invalid th count in first tr' );
					assert.areSame( 3, table.find( 'th' ).count(), 'th count in whole table' );
					assert.areSame( 'aa', table.findOne( 'th' ).getText(), 'First th inner text' );
					assert.areSame( 'cc', table.find( 'th' ).getItem( 1 ).getText(), 'Second th inner text' );
				}
			};

		quickFixTest( 'TableHeaders', tests );
	} );
} )();
