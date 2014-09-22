/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'Controller', 'helpers/sinon/sinon_amd.min' ], function( Controller, sinon ) {
		bender.test( {
			setUp: function() {
				this.mockup = getControllerMockup();
			},

			'test Controller.getTempOutput first call': function() {
				// Ensures that getTempOutput creates a new element if called for the first time.
				var ret = this.mockup.getTempOutput();
				assert.isInstanceOf( CKEDITOR.dom.element, ret, 'Returned value has a valid type' );
				assert.isNull( null, ret.getParent(), 'Element has no parent' );
			},

			'test Controller.getTempOutput multiple calls': function() {
				// Checks if getTempOutput will return diffrent DOM elements, when
				// by diffrent objects.
				// (Note we're using 2 diffrent Controller objects, so they're not the same!)
				var ret1 = this.mockup.getTempOutput(),
					ret2 = getControllerMockup().getTempOutput();

				assert.isInstanceOf( CKEDITOR.dom.element, ret2, 'ret2 has a valid type' );
				assert.areNotSame( ret1, ret2, 'Both return values should differ' );
			},

			'test Controller.getTempOutput subsequent calls': function() {
				// If getTempOutput will be called **by the same object** multiple times it
				// should return same DOM object.
				var ret1 = this.mockup.getTempOutput(),
					ret2 = this.mockup.getTempOutput();

				assert.areSame( ret1, ret2, 'Returned elements are the same' );
			},

			'test Controller.setEngine': function() {
				var newEngine = {};
				this.mockup.setEngine( newEngine );

				assert.areSame( newEngine, this.mockup.engine, 'Engine property was changed' );
			},

			'test Controller.close': function() {
				var issueClearCalls = 0,
					removeMarkupCalls = 0,
					uiHideCalls = 0,
					issuesMock = {
						clear: function() { issueClearCalls += 1; }
					},
					controllerMockup = {
						issues: issuesMock,
						editableDecorator: {
							removeMarkup: function() { removeMarkupCalls += 1; }
						},
						editor: {
							_: {
								a11ychecker: {
									ui: {
										hide: function() { uiHideCalls += 1; }
									}
								}
							}
						},
						close: Controller.prototype.close
					};

				controllerMockup.close();

				assert.areSame( 1, issueClearCalls, 'Controller.issue.clear calls count' );
				assert.areSame( 1, removeMarkupCalls, 'Controller.editableDecorator.removeMarkupCalls calls count' );
				assert.areSame( 1, uiHideCalls, 'ui.removeMarkupCalls calls count' );
			},

			'test Controller.next': function() {
				var mock = getControllerMockup(),
					nextCalled = 0,
					showIssueCalled = 0,
					nextIssueMock = {},
					issueListMock = {
						next: function() {
							nextCalled += 1;

							return nextIssueMock;
						},
						count: function() {
							return 3;
						}
					};

				mock.issues = issueListMock;
				mock.viewerController = getViewerControllerMockup();

				mock.viewerController.showIssue = function( issue ) {
					showIssueCalled += 1;
					assert.areSame( nextIssueMock, issue, 'Issue is given to viewerController.showIssueCalled' );
				};

				mock.next();

				assert.areSame( 1, nextCalled, 'Controller.issues.next calls count' );
				assert.areSame( 1, showIssueCalled, 'Controller.viewerController.showIssue calls count' );
			},

			'test Controller.next no issues': function() {
				// This time Controller.issue should have no issues, so even
				// Controller.issue.next should not be called
				var mock = getControllerMockup(),
					nextCalled = 0,
					issueListMock = {
						next: function() {
							nextCalled += 1;
						},
						count: function() {
							return 0;
						}
					};

				mock.issues = issueListMock;

				mock.next();

				assert.areSame( 0, nextCalled, 'Controller.issues.next calls count' );
			},

			'test Controller.prev': function() {
				var mock = getControllerMockup(),
					prevCalled = 0,
					showIssueCalled = 0,
					prevIssueMock = {},
					issueListMock = {
						prev: function() {
							prevCalled += 1;

							return prevIssueMock;
						},
						count: function() {
							return 3;
						}
					};

				mock.issues = issueListMock;
				mock.viewerController = getViewerControllerMockup();

				mock.viewerController.showIssue = function( issue ) {
					showIssueCalled += 1;
					assert.areSame( prevIssueMock, issue, 'Issue is given to viewerController.showIssueCalled' );
				};

				mock.prev();

				assert.areSame( 1, prevCalled, 'Controller.issues.prev calls count' );
				assert.areSame( 1, showIssueCalled, 'Controller.viewerController.showIssue calls count' );
			},

			'test Controller.showIssue': function() {
				var moveToMock = sinon.spy( function() {
						return true;
					} ),
					controllerMock = {
						issues: {
							moveTo: moveToMock
						},
						showIssue: Controller.prototype.showIssue
					},
					ret;

				ret = controllerMock.showIssue( 2 );

				assert.isTrue( ret, 'Return value' );
				assert.areSame( 1, moveToMock.callCount, 'issues.showIssue calls count' );
				assert.isTrue( moveToMock.alwaysCalledWithExactly( 2 ), 'issues.moveTo params' );
			},

			'test Controller.showIssue with object': function() {
				// When calling showIssue with an object, it should call
				// indexOf with the issue to get its index.
				var issue = {},
					moveToMock = sinon.spy( function() {
						return true;
					} ),
					indexOfMock = sinon.spy( function() {
						return 3;
					} ),
					controllerMock = {
						issues: {
							moveTo: moveToMock,
							indexOf: indexOfMock
						},
						showIssue: Controller.prototype.showIssue
					},
					ret;

				ret = controllerMock.showIssue( issue );

				assert.areSame( 1, indexOfMock.callCount, 'issues.indexOf calls count' );
				assert.isTrue( indexOfMock.alwaysCalledWithExactly( issue ), 'isseus.indexOf params' );


				assert.isTrue( ret, 'Return value' );
				assert.areSame( 1, moveToMock.callCount, 'issues.showIssue calls count' );
				assert.isTrue( moveToMock.alwaysCalledWithExactly( 3 ), 'issues.moveTo params' );
			},

			'test Controller.showIssue non-existing issue': function() {
				// In case of invalid index, moveToMock will detect it and
				// return false. showIssue should return false too.
				var moveToMock = sinon.spy( function() {
						return false;
					} ),
					controllerMock = {
						issues: {
							moveTo: moveToMock
						},
						showIssue: Controller.prototype.showIssue
					},
					ret;

				ret = controllerMock.showIssue( -1 );

				assert.isFalse( ret, 'Return value' );
				assert.areSame( 1, moveToMock.callCount, 'issues.showIssue calls count' );
				assert.isTrue( moveToMock.alwaysCalledWithExactly( -1 ), 'issues.moveTo params' );
			}
		} );

		function getControllerMockup() {
			return new Controller();
		}

		function getViewerControllerMockup() {
			return {
				showIssue: function() {}
			};
		}
	} );
} )();