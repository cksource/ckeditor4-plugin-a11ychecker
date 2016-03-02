/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var DateUnfold,
			tests = {
				setUp: function() {
					// Assign a QuickFix/DateUnfold class to more precise property.
					DateUnfold = this.quickFixType;
				},

				'test DateUnfold.fix': function() {
					var issueElement = CKEDITOR.dom.element.createFromHtml( '<p>Short date: 2.2.2012</p>' ),
						fixMockup = new DateUnfold( {
							element: issueElement
						} ),
						fixCallback = mocking.spy();

					fixMockup.fix( {}, fixCallback );

					assert.areSame( 'Short date: 2 February 2012', issueElement.getHtml(), 'Element html changed' );
					// Checking the callback.
					assert.areSame( 1, fixCallback.callCount, 'Callback was called' );
					assert.isTrue( fixCallback.alwaysCalledWith( fixMockup ), 'Callback has QuickFix object as a first parameter' );
				},

				'test DateUnfold.fix multiple': function() {
					var issueElement = CKEDITOR.dom.element.createFromHtml( '<p>Short date: 2.2.2012 11-2-2013</p>' ),
						fixMockup = new DateUnfold( {
							element: issueElement
						} ),
						fixCallback = mocking.spy();

					fixMockup.fix( {}, fixCallback );

					assert.areSame( 'Short date: 2 February 2012 11 February 2013', issueElement.getHtml(), 'Element html changed' );
					// Checking the callback.
					assert.areSame( 1, fixCallback.callCount, 'Callback was called' );
					assert.isTrue( fixCallback.alwaysCalledWith( fixMockup ), 'Callback has QuickFix object as a first parameter' );
				},

				'test DateUnfold.parseDate - DMY format': function() {
					var ret = DateUnfold.prototype.parseDate.call( {}, '23-10-2018' );

					assert.isObject( ret, 'ret type' );
					assert.areSame( '23', ret.day, 'ret.day property' );
					assert.areSame( '10', ret.month, 'ret.day property' );
					assert.areSame( '2018', ret.year, 'ret.day property' );
				},

				'test DateUnfold.parseDate - DMY format dots': function() {
					var ret = DateUnfold.prototype.parseDate.call( {}, '23.10.2018' );

					assert.isObject( ret, 'ret type' );
					assert.areSame( '23', ret.day, 'ret.day property' );
					assert.areSame( '10', ret.month, 'ret.day property' );
					assert.areSame( '2018', ret.year, 'ret.day property' );
				},

				'test DateUnfold.getFriendlyDate': function() {
					var dateObj = {
							day: 1,
							month: 3,
							year: 2022
						},
						ret;

					ret = DateUnfold.prototype.getFriendlyDate.call( {}, dateObj );

					assert.areSame( '1 March 2022', ret, 'Return value' );
				},

				'test DateUnfold.getFriendlyDate - 2 digit year heuristic, 19xx': function() {
					var dateObj = {
							day: 1,
							month: 1,
							year: 70
						},
						ret;

					ret = DateUnfold.prototype.getFriendlyDate.call( {}, dateObj );

					assert.areSame( '1 January 1970', ret, 'Return value' );
				},

				'test DateUnfold.getFriendlyDate - 2 digit year heuristic, 20xx': function() {
					var dateObj = {
							day: 1,
							month: 1,
							year: 69
						},
						ret;

					ret = DateUnfold.prototype.getFriendlyDate.call( {}, dateObj );

					assert.areSame( '1 January 2069', ret, 'Return value' );
				}
			};

		quickFixTest( 'DateUnfold', tests );
	} );
} )();
