/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'quickfix/LocalizedRepository', 'mocking' ], function( LocalizedRepository, mocking ) {

		// We need to imitate dev property.
		mocking.mockProperty( 'CKEDITOR.plugins.a11ychecker.dev', window, true );
		var scriptLoader = mocking.mockProperty( 'CKEDITOR.scriptLoader.load', window );

		bender.test( {
			setUp: function() {
				// Force to clear queue.
				( new LocalizedRepository() )._clearDeferredGetQueue();
			},

			'test deferGetCall': function() {
				var mock = new LocalizedRepository(),
					ret = mock.deferGetCall( 'fr', [ 'foo', mocking.spy() ] );

				assert.isTrue( ret, 'Get call would be deferred' );
				assert.areSame( 1, mock._getDeferredGetCount( 'fr' ), 'Queue increased' );

				assert.areSame( 1, scriptLoader.callCount, 'scriptLoader.load was called' );
				scriptLoader.reset();
			},

			'test deferGetCall dict exists': function() {
				// Now dictionary exists, so get call should not be deferred.
				var mock = new LocalizedRepository(),
					ret;

				mock._langDictionary = {
					pt: {}
				};

				ret = mock.deferGetCall( 'pt', [ 'foo', mocking.spy() ] );

				assert.isFalse( ret, 'Get call shouldnt be deferred' );
				assert.areSame( 0, mock._getDeferredGetCount( 'pt' ), 'Queue remains the same' );
			},

			'test deferGetCall scriptLoader dispatching': function() {
				// We'll call deferGetCall multiple times, for two languages.
				// As a result scriptLoader.load should be called only twice.
				var mock = new LocalizedRepository();

				mock.deferGetCall( 'foo1', [ 'foo', mocking.spy() ] );
				mock.deferGetCall( 'foo1', [ 'foo', mocking.spy() ] );
				mock.deferGetCall( 'foo1', [ 'foo', mocking.spy() ] );
				mock.deferGetCall( 'foo2', [ 'foo', mocking.spy() ] );

				assert.areSame( 2, scriptLoader.callCount, 'scriptLoader.load call count' );
				scriptLoader.reset();
			},

			'test getInstance': function() {
				var mock = new LocalizedRepository(),
					dict = {
						SampleQuickFix: {
							foo: 'bar',
							baz: 'bom'
						}
					},
					issue = {},
					fakeConstructor = mocking.spy(),
					instance = null;

				mock._langDictionary.de = dict;

				// Overwrite get, so it's synchronous, and uses our fake type.
				mock.get = mocking.spy( function( options ) {
					options.callback( fakeConstructor );
				} );

				mock.getInstance( {
					name: 'SampleQuickFix',
					callback: function( quickFixInstance ) {
						instance = quickFixInstance;
					},
					issue: issue,
					langCode: 'de'
				} );

				// Code in getInstance() callback is executed synchronously, so we can assert here, no problem.
				assert.isInstanceOf( fakeConstructor, instance, 'Object created by getInstance has a valid type' );
				assert.areSame( dict.SampleQuickFix, instance.lang, 'Proper lang property has been assigned to the instance' );

				// Ensure that constructor was called with an issue object.
				mocking.assert.calledWith( fakeConstructor, issue );
			},

			'test lang': function() {
				var mock = new LocalizedRepository(),
					dict = {
						foo: 'bar',
						baz: 0
					};

				mock.lang( 'foobaristic', dict );

				assert.areSame( dict, mock._langDictionary.foobaristic, 'Dictionary stored' );
			},

			'test lang triggers deferred gets': function() {
				var mock = new LocalizedRepository();
				mock.get = mocking.spy();

				mock._addDeferredGet( 'langCode1', [ 1 ] );
				mock._addDeferredGet( 'langCode1', [ 2 ] );
				mock._addDeferredGet( 'langCode1', [ 3 ] );
				// This one should not be called!
				mock._addDeferredGet( 'langCode2', [ 3 ] );

				mock.lang( 'langCode1', {} );

				assert.areSame( 3, mock.get.callCount, 'get method calll count' );
				// And check if proper arguments were given.
				mocking.assert.calledWith( mock.get, 1 );
				mocking.assert.calledWith( mock.get, 2 );
				mocking.assert.calledWith( mock.get, 3 );
			}
		} );
	} );
} )();
