/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'EditableDecorator', 'mock/EditableDecoratorMockup' ], function( EditableDecorator, EditableDecoratorMockup ) {
		bender.test( {

			setUp: function() {
				this.mockup = new EditableDecoratorMockup();
				this.mockup.resetContent();
			},

			'test EditableDecorator.editable': function() {
				// We need to mock EditableDecorator and Editor, because decorator
				// asks the editor for the editable.
				var editorMock = {
						// Simply return 1.
						editable: function() {
							return 1;
						}
					},
					decoratorMock = {
						editor: editorMock
					},
					ret;

				ret = EditableDecorator.prototype.editable.call( decoratorMock );

				assert.areSame( 1, ret, 'Invalid return value' );
			},

			'test EditableDecorator.applyMarkup': function() {
				var editable = this.mockup.editable();
				this.mockup.applyMarkup();

				function forceElementEvaluator( el ) {
					return el.type == CKEDITOR.NODE_ELEMENT;
				}

				// We'll pick 3 elements, and examine each one of them.
				var firstChildElement = editable.getFirst( forceElementEvaluator ),
					lastChildElement = editable.getLast( forceElementEvaluator ),
					nestedChildElement = lastChildElement.getLast( forceElementEvaluator );

				assert.isTrue( firstChildElement.hasAttribute( 'data-quail-id' ), 'First element has data-quail-id attr' );
				assert.areSame( '2', firstChildElement.data( 'quail-id' ), 'First element has valid data-quail-id attr value' );

				assert.isTrue( lastChildElement.hasAttribute( 'data-quail-id' ), 'Last element has data-quail-id attr' );
				assert.areSame( '7', lastChildElement.data( 'quail-id' ), 'Last element has valid data-quail-id attr value' );

				assert.isTrue( nestedChildElement.hasAttribute( 'data-quail-id' ), 'Nested element has data-quail-id attr' );
				assert.areSame( '8', nestedChildElement.data( 'quail-id' ), 'Nested element has valid data-quail-id attr value' );
			},

			'test EditableDecorator.removeMarkup': function() {
				var editable = this.mockup.editable();

				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );
				this.mockup.removeMarkup();

				editable.forEach( function( elem ) {
					// Checks each element for the attribute.
					assert.isFalse( elem.hasAttribute( 'data-quail-id' ),
						'Element stil has data-quail-id attr. Element outer: ' + elem.getOuterHtml() );
				}, CKEDITOR.NODE_ELEMENT );
			}

		} );
	} );
} )();