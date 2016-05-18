/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */

( function() {
	'use strict';

	bender.require( [
		'Controller',
		'mock/ControllerMockup',
		'Controller/CheckingMode',
		'mocking',
		'Localization'
	], function(
		Controller,
		ControllerMockup,
		CheckingMode,
		mocking,
		Localization
	) {
		bender.test( {
			setUp: function() {
				// Controller's mock.
				this.mockup = getControllerMockup();
				// Mockup for plugin's static namespace.
				this.pluginStaticMockup = {};
				// If there's no need to use full featured editor use it's mockup instead.
				this.editorMockup = {
					plugins: {
						a11ychecker: this.pluginStaticMockup
					},
					config: {}
				};

				this.mockup.editor = this.editorMockup;
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
					sort: sinon.spy(),
					getItem: sinon.spy(),
					count: function() {
						return 5;
					},
					on: mocking.spy()
				};

				this.mockup.showIssue = sinon.spy();

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

			'test Controller.check callback': function() {
				patchMockupForExecMethod( this.mockup );

				var listMock = {
					sort: mocking.spy(),
					count: mocking.spy( function() {
						return 2;
					} ),
					on: mocking.spy()
				};

				// Overwrite fire so it will prevent any extra logic. And we dont't
				// expect any events beside checked to be fired.
				this.mockup.fire = function() {
					return false;
				};

				this.mockup.engine.process = function( a11ychecker, scratchpad, completeCallback ) {
					completeCallback.call( a11ychecker, listMock );
				};

				var options = {
					callback: sinon.spy()
				};

				this.mockup.check( options );

				assert.areSame( 1, options.callback.callCount, 'Callback call count' );
				mocking.assert.calledWith( options.callback, false, listMock );
			},

			'test Controller.check gui featured call': function() {
				patchMockupForCheckMethod( this.mockup );

				this.mockup.check( {
					ui: true
				} );

				assert.areSame( 1, this.mockup.ui.show.callCount, 'ui show was called' );
				assert.areSame( 1, this.mockup.ui.update.callCount, 'ui update was called' );
			},

			'test Controller.check gui-less call': function() {
				patchMockupForCheckMethod( this.mockup );

				this.mockup.check( {
					ui: false
				} );

				assert.areSame( 0, this.mockup.ui.show.callCount, 'ui show was not called' );
				assert.areSame( 0, this.mockup.ui.update.callCount, 'ui update was not called' );
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
				mockup.setMode = sinon.spy();

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

			'test Controller.setMode': function() {
				// We'll replace CheckingMode.init method, to see if it was called.
				var modeInitMock = sinon.spy(),
					revert = bender.tools.replaceMethod( CheckingMode.prototype, 'init', modeInitMock );

				try {
					this.mockup.setMode( Controller.modes.CHECKING );

					assert.isInstanceOf( CheckingMode, this.mockup.mode, 'mode property has a valid type' );
					assert.areSame( 1, modeInitMock.callCount, 'Created mode object attach calls count' );
				} catch ( e ) {
					// Propagate exception.
					throw e;
				} finally {
					revert();
				}
			},

			'test Controller.setMode with existing mode': function() {
				// In case of existing mode, the old one should be closed.
				var oldMode = {
					close: sinon.spy()
				};

				this.mockup.mode = oldMode;

				// We don't need a real editor here, less dependencies.
				this.mockup.editor = null;
				this.mockup.setMode( Controller.modes.CHECKING );

				assert.areSame( 1, oldMode.close.callCount, 'Old mode close() calls count' );
				assert.areNotSame( this.mockup.mode, oldMode, 'mode property changed' );
			},

			'test Controller.setMode invalid value': function() {
				// In case of invalid value it should thorw an exception.
				var exceptionMessage = null;

				try {
					this.mockup.setMode( 5000 );
				} catch ( e ) {
					exceptionMessage = String( e );
				} finally {
					assert.isNotNull( exceptionMessage, 'Exception was thrown' );
					assert.areSame( 'Error: Invalid mode value, use Controller.modes members',
						exceptionMessage, 'Exception message' );
				}
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
					issuesMock = {
						clear: function() {
							issueClearCalls += 1;
						}
					},
					controllerMockup = {
						issues: issuesMock,
						enabled: true,
						ui: {
							hide: sinon.spy()
						},
						close: Controller.prototype.close,
						disable: sinon.spy(),
						modeType: 1
					},
					modeClose = mocking.mockProperty( 'mode.close', controllerMockup ),
					preferredIssueUnset = mocking.mockProperty( 'preferredIssueFinder.unset', controllerMockup );

				controllerMockup.close();

				assert.areSame( 1, issueClearCalls, 'Controller.issue.clear calls count' );
				assert.areSame( 1, controllerMockup.ui.hide.callCount, 'ui.hide call count' );
				assert.areSame( 1, controllerMockup.disable.callCount, 'Controller.disable calls count' );
				assert.areSame( 1, preferredIssueUnset.callCount, 'Controller.preferredIssueFinder.unset call count' );

				assert.areSame( 1, modeClose.callCount, 'Controller.mode.close call count' );
				// Ensure that mode was unset.
				assert.isNull( controllerMockup.modeType, 'mode property reset' );
				assert.isNull( controllerMockup.modeType, 'modeType property reset' );
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
						},
						on: mocking.spy()
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
						},
						on: mocking.spy()
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
						},
						on: mocking.spy()
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

			'test Controller.listen for checking mode': function() {
				patchMockupForExecMethod( this.mockup );

				this.mockup.setMode = mocking.spy();
				mocking.mockProperty( 'mockup.issues.getFocused', this, function() {
					return null;
				} );

				// Prerequisites.
				this.mockup.enabled = true;
				this.mockup.modeType = Controller.modes.CHECKING;

				this.mockup.listen();

				assert.areSame( 1, this.mockup.setMode.callCount, 'Controller.setMode calls count' );
				mocking.assert.calledWith( this.mockup.setMode, Controller.modes.LISTENING );
			},

			'test Controller.listen for listening mode': function() {
				// When AC is already in listening mode it should call check() method.
				patchMockupForExecMethod( this.mockup );

				this.mockup.setMode = mocking.spy();
				this.mockup.check = mocking.spy();

				// Prerequisites.
				this.mockup.enabled = true;
				this.mockup.modeType = Controller.modes.LISTENING;

				this.mockup.listen();

				assert.areSame( 0, this.mockup.setMode.callCount, 'Controller.setMode calls count' );
				mocking.assert.calledWith( this.mockup.check );
			},

			'test Controller.listen for disabled AC': function() {
				// When AC is disabled, nothing should happen.
				patchMockupForExecMethod( this.mockup );

				this.mockup.setMode = mocking.spy();
				this.mockup.check = mocking.spy();

				// Prerequisites.
				this.mockup.enabled = false;

				this.mockup.listen();

				assert.areSame( 0, this.mockup.setMode.callCount, 'Controller.setMode calls count' );
				assert.areSame( 0, this.mockup.check.callCount, 'Controller.check calls count' );
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
						showIssue: Controller.prototype.showIssue,
						viewerController: {}
					};

				mocking.mockProperty( 'viewer.navigation.parts.next.focus', controllerMock.viewerController );

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
			},

			'test Controller.applyQuickFix': function() {
				var quickFix = {
						fix: sinon.spy()
					},
					formAttributes = {},
					controllerMock = new ControllerMockup();

				controllerMock._onQuickFix = sinon.spy();
				controllerMock.applyQuickFix = Controller.prototype.applyQuickFix;

				// Call method.
				controllerMock.applyQuickFix( quickFix, formAttributes );

				assert.areEqual( 1, quickFix.fix.callCount, 'quickFix.fix call count' );
				sinon.assert.calledWith( quickFix.fix, formAttributes );
			},

			'test Controller._onQuickFix': function() {
				var quickFix = {
						issue: {}
					},
					expectedEvent = {
						quickFix: quickFix,
						issue: quickFix.issue
					},
					controllerMock = new ControllerMockup();

				controllerMock._onQuickFix = Controller.prototype._onQuickFix;

				// Call method.
				controllerMock._onQuickFix( quickFix );

				// Ensure that fixed event was fired.
				sinon.assert.calledWith( controllerMock.fire, 'fixed', expectedEvent );

				assert.areEqual( 1, controllerMock.check.callCount, 'Controller.exec call count' );
			},

			'test Controller._onQuickFix passes fixed issue offset': function() {
				// In this test we want to make sure that _onQuickFix will put an
				// extra argument (issue offset) to Controller.check.
				// This will allow us to set the UI focus to the next element to
				// the fixed one.
				var quickFix = {
						issue: {}
					},
					controllerMock = new ControllerMockup();

				controllerMock.issues = {
					indexOf: sinon.spy( function() {
						return 3;
					} )
				};

				controllerMock._onQuickFix = Controller.prototype._onQuickFix;

				// Call method.
				controllerMock._onQuickFix( quickFix );

				assert.areEqual( 1, controllerMock.check.callCount, 'Controller.exec call count' );
				sinon.assert.calledWith( controllerMock.check, {
					ui: true
				} );
			},

			'test Controller._onQuickFix event cancel': function() {
				var controllerMock = new ControllerMockup();

				assert.areEqual( 0, controllerMock.exec.callCount, '#0' );
				controllerMock.fire = sinon.spy( function() {
					return false;
				} );
				controllerMock._onQuickFix = Controller.prototype._onQuickFix;

				// Call method.
				controllerMock._onQuickFix( {} );

				// Because event was canceled, we should not call exec method.
				assert.areEqual( 0, controllerMock.check.callCount, 'Controller.exec call count' );
			},

			'test Controller.onNoIssues': function() {
				var mock = {
						close: sinon.spy(),
						onNoIssues: Controller.prototype.onNoIssues
					},
					originalAlert = window.alert,
					alertMock = sinon.spy();

				mocking.mockProperty( 'editor.lang.a11ychecker.noIssuesMessage', mock, 'Message' );

				try {
					window.alert = alertMock;

					mock.onNoIssues();

					assert.areEqual( 1, alertMock.callCount, 'Alert call count' );
					assert.areEqual( 1, mock.close.callCount, 'Accessibility Checker close calls' );
				} catch ( e ) {
					// Repropagate.
					throw e;
				} finally {
					window.alert = originalAlert;
				}
			},

			'test Controller.exec calls onNoIssues': function() {
				// Controller.onNoIssues should be called when no issues were found.
				this._testOnNoIssues( 1, 0 );
			},

			'test Controller.exec does not call onNoIssues': function() {
				// Controller.onNoIssues should not be called if there are issues.
				this._testOnNoIssues( 0, 1 );
			},

			'test Controller.exec does not call onNoIssues on checked cancel': function() {
				// We should not call Controller.onNoIssues if event was canceled.
				this._testOnNoIssues( 0, 0, function( mock ) {
					// Force fire to return false, as if it would if event was canceled.
					mock.fire = sinon.spy( function() {
						return false;
					} );
				} );
			},

			'test Controller.ignoreIssue': function() {
				var mock = {
						ignoreIssue: Controller.prototype.ignoreIssue
					},
					issueMock = {
						isIgnored: mocking.spy( function() {
							return true;
						} ),
						setIgnored: mocking.spy()
					};


				mocking.mockProperty( 'issues.getFocused', mock, function() {
					return issueMock;
				} );

				mocking.mockProperty( 'editableDecorator.markIssueElement', mock );

				mock.ignoreIssue();

				assert.areSame( 1, issueMock.isIgnored.callCount, 'issueMock.isIgnored call count');
				assert.areSame( 1, issueMock.setIgnored.callCount, 'issueMock.setIgnored call count');
				mocking.assert.alwaysCalledWith( issueMock.setIgnored, false );

				// Ensure that editableDecorator.markIssueElement is called.
				assert.areSame( 1, mock.editableDecorator.markIssueElement.callCount,
					'editableDecorator.markIssueElement call count' );
				mocking.assert.alwaysCalledWith( mock.editableDecorator.markIssueElement, issueMock, mock.issues );
			},

			'test Controller.attachEditorListeners beforeCommandExec': function() {
				// Checks if beforeCommandExec event on editor will trigget Controller.setMode.
				var editorMock = {},
					controllerMock = {
						setMode: mocking.spy(),
						enabled: true
					};
				CKEDITOR.event.implementOn( editorMock );

				Controller.prototype.attachEditorListeners.call( controllerMock, editorMock );

				editorMock.fire( 'beforeCommandExec', { name: 'foo' } );

				assert.areSame( 1, controllerMock.setMode.callCount, 'Controller.setMode call count' );
			},

			'test Controller.attachEditorListeners beforeCommandExec a11y': function() {
				// Event `beforeCommandExec` should not call a11ychecker.close if called command
				// is `a11ychecker`.
				var editorMock = {},
					controllerMock = {
						setMode: mocking.spy(),
						enabled: true
					};
				CKEDITOR.event.implementOn( editorMock );

				Controller.prototype.attachEditorListeners.call( controllerMock, editorMock );

				editorMock.fire( 'beforeCommandExec', { name: 'a11ychecker' } );

				assert.areSame( 0, controllerMock.setMode.callCount, 'Controller.setMode call count' );
			},

			'test Controller.attachEditorListeners beforeCommandExec canceled': function() {
				// In this test we'll ensure that canceled beforeCommandExec, with a default
				// priority will prevent from calling Controller.setMode.
				var editorMock = {},
					controllerMock = {
						setMode: mocking.spy(),
						enabled: true
					};
				CKEDITOR.event.implementOn( editorMock );

				Controller.prototype.attachEditorListeners.call( controllerMock, editorMock );

				editorMock.once( 'beforeCommandExec', function( evt ) {
					evt.cancel();
				} );

				editorMock.fire( 'beforeCommandExec', { name: 'foo' } );

				assert.areSame( 0, controllerMock.setMode.callCount, 'Controller.setMode call count' );
			},

			'test Controller.getQuickFixLang': function() {
				this.pluginStaticMockup.quickFixesLang = 'en,nl,de,fr';
				this.editorMockup.config = {
					language: 'de',
					defaultLanguage: 'en'
				};

				assert.areEqual( 'de', this.mockup.getQuickFixLang() );
			},

			'test Controller.getQuickFixLang editor lang not in QF langs': function() {
				this.pluginStaticMockup.quickFixesLang = 'en,nl,de,fr';
				this.editorMockup.config = {
					language: 'br',
					defaultLanguage: 'en'
				};

				assert.areEqual( 'en', this.mockup.getQuickFixLang() );
			},

			'test Controller.getQuickFixLang different navigator language': function() {
				var prefLangStub = sinon.stub( Localization, 'getPreferredLanguage' ).returns( 'en' ),
					editorMock = this.editorMockup;

				this.pluginStaticMockup.quickFixesLang = 'en,nl,de,fr';
				editorMock.config = {
					defaultLanguage: 'fr'
				};

				try {
					assert.areEqual( 'en', this.mockup.getQuickFixLang(), 'Navigator language is used' );
					sinon.assert.calledWith( prefLangStub, editorMock.config.language, editorMock.config.defaultLanguage );
				} catch ( e ) {
					// Redirect the exception.
					throw e;
				} finally {
					prefLangStub.restore();
				}
			},

			/**
			 * A helper function to test Controller.onNoIssues method calls from Controller.exec.
			 *
			 * @param {Number} expectedCalls Expected call count to the onNoIssues method.
			 * @param {Number} issuesNumber Nuber of issues to be returned by issue list.
			 * @param {Number} mockAdjust Method to adjust Controller mockup, just before running exec.
			 * The mockup will be passed as a first argument.
			 */
			_testOnNoIssues: function( expectedCalls, issuesNumber, mockAdjust ) {
				// When checked event is canceled, the onNoIssues should not be called.
				patchMockupForExecMethod( this.mockup );

				this.mockup.showIssue = sinon.spy();

				var issueList = {
					sort: sinon.spy(),
					count: function() {
						return issuesNumber;
					},
					getItem: function() {
						return null;
					},
					on: mocking.spy()
				};

				if ( mockAdjust ) {
					mockAdjust( this.mockup );
				}

				// Actually in this case we'll have to make sure that engine.process will
				// call the callback.
				this.mockup.engine.process = function( controller, scratchpad, callback ) {
					callback( issueList );
				};

				// Actual exec call.
				this.mockup.exec();

				assert.areEqual( expectedCalls, this.mockup.onNoIssues.callCount, 'Controller.onNoIssues call count' );
			}
		} );

		function getControllerMockup() {
			return new Controller();
		}

		function getViewerControllerMockup() {
			var ret = new Controller();
			mocking.mockProperty( 'editor.fire', ret );
			return ret;
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
				getData: sinon.spy(),
				fire: sinon.spy()
			};

			controllerMockup.next = sinon.spy();
			controllerMockup.enable = sinon.spy();
			controllerMockup.disable = sinon.spy();
			controllerMockup.setMode = sinon.spy();
			controllerMockup.editableDecorator.resolveEditorElements = sinon.spy();
			controllerMockup.editableDecorator.markIssues = sinon.spy();
			controllerMockup.editableDecorator.removeMarkup = sinon.spy();
			controllerMockup.ui.update = sinon.spy();
			controllerMockup.fire = sinon.spy();
			controllerMockup.onNoIssues = sinon.spy();

			mocking.mockProperty( 'preferredIssueFinder.getFromListIndex', controllerMockup, function() {
				return 0;
			} );
		}

		function patchMockupForCheckMethod( controllerMockup ) {
			patchMockupForExecMethod( controllerMockup );

			controllerMockup.engine.process = function( a11ychecker, scratchpad, completeCallback ) {
				completeCallback.call( a11ychecker, {
					sort: mocking.spy(),
					count: mocking.spy(),
					on: mocking.spy()
				} );
			};

			controllerMockup.ui = {
				update: mocking.spy(),
				show: mocking.spy()
			};
		}
	} );
} )();
