/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */
/* bender-include: %TEST_DIR%_helpers/require.js, %TEST_DIR%_helpers/requireConfig.js */

( function() {
	'use strict';

	require( [ 'Controller', 'mock/ControllerMockup', 'helpers/sinon/sinon_amd.min' ], function( Controller, ControllerMockup, sinon ) {
		bender.test( {
			setUp: function() {
				this.mockup = getControllerMockup();
			},

			'test Controller constructor': function() {
				// Lets use 0 as editor, so EditableDecorator.attachListeners won't be called.
				var editor = 0,
					controller = new Controller( editor );

				assert.areSame( editor, controller.editor, 'editor property is stored' );
				assert.isFalse( controller.enabled, 'By default controller is disabled' );
			},

			'test Controller.exec': function() {
				patchMockupForExecMethod( this.mockup );

				var issueList = {
					sort: sinon.spy()
				};

				// Actually in this case we'll have to make sure that engine.process will
				// call the callback.
				this.mockup.engine.process = function( controller, scratchpad, callback ) {
					callback( issueList );
				};

				// Actual exec call.
				this.mockup.exec();

				assert.areSame( 1, this.mockup.enable.callCount, 'Controller.enable calls count' );
				assert.areSame( 1, this.mockup.fire.callCount, 'Controller.fire calls count' );
				assert.areSame( 'checked', this.mockup.fire.args[ 0 ][ 0 ], 'Controller.fire event name' );
				var eventData = this.mockup.fire.args[ 0 ][ 1 ];
				assert.isObject( eventData, 'Controller.fire event data type' );
				assert.areSame( issueList, eventData.issues, 'eventData.issues value' );
			},

			'test Controller.exec on enabled Controller': function() {
				// Every call to Controller.exec with enabled property set to true should
				// close the Accessibility Checker.
				patchMockupForExecMethod( this.mockup );

				this.mockup.enabled = true;

				this.mockup.close = sinon.spy();

				// Actual exec call.
				this.mockup.exec();

				assert.areSame( 0, this.mockup.ui.show.callCount, 'ui.show method was not called' );
				assert.areSame( 1, this.mockup.close.callCount, 'Controller.close calls count' );
			},

			'test Controller.disable': function() {
				var mockup = this.mockup;

				mockup.fire = sinon.spy();
				// Force mockup to be seen as enabled.
				mockup.enabled = true;

				mockup.disable();

				assert.isFalse( mockup.enabled, 'Controller.enabled property value' );
				assert.areSame( 1, mockup.fire.callCount, 'Controller.fire calls count' );
				assert.areSame( 'disabled', mockup.fire.args[ 0 ][ 0 ], 'Controller.fire event name' );
			},

			'test Controller.disable event skipping': function() {
				// Event `disabled` should not be fired, when Controller is already disabled.
				var mockup = this.mockup;

				mockup.fire = sinon.spy();

				mockup.disable();

				assert.isFalse( mockup.enabled, 'Controller.enabled property value' );
				assert.areSame( 0, mockup.fire.callCount, 'Controller.fire calls count' );
			},

			'test Controller.enable': function() {
				var mockup = this.mockup;

				mockup.fire = sinon.spy();

				mockup.enable();

				assert.isTrue( mockup.enabled, 'Controller.enabled property value' );
				assert.areSame( 1, mockup.fire.callCount, 'Controller.fire calls count' );
				assert.areSame( 'enabled', mockup.fire.args[ 0 ][ 0 ], 'Controller.fire event name' );
			},

			'test Controller.enable event skipping': function() {
				// Event `enabled` should not be fired, when Controller is already enabled.
				var mockup = this.mockup;

				mockup.fire = sinon.spy();

				// Force mockup to be seen as enabled.
				mockup.enabled = true;

				mockup.enable();

				assert.isTrue( mockup.enabled, 'Controller.enabled property value' );
				assert.areSame( 0, mockup.fire.callCount, 'Controller.fire calls count' );
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
						enabled: true,
						editableDecorator: {
							removeMarkup: function() { removeMarkupCalls += 1; }
						},
						ui: {
							hide: sinon.spy()
						},
						close: Controller.prototype.close,
						disable: sinon.spy()
					};

				controllerMockup.close();

				assert.areSame( 1, issueClearCalls, 'Controller.issue.clear calls count' );
				assert.areSame( 1, removeMarkupCalls, 'Controller.editableDecorator.removeMarkupCalls calls count' );
				assert.areSame( 1, controllerMockup.ui.hide.callCount, 'ui.hide call count' );
				assert.areSame( 1, controllerMockup.disable.callCount, 'Controller.disable calls count' );

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
				var controllerMock = new ControllerMockup(),
					ret;
				// We're using real showIssue().
				controllerMock.showIssue = Controller.prototype.showIssue;
				// List must be set.
				controllerMock.issues.list = [ 3, 5, 7 ];
				// Function moveTo must return true.
				var moveToMock = controllerMock.issues.moveTo = sinon.spy( function() {
					return true;
				} );

				ret = controllerMock.showIssue( 2 );

				assert.isTrue( ret, 'Return value' );
				assert.areSame( 1, moveToMock.callCount, 'issues.moveTo calls count' );
				assert.isTrue( moveToMock.alwaysCalledWithExactly( 2 ), 'issues.moveTo params' );
			},


			'test Controller.showIssue with object': function() {
				// When calling showIssue with an object, it should call
				// indexOf with the issue to get its index.
				var issue = {},
					issueIndex = 2,
					moveToMock = sinon.spy( function() {
						return true;
					} ),
					indexOfMock = sinon.spy( function() {
						return issueIndex;
					} ),
					controllerMock = new ControllerMockup(),
					ret;

				controllerMock.issues.indexOf = indexOfMock;
				controllerMock.issues.moveTo = moveToMock;
				controllerMock.issues.list = [ 3, 5, issue ];

				controllerMock.showIssue = Controller.prototype.showIssue;

				ret = controllerMock.showIssue( issue );

				assert.areSame( 1, indexOfMock.callCount, 'issues.indexOf calls count' );
				assert.isTrue( indexOfMock.alwaysCalledWithExactly( issue ), 'isseus.indexOf params' );


				assert.isTrue( ret, 'Return value' );
				assert.areSame( 1, moveToMock.callCount, 'issues.moveTo calls count' );
				assert.isTrue( moveToMock.alwaysCalledWithExactly( issueIndex ), 'issues.moveTo params' );
			},

			'test Controller.showIssue to focused elem': function() {
				// If showIssue will be called with currently focused item,
				// method should not call once again all the internals.
				// Note that issues.getItem and issues.getFocused needs to return
				// same thing.
				var moveToMock = sinon.spy( function() {} ),
					controllerMock = {
						issues: {
							moveTo: moveToMock,
							getFocused: sinon.spy( function() {
								return 3;
							} ),
							getItem: sinon.spy( function() {
								return 3;
							} )
						},
						showIssue: Controller.prototype.showIssue
					};

				assert.isTrue( controllerMock.showIssue( 1 ), 'Return value' );
				assert.areSame( 0, moveToMock.callCount, 'issues.moveTo calls count' );
			},

			'test Controller.showIssueByElement': function() {
				var element = {},
					issue = {},
					getIssueByElementMock = sinon.spy( function() {
						return issue;
					} ),
					controllerMock = {
						issues: {
							getIssueByElement: getIssueByElementMock
						},
						showIssue: sinon.spy( function() {
							return true;
						} ),
						showIssueByElement: Controller.prototype.showIssueByElement
					},
					ret;

				ret = controllerMock.showIssueByElement( element );

				assert.areSame( 1, getIssueByElementMock.callCount, 'IssueList.getIssueByElement calls count' );
				assert.areSame( element, getIssueByElementMock.args[ 0 ][ 0 ], 'IssueList.getIssueByElement first argument' );

				// Ensure that controller.showIssue was called.
				assert.areSame( 1, controllerMock.showIssue.callCount, 'Controller.showIssue calls count' );
				assert.areSame( issue, controllerMock.showIssue.args[ 0 ][ 0 ], 'Controller.showIssue first argument' );

				assert.isTrue( ret, 'Return value' );
			},

			'test Controller.showIssueByElement invalid': function() {
				// We'll use DOM element which is not associated with any issue.
				var element = {},
					getIssueByElementMock = sinon.spy( function() {
						return null;
					} ),
					controllerMock = {
						issues: {
							getIssueByElement: getIssueByElementMock
						},
						showIssue: sinon.spy( function() {
						} ),
						showIssueByElement: Controller.prototype.showIssueByElement
					},
					ret;

				ret = controllerMock.showIssueByElement( element );

				// Ensure that controller.showIssue was called.
				assert.areSame( 0, controllerMock.showIssue.callCount, 'Controller.showIssue calls count' );

				assert.isFalse( ret, 'Return value' );
			},

			'test Controller.showIssue non-existing issue': function() {
				// In case of invalid index, moveToMock will detect it and
				// return false. showIssue should return false too.
				var moveToMock = sinon.spy( function() {
						return false;
					} ),
					controllerMock = new ControllerMockup(),
					ret;

				controllerMock.showIssue = Controller.prototype.showIssue;

				ret = controllerMock.showIssue( -1 );

				assert.isFalse( ret, 'Return value' );
				assert.areSame( 0, moveToMock.callCount, 'issues.moveTo calls count' );
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

		// This method will patch all the properties required to run Controller.exec
		// method.
		// @param {Object} controllerMock Mockup to be pathed.
		function patchMockupForExecMethod( controllerMockup ) {
			controllerMockup.ui = {
				show: sinon.spy()
			};

			controllerMockup.editableDecorator.applyMarkup = sinon.spy();
			controllerMockup.engine = {
				process: sinon.spy()
			};

			controllerMockup.editor = {
				getData: sinon.spy()
			};

			controllerMockup.enable = sinon.spy();
			controllerMockup.disable = sinon.spy();
			controllerMockup.editableDecorator.resolveEditorElements = sinon.spy();
			controllerMockup.editableDecorator.markIssues = sinon.spy();
			controllerMockup.ui.update = sinon.spy();
			controllerMockup.fire = sinon.spy();
		}
	} );
} )();