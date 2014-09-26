/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'EditableDecorator', 'mock/EditableDecoratorMockup', 'mock/IssueListMockup', 'IssueList', 'helpers/sinon/sinon_amd.min' ], function( EditableDecorator, EditableDecoratorMockup, IssueListMockup, IssueList, sinon ) {
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
			},

			'test EditableDecorator.removeMarkup removing .cke_a11ychecker_error': function() {
				// EditableDecorator.removeMarkup should also remove cke_a11ychecker_error class.
				var editable = this.mockup.editable();

				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );
				this.mockup.removeMarkup();

				assert.areSame( 0, editable.find( '.cke_a11ychecker_error' ).count(),
					'No .cke_a11ychecker_error elmeents are found' );
			},

			'test EditableDecorator.markIssues': function() {
				// This method should apply cke_a11ychecker_error class to each
				// issue element (in editable) within given IssueList.

				// Setup the mocked IssueList.
				var issueListMockup = new IssueList(),
					// Only following elements should have HTML class added.
					testedElements = [
						this.mockup.editable().findOne( 'p' ),
						this.mockup.editable().findOne( 'img' )
					],
					className = 'cke_a11ychecker_error';

				issueListMockup.addItem( {
					element: testedElements[ 0 ]
				} );
				issueListMockup.addItem( {
					element: testedElements[ 1 ]
				} );

				this.mockup.markIssues( issueListMockup );

				for ( var i = 0; i < testedElements.length; i++ ) {
					assert.isTrue( testedElements[ i ].hasClass( className ),
						'testedElements[ ' + i + ' ] has class ' + className );
				}

				assert.areSame( 2, this.mockup.editable().find( '.' + className ).count(),
					'Elements with ' + className + ' count' );
			},

			'test EditableDecorator.removeMarkup cke_a11ychecker_error': function() {
				var editable = this.mockup.editable();

				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );
				this.mockup.removeMarkup();

				editable.forEach( function( elem ) {
					// Checks each element for the attribute.
					assert.isFalse( elem.hasAttribute( 'data-quail-id' ),
						'Element stil has data-quail-id attr. Element outer: ' + elem.getOuterHtml() );
				}, CKEDITOR.NODE_ELEMENT );
			},

			'test EditableDecorator.resolveEditorElements': function() {
				// Setup the mocked IssueList.
				var issueListMockup = new IssueList();
				issueListMockup.addItem( {
					originalElement: CKEDITOR.dom.element.createFromHtml( '<p data-quail-id="2"></p>' )
				} );
				issueListMockup.addItem( {
					originalElement: CKEDITOR.dom.element.createFromHtml( '<p data-quail-id="5"></p>' )
				} );

				// Load content with data-quail-id attributes, and call tested method.
				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );
				this.mockup.resolveEditorElements( issueListMockup );

				// Set expected elements (the ones with matching data-quail-id attr).
				var expectedElements = [
					this.mockup.editable().findOne( 'p' ),
					this.mockup.editable().findOne( 'img' )
				];

				for ( var i = 0; i < expectedElements.length; i++ ) {
					assert.isInstanceOf( CKEDITOR.dom.element, issueListMockup.list[ i ].element,
						'Invalid in issueListMockup.list[ ' + i + ' ]' );
					assert.areSame( expectedElements[ i ], issueListMockup.list[ i ].element,
						'Invalid element at offset ' + i );
				}
			},

			'test clickListener': function() {
				var showIssueByElementMock = sinon.spy(),
					element = CKEDITOR.document.getById( 'nestedIssue' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.editor = {
					_: {
						a11ychecker: {
							showIssueByElement: showIssueByElementMock
						}
					}
				};

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 1, showIssueByElementMock.callCount, 'Controller.showIssueByElement calls count' );
				assert.isInstanceOf( CKEDITOR.dom.element, showIssueByElementMock.args[ 0 ][ 0 ] );
			},

			'test clickListener invalid': function() {
				// Lets call standard element, which is not marked as an a11y issue, nor
				// it has parents marked as issued.
				var showIssueByElementMock = sinon.spy(),
					element = CKEDITOR.dom.element.createFromHtml( '<div></div>' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.editor = {
					_: {
						a11ychecker: {
							showIssueByElement: showIssueByElementMock
						}
					}
				};

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 0, showIssueByElementMock.callCount, 'Controller.showIssueByElement calls count' );
			}
		} );
	} );
} )();