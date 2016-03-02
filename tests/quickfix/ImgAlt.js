/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ImgAlt,
			tests = {
				setUp: function() {
					ImgAlt = this.quickFixType;
				},

				'test ImgAlt.display': function() {
					var fixMock = {
							lang: {
								altLabel: 'Alternative text'
							}
						},
						formMock = {},
						ret;

					formMock.setInputs = mocking.spy();
					mocking.mockProperty( 'issue.element.getAttribute', fixMock );

					ret = ImgAlt.prototype.display.call( fixMock, formMock );

					assert.areSame( 1, formMock.setInputs.callCount, 'setInputs was called once' );
					var setInputsParam = formMock.setInputs.getCalls()[ 0 ].args[ 0 ],
						altInput;

					assert.isObject( setInputsParam, 'form.setInputs has a valid param type' );
					assert.isObject( setInputsParam.alt, 'form.setInputs param has alt input' );
					altInput = setInputsParam.alt;
					assert.areSame( 'text', altInput.type, 'altInput.type' );
					assert.areSame( 'Alternative text', altInput.label, 'altInput.label' );
				},

				'test ImgAlt.fix': function() {
					var attributes = {
							alt: 'new alt'
						},
						imgElement = CKEDITOR.dom.element.createFromHtml( '<img />' ),
						fixMockup = {
							issue: {
								element: imgElement
							},
							fix: ImgAlt.prototype.fix
						},
						fixCallback = mocking.spy();

					fixMockup.fix( attributes, fixCallback );

					assert.isTrue( imgElement.hasAttribute( 'alt' ), 'alt attribute added' );
					assert.areSame( 'new alt', imgElement.getAttribute( 'alt' ), 'alt attr value' );
					// Checking the callback.
					assert.areSame( 1, fixCallback.callCount, 'Callback was called' );
					assert.isTrue( fixCallback.alwaysCalledWith( fixMockup ), 'Callback has QuickFix object as a first parameter' );
				},

				'test ImgAlt.validate positive': function() {
					var attributes = {
							alt: 'foo'
						},
						ret;

					ret = ImgAlt.prototype.validate.call( {}, attributes );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 0, ret.length, 'Return array length' );
				},

				'test ImgAlt.validate too long': function() {
					var qfMock = {
							lang: {
								errorTooLong: 'Alternative text is too long. It should ' +
									'be up to {limit} characters while your has {length}'
							}
						},
						attributes = {},
						alt = '',
						expectedError = 'Alternative text is too long. It should be up' +
							' to 100 characters while your has 120',
						ret;

					for ( var i = 0; i < 120; i++ ) {
						alt += 'o';
					}

					attributes.alt = alt;

					ret = ImgAlt.prototype.validate.call( qfMock, attributes );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 1, ret.length, 'Return array length' );
					assert.areSame( expectedError, ret[ 0 ], 'Error message' );
				},

				'test ImgAlt.validate same as file name': function() {
					var attributes = {
							alt: 'my_file_name.png'
						},
						mock = {
							lang: {
								errorSameAsFileName: 'Image alt should not be the same as the file name'
							}
						},
						getAttr = mocking.stub().returns( '/foo/bar/my_file_name.png' ),
						expectedError = 'Image alt should not be the same as the file name',
						ret;

					mocking.mockProperty( 'issue.element.getAttribute', mock, getAttr );

					ret = ImgAlt.prototype.validate.call( mock, attributes );

					mocking.assert.calledOnce( getAttr );
					mocking.assert.calledWith( getAttr, 'src' );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 1, ret.length, 'Return array length' );
					assert.areSame( expectedError, ret[ 0 ], 'Error message' );
				},

				'test ImgAlt.validate no alt': function() {
					var fixMock = {
							lang: {}
						},
						attributes = {
							alt: ''
						},
						ret;

					ret = ImgAlt.prototype.validate.call( fixMock, attributes );

					assert.isInstanceOf( Array, ret );
					assert.areSame( 0, ret.length, 'Return array length' );
				},

				'test ImgAlt.validate no length limit': function() {
					// Ensure that if we set ImgAlt.altLengthLimit to 0 then lenth
					// validation won't be performed.
					var attributes = {},
						alt = '',
						originalLimit = ImgAlt.altLengthLimit,
						ret;

					for ( var i = 0; i < 400; i++ ) {
						alt += 'o';
					}

					attributes.alt = alt;

					try {
						ImgAlt.altLengthLimit = 0;

						ret = ImgAlt.prototype.validate.call( {}, attributes );

						assert.isInstanceOf( Array, ret );
						assert.areSame( 0, ret.length, 'Return array length' );
					} catch (e) {
						throw e;
					} finally {
						// Restore the limit.
						ImgAlt.altLengthLimit = originalLimit;
					}
				}
			};

		quickFixTest( 'ImgAlt', tests );
	} );
} )();
