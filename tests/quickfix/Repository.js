/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'quickfix/Repository', 'mocking' ], function( Repository, mocking ) {
		bender.test( {
			'test Repository.get': function() {
				var mock = new Repository(),
					callback = mocking.spy(),
					options = {
						name: 'fooFix',
						callback: callback
					},
					evtData = {
						name: 'fooFix'
					};

				mock.fire = mocking.spy();
				mock.requestQuickFix = mocking.spy();
				mock._getRequestEvent = sinon.stub().returns( evtData );
				mock.get( options );

				assert.areSame( 1, mock.fire.callCount, 'Repository.fire called' );
				mocking.assert.calledWithExactly( mock._getRequestEvent, 'fooFix' );
				mocking.assert.calledWithExactly( mock.fire, 'requested', evtData );
				mocking.assert.calledWithExactly( mock.requestQuickFix, options );

				// And we should ensure that a callback was stroed in waitingCallbacks.
				var waitingCallbacks = mock.getWaitingCallbacks();

				assert.isTrue( !!waitingCallbacks.fooFix,
					'Stored callback for fooFix in waitingCallbacks queue' );
				assert.isInstanceOf( Array, waitingCallbacks.fooFix,
					'waitingCallbacks.fooFix type' );
				assert.areSame( callback, waitingCallbacks.fooFix[ 0 ],
					'waitingCallbacks.fooFix[ 0 ] value' );

				// Cleanup.
				delete waitingCallbacks.fooFix;
			},

			'test multiple Repository.get': function() {
				// We need to test multiple get() request, simulating a case when
				// the class was ALREADY requested, but still not downloaded.
				// Only the first call should cause `requested` event.
				var mock = new Repository(),
					// Lets make only 2 callbacks.
					callback = mocking.spy(),
					callbackOther = mocking.spy();

				mock.fire = mocking.spy();
				mock.requestQuickFix = mocking.spy();
				mock._getRequestEvent = sinon.stub().returns( {
					name: 'bar'
				} );

				// Call 4 times.
				mock.get( {
					name: 'bar',
					callback: callback
				} );
				mock.get( {
					name: 'bar',
					callback: callback
				} );
				mock.get( {
					name: 'bar',
					callback: callback
				} );
				mock.get( {
					name: 'bar',
					callback: callbackOther
				} );

				assert.areSame( 1, mock.fire.callCount, 'Repository.fire called only once' );
				mocking.assert.calledWith( mock.fire, 'requested' );

				assert.areSame( 1, mock.requestQuickFix.callCount,
					'mock.requestQuickFix called only once' );
				mocking.assert.calledWith( mock.requestQuickFix, {
					name: 'bar',
					callback: callback
				} );

				// And we should ensure that a callbacks were stroed in waitingCallbacks.
				var waitingCallbacks = mock.getWaitingCallbacks();

				assert.isInstanceOf( Array, waitingCallbacks.bar,
					'waitingCallbacks.bar type' );
				assert.areSame( 4, waitingCallbacks.bar.length,
					'waitingCallbacks.bar length' );

				// Cleanup.
				delete waitingCallbacks.fooFix;
			},

			'test Repository.get with event canceled': function() {
				var mock = new Repository();

				mock.fire = mocking.stub().returns( false );
				mock._getRequestEvent = sinon.stub().returns( {
					name: 'bar'
				} );
				mock.requestQuickFix = mocking.spy();
				mock.get( 'fooFix' );

				assert.areSame( 0, mock.requestQuickFix.callCount, 'requestQuickFix was not called' );
			},

			'test Repository.get with known type': function() {
				// If type is already loaded to mapping (known) get method should
				// call the callback immediately and return without request event.
				var mock = new Repository(),
					fooBarType = function( x ) {},
					getCallback = mocking.spy();

				mock.setLoadedTypes( {
					fooBar: fooBarType
				} );

				mock.fire = mocking.spy();
				mock._getRequestEvent = sinon.stub().returns( {
					name: 'bar'
				} );

				mock.get( {
					name: 'fooBar',
					callback: getCallback
				} );

				assert.areSame( 0, mock.fire.callCount, 'mock.fire call count' );

				mocking.assert.calledWith( getCallback, fooBarType );
			},

			'test Repository.requestQuickFix': function() {
				var mock = new Repository();

				mocking.spy( CKEDITOR.scriptLoader, 'load' );

				try {
					mock.requestQuickFix( {
						name: 'foo'
					} );

					assert.areSame( 1, CKEDITOR.scriptLoader.load.callCount );
					mocking.assert.calledWith( CKEDITOR.scriptLoader.load, 'foo.js' );
				} catch (e) {
					// Propagate.
					throw e;
				} finally {
					CKEDITOR.scriptLoader.load.restore();
				}
			},

			'test Repository.requestQuickFix fail': function() {
				var mock = new Repository(),
					options = {
						name: 'foo',
						fail: sinon.stub(),
						callback: sinon.stub()
					};

				mocking.stub( CKEDITOR.scriptLoader, 'load', function( path, callback ) {
					callback( 404 );
				} );

				try {
					mock.requestQuickFix( options );

					assert.areSame( 1, options.fail.callCount, 'options.fail call count' );
					mocking.assert.calledWithExactly( options.fail );

					assert.areSame( 0, options.callback.callCount, 'options.callback call count' );
				} catch (e) {
					// Propagate.
					throw e;
				} finally {
					CKEDITOR.scriptLoader.load.restore();
				}
			},

			'test Repository.add': function() {
				var mock = new Repository(),
					type = mocking.spy(),
					loadedTypes = mock.getLoadedTypes();

				mock.add( 'fooType', type );

				assert.areSame( type, loadedTypes.fooType, 'Type was mapped correctly' );
			},

			'test Repository.add callbacks calling': function() {
				var mock = new Repository(),
					type = mocking.spy(),
					waitingCallbacks = mock.getWaitingCallbacks(),
					// How much callbacks do we want to create?
					callbacksCount = 3,
					callbacks = [],
					i;

				waitingCallbacks.barType = [];

				for ( i = 0; i < callbacksCount; i++ ) {
					waitingCallbacks.barType.push( mocking.spy() );
					// We need to keep a separate array for callbacks, because the
					// one in waitingCallbacks.barType will be clearedafter calling
					// register().
					callbacks[ i ] = waitingCallbacks.barType[ i ];
				}

				mock.add( 'barType', type );

				for ( i = 0; i < callbacksCount; i++ ) {
					assert.areSame( 1, callbacks[ i ].callCount,
						'Callback at index ' + i + ' call count' );
					mocking.assert.calledWith( callbacks[ i ], type );
				}
			},

			'test Repository.add clears waitingCallbacks': function() {
				var mock = new Repository(),
					type = mocking.spy(),
					waitingCallbacks = mock.getWaitingCallbacks(),
					// How much callbacks do we want to create?
					callbacksCount = 3,
					i;

				waitingCallbacks.cusType = [];

				for ( i = 0; i < callbacksCount; i++ ) {
					waitingCallbacks.cusType.push( mocking.spy() );
				}

				mock.add( 'cusType', type );

				assert.areSame( undefined, waitingCallbacks.cusType,
					'waitingCallbacks.cusType' );
			},

			'test Repository._getRequestEvent': function() {
				var mock = new Repository( 'foo' ),
					ret = mock._getRequestEvent( 'bar' );

				assert.isInstanceOf( Object, ret, 'Return type' );
				assert.areEqual( 'bar', ret.name, 'Return value' );
			},

			'test integration': function() {
				var mock = new Repository( '%TEST_DIR%../_helpers/' );

				// Inject mock to the globally available a11ychecker object.
				mocking.mockProperty( 'CKEDITOR.plugins.a11ychecker.quickFixRepo', window, mock );

				mock.get( {
					name: 'SampleQuickFix',
					callback: function( SampleQuickFix ) {
						resume( function() {
							assert.isInstanceOf( Function, SampleQuickFix );
							// Ensure that it's the correct type.
							assert.areSame( 'bar', SampleQuickFix.prototype.foo() );
						} );
					}
				} );

				wait();
			}
		} );
	} );
} )();