/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */

( function() {
	'use strict';

	bender.require( [
		'EditableDecorator',
		'Controller',
		'mock/EditableDecoratorMockup',
		'mock/IssueListMockup',
		'IssueList',
		'mocking'
	], function(
		EditableDecorator,
		Controller,
		EditableDecoratorMockup,
		IssueListMockup,
		IssueList,
		mocking
	) {
		var QUAIL_TESTABILITY = {
				ERROR: 1,
				WARNING: 0.5,
				NOTICE: 0
			},
			sinon = mocking.sinon;

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

				assert.isTrue( editable.hasAttribute( 'data-quail-id' ), 'Editable has data-quail-id attr' );
				assert.areSame( '1', editable.data( 'quail-id' ), 'Editable id' );

				assert.isTrue( firstChildElement.hasAttribute( 'data-quail-id' ), 'First element has data-quail-id attr' );
				assert.areSame( '2', firstChildElement.data( 'quail-id' ), 'First element has valid data-quail-id attr value' );

				assert.isTrue( lastChildElement.hasAttribute( 'data-quail-id' ), 'Last element has data-quail-id attr' );
				assert.areSame( '7', lastChildElement.data( 'quail-id' ), 'Last element has valid data-quail-id attr value' );

				assert.isTrue( nestedChildElement.hasAttribute( 'data-quail-id' ), 'Nested element has data-quail-id attr' );
				assert.areSame( '8', nestedChildElement.data( 'quail-id' ), 'Nested element has valid data-quail-id attr value' );
			},

			'test EditableDecorator.removeMarkup': function() {
				var editable = this.mockup.editable();

				this.mockup.unmarkIssueElement = mocking.spy();
				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );

				// Elements expected to be given to the unmarkIssueElement method.
				var expectedElements = editable.find( '.cke_a11yc_issue' ),
					unmarkIssueElement = this.mockup.unmarkIssueElement;

				this.mockup.removeMarkup();

				editable.forEach( function( elem ) {
					// Checks each element for the attribute.
					assert.isFalse( elem.hasAttribute( 'data-quail-id' ),
						'Element stil has data-quail-id attr. Element outer: ' + elem.getOuterHtml() );
				}, CKEDITOR.NODE_ELEMENT );

				// unmarkIssueElement should be called only for elements in expectedElements.
				assert.areSame( expectedElements.count(), unmarkIssueElement.callCount,
					'EditableDecorator.unmarkIssueElement call count' );
				mocking.assert.calledWith( this.mockup.unmarkIssueElement, expectedElements.getItem( 0 ) );
				mocking.assert.calledWith( this.mockup.unmarkIssueElement, expectedElements.getItem( 1 ) );
			},

			'test EditableDecorator.removeMarkup removing .cke_a11yc_issue': function() {
				// EditableDecorator.removeMarkup should also remove cke_a11yc_issue class.
				var editable = this.mockup.editable();

				this.mockup.loadContentFrom( 'a11ycheckerIdMarkup' );
				this.mockup.removeMarkup();

				assert.areSame( 0, editable.find( '.cke_a11yc_issue' ).count(),
					'No .cke_a11yc_issue elmeents are found' );
			},

			'test EditableDecorator.markIssues': function() {
				// This method should apply cke_a11yc_issue class to each
				// issue element (in editable) within given IssueList.

				// Setup the mocked IssueList.
				var issueListMockup = new IssueList(),
					// Only following elements should have HTML class added.
					testedElements = [
						this.mockup.editable().findOne( 'p' ),
						this.mockup.editable().findOne( 'img' )
					],
					className = 'cke_a11yc_issue';

				issueListMockup.addItem( {
					element: testedElements[ 0 ],
					isIgnored: sinon.spy()
				} );
				issueListMockup.addItem( {
					element: testedElements[ 1 ],
					isIgnored: sinon.spy()
				} );

				this.mockup.markIssues( issueListMockup );

				for ( var i = 0; i < testedElements.length; i++ ) {
					assert.isTrue( testedElements[ i ].hasClass( className ),
						'testedElements[ ' + i + ' ] has class ' + className );
				}

				assert.areSame( 2, this.mockup.editable().find( '.' + className ).count(),
					'Elements with ' + className + ' count' );
			},

			'test EditableDecorator.markIssues applies ignore class': function() {
				// We need to check if markIssues() considers issue.isIgnored(), that should
				// result with editableDecorator.markIgnoredIssue being called.
				var issueMockup = this._getIssueMock(),
					list = {
						getItem: function() {
							return issueMockup;
						},
						count: function() {
							return 1;
						},
						getIssuesByElement: function() {
							return [];
						}
					};

				issueMockup.testability = 1;
				issueMockup.isIgnored = sinon.spy( function() {
					return true;
				} );

				this.mockup.markIgnoredIssue = sinon.spy();

				// Setup the mocked IssueList.
				this.mockup.markIssues( list );

				assert.areSame( 1, this.mockup.markIgnoredIssue.callCount,
					'editableDecorator.markIgnoredIssue call count' );
			},

			'test EditableDecorator.removeMarkup cke_a11yc_issue': function() {
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
				patchMockupForClick( this.mockup );

				var showIssueByElementMock = this.mockup.editor._.a11ychecker.showIssueByElement,
					setModeMock = this.mockup.editor._.a11ychecker.setMode,
					element = CKEDITOR.document.getById( 'nestedIssue' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 1, showIssueByElementMock.callCount, 'Controller.showIssueByElement calls count' );
				assert.areSame( element, showIssueByElementMock.args[ 0 ][ 0 ].$ );

				mocking.assert.calledWith( setModeMock, 1 );
			},

			'test clickListener nested': function() {
				// This time function will be called on element nested within
				// element marked as a11y issue.
				patchMockupForClick( this.mockup );

				var showIssueByElementMock = this.mockup.editor._.a11ychecker.showIssueByElement,
					// A parent, which is marked with cke_a11yc_issue class.
					issueElement = CKEDITOR.document.findOne( '#fakeErrors .cke_a11yc_issue' ),
					// A nested element, which doesnt have a error class, but will receive click event.
					element = issueElement.findOne( 'p' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 1, showIssueByElementMock.callCount, 'Controller.showIssueByElement calls count' );
				assert.areSame( issueElement, showIssueByElementMock.args[ 0 ][ 0 ] );
			},

			'test clickListener invalid': function() {
				// Lets call standard element, which is not marked as an a11y issue, nor
				// it has parents marked as issued.
				patchMockupForClick( this.mockup );

				var showIssueByElementMock = this.mockup.editor._.a11ychecker.showIssueByElement,
					element = CKEDITOR.dom.element.createFromHtml( '<div></div>' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 0, showIssueByElementMock.callCount, 'Controller.showIssueByElement calls count' );
			},

			'test clickListener focused': function() {
				// Lets click already focused issue. This should switch Controller into listening mode.
				patchMockupForClick( this.mockup );

				var setModeMock = this.mockup.editor._.a11ychecker.setMode,
					showIssueByElementMock = this.mockup.editor._.a11ychecker.showIssueByElement,
					element = CKEDITOR.document.findOne( '#fakeErrors .cke_a11yc_focused' ).$,
					evtMock = new CKEDITOR.dom.event( {
						target: element
					} );

				this.mockup.clickListener( { data: evtMock } );

				assert.areSame( 1, setModeMock.callCount,
					'Controller.setMode calls count' );
				assert.areEqual( Controller.modes.LISTENING, setModeMock.args[ 0 ][ 0 ],
					'Controller.setMode first argument' );
				assert.areEqual( 0, showIssueByElementMock.callCount,
					'Controlelr.showIssueByElement call count' );
			},

			'test markIssueElement adding classes - error': function() {
				this._assertMarkIssueElementClass( 'cke_a11yc_error', QUAIL_TESTABILITY.ERROR );
			},

			'test markIssueElement adding classes - warning': function() {
				this._assertMarkIssueElementClass( 'cke_a11yc_warning', QUAIL_TESTABILITY.WARNING );
			},

			'test markIssueElement adding classes - notice': function() {
				this._assertMarkIssueElementClass( 'cke_a11yc_notice', QUAIL_TESTABILITY.NOTICE );
			},

			'test markIssueElement calls markIgnoredIssue': function() {
				this.mockup.markIgnoredIssue = mocking.spy();

				var issue = this._getIssueMock(),
					list = this._getIssuesListMock();

				issue.isIgnored = function() {
					return true;
				};

				this.mockup.markIssueElement( issue, list );

				assert.areSame( 1, this.mockup.markIgnoredIssue.callCount, 'markIgnoredIssue call count' );
				mocking.assert.calledWith( this.mockup.markIgnoredIssue, issue );
			},

			'test markIssueElement doesnt call markIgnoredIssue': function() {
				// We should not mark issue element as ignored when list.getIssuesByElement()
				// returns 1 or more non-ignored issues for that element.
				this.mockup.markIgnoredIssue = mocking.spy();

				var issue = this._getIssueMock(),
					list = this._getIssuesListMock();

				list.getIssuesByElement = mocking.spy( function() {
					return [ 1 ];
				} );

				issue.isIgnored = function() {
					return true;
				};

				this.mockup.markIssueElement( issue, list );

				assert.areSame( 0, this.mockup.markIgnoredIssue.callCount, 'markIgnoredIssue wasnt called' );
			},

			'test unmarkIssueElement': function() {
				var issue = {},
					removeClass = mocking.mockProperty( 'element.removeClass', issue, mocking.spy( function() {
						// Make sure that function is chainable.
						return issue.element;
					} ) ),
					// Classes expected to be removed.
					expectedClasses = [
						'cke_a11yc_issue',
						'cke_a11yc_error',
						'cke_a11yc_warning',
						'cke_a11yc_notice',
						'cke_a11yc_ignored',
						'cke_a11yc_focused'
					];

				this.mockup.unmarkIssueElement( issue );

				assert.areNotEqual( 0, removeClass.callCount, 'There were some element.removeClass calls' );

				for ( var i = 0; i < expectedClasses.length; i++ ) {
					mocking.assert.calledWith( removeClass, expectedClasses[ i ] );
				}
			},

			'test unmarkIssueElement skipCommonClass': function() {
				var issue = {},
					removeClass = mocking.mockProperty( 'element.removeClass', issue, mocking.spy( function() {
						// Make sure that function is chainable.
						return issue.element;
					} ) );

				this.mockup.unmarkIssueElement( issue, true );

				assert.isFalse( removeClass.calledWith( 'cke_a11yc_issue' ) );
			},

			'test markIgnoredIssue': function() {
				var issue = {
					isIgnored: function() {
						return true;
					},
					element: {
						addClass: sinon.spy()
					}
				};

				this.mockup.markIgnoredIssue( issue );

				assert.isTrue( issue.element.addClass.calledWith( 'cke_a11yc_ignored' ),
					'class cke_a11yc_ignored added' );
			},

			// Helper function to test markIssueElement method.
			// Given `issueTestability` should cause it to call addClass with `expectedClass`.
			_assertMarkIssueElementClass: function( expectedClass, issueTestability ) {
				var issue = this._getIssueMock(),
					addClass = issue.element.addClass;

				issue.testability = issueTestability;
				issue.isIgnored = function() {
					return false;
				};

				this.mockup.markIssueElement( issue );

				assert.areSame( 2, addClass.callCount, 'element.addClass call count' );
				mocking.assert.calledWith( addClass, expectedClass );
			},

			// Returns an issue mockup, used mainly for .markIssueElement methods.
			_getIssueMock: function() {
				var issue = {
					testability: 0,
					isIgnored: function() {
						return false;
					},
					element: {
						addClass: sinon.spy(),
						removeClass: sinon.spy()
					}
				};

				mocking.mockProperty( 'element.addClass', issue );

				return issue;
			},

			// Returns an issue lsit mockup, used mainly for .markIssueElement methods.
			_getIssuesListMock: function() {
				return {
					getIssuesByElement: function() {
						return [];
					}
				};
			}
		} );

		// Patches mockup so it can work with clickListener function.
		function patchMockupForClick( editableDecoratorMockup ) {
			editableDecoratorMockup.editor = {
				_: {
					a11ychecker: {
						showIssueByElement: sinon.spy(),
						setMode: sinon.spy(),
						mode: {},
						enabled: 1
					}
				}
			};
		}
	} );
} )();
