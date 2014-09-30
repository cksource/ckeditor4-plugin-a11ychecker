/* bender-tags: a11ychecker,unit */
/* bender-include: %TEST_DIR%../_helpers/require.js, %TEST_DIR%../_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'QuickFix/ImgAlt', 'helpers/sinon/sinon_amd.min' ], function( ImgAlt, sinon ) {
		bender.test( {
			'test ImgAlt.display': function() {
				var formMock = {
					},
					ret;

				formMock.setInputs = sinon.spy( function() {
				} );

				ret = ImgAlt.prototype.display.call( {}, formMock );

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
					fixCallback = sinon.spy();

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

			'test ImgAlt.validate no alt': function() {
				var attributes = {
						alt: ''
					},
					ret;

				ret = ImgAlt.prototype.validate.call( {}, attributes );

				assert.isInstanceOf( Array, ret );
				assert.areSame( 1, ret.length, 'Return array length' );
				assert.areSame( 'Alternative text can not be empty', ret[ 0 ], 'Error message' );
			}
		} );
	} );
} )();