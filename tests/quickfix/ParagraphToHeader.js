/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: a11ychecker,unit */

( function() {
	'use strict';

	bender.require( [ 'helpers/quickFixTest', 'mocking' ], function( quickFixTest, mocking ) {
		var ParagraphToHeader,
			tests = {
				setUp: function() {
					ParagraphToHeader = this.quickFixType;
				},

				'test paragraphToH1': function() {
					assert.areSame( 1, this._callGetPreferredLevel( '#paragraphToH1', 'p' ), 'Invalid ret value' );
				},

				'test paragraphToH2': function() {
					assert.areSame( 2, this._callGetPreferredLevel( '#paragraphToH2', 'p' ), 'Invalid ret value' );
				},

				'test paragraphToH6': function() {
					assert.areSame( 6, this._callGetPreferredLevel( '#paragraphToH6', 'p' ), 'Invalid ret value' );
				},

				'test paragraphToH6Limit': function() {
					// In this TC paragraph will be preceeded by h6, we must ensure that it won't create h7.
					assert.areSame( 6, this._callGetPreferredLevel( '#paragraphToH6Limit', 'p' ), 'Invalid ret value' );
				},

				'test ParagraphToHeader._getPossibleLevels': function() {
					var editorMock = {
							config: {
								format_tags: 'p;h1;h2;h3;h4;h5;h6;pre;address;div'
							},
							filter: {
								check: sinon.stub().returns( true )
							}
						},
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 1, ret.min, 'ret.min' );
					assert.areSame( 6, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._getPossibleLevels no levels': function() {
					// What if format_tags config is empty? Then use default 1-6.
					var editorMock = {
							config: {
								format_tags: ''
							},
							filter: {
								check: sinon.stub().returns( true )
							}
						},
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 1, ret.min, 'ret.min' );
					assert.areSame( 6, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._getPossibleLevels out of order': function() {
					var editorMock = {
							config: {
								format_tags: 'p;h2;h3;h5;h1;h4;address;div'
							},
							filter: {
								check: sinon.stub().returns( true )
							}
						},
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 1, ret.min, 'ret.min' );
					assert.areSame( 5, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._getPossibleLevels restricted': function() {
					var editorMock = {
							config: {
								format_tags: 'p;h2;h3;h4;address;div'
							},
							filter: {
								check: sinon.stub().returns( true )
							}
						},
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 2, ret.min, 'ret.min' );
					assert.areSame( 4, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._getPossibleLevels ACF integration': function() {
					var editorMock = {
							config: {
								format_tags: 'p;h2;h3;h4;address;div'
							},
							filter: {
								check: function( tagName ) {
									// Drop all header x elements except h3.
									return tagName == 'h3';
								}
							}
						},
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 3, ret.min, 'ret.min' );
					assert.areSame( 3, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._getPossibleLevels missing config': function() {
					var editorMock = {
							config: {
							},
							filter: {
								check: sinon.stub().returns( true )
							}
						},
						// No exception should be thrown.
						ret = ParagraphToHeader.prototype._getPossibleLevels.call( {}, editorMock );

					assert.areSame( 1, ret.min, 'ret.min' );
					assert.areSame( 6, ret.max, 'ret.max' );
				},

				'test ParagraphToHeader._removeBoldTag - removing strong': function() {
					var issueElement = CKEDITOR.document.getById( 'suspiciousStrong' ),
						ret = ParagraphToHeader.prototype._removeBoldTag.call( {
							issue: {
								element: issueElement
							}
						} );

					assert.areEqual( 0, issueElement.find( 'strong' ).count(), 'Strong was removed' );
					assert.areEqual( 'Should be converted to h1.', issueElement.getHtml(), 'Inner HTML' );
				},

				'test ParagraphToHeader._removeBoldTag - removing b': function() {
					var issueElement = CKEDITOR.document.getById( 'suspiciousB' ),
						ret = ParagraphToHeader.prototype._removeBoldTag.call( {
							issue: {
								element: issueElement
							}
						} );

					assert.areEqual( 0, issueElement.find( 'b' ).count(), 'B element was removed' );
					assert.areEqual( 'Should be converted to h1.', issueElement.getHtml(), 'Inner HTML' );
				},

				'test ParagraphToHeader._removeBoldTag - no element child': function() {
					var issueElement = CKEDITOR.document.getById( 'textParagraph' ),
						ret = ParagraphToHeader.prototype._removeBoldTag.call( {
							issue: {
								element: issueElement
							}
						} );

					assert.areEqual( 'foo bar', issueElement.getHtml(), 'Inner HTML' );
				},

				'test ParagraphToHeader._removeBoldTag - multiple strong': function() {
					// If multiple strongs are in the same element, then they should not be removed.
					var issueElement = CKEDITOR.document.getById( 'multipleStrongs' ),
						ret = ParagraphToHeader.prototype._removeBoldTag.call( {
							issue: {
								element: issueElement
							}
						} );

					assert.areEqual( 3, issueElement.find( 'strong' ).count(), 'Strong elements were not removed' );
				},

				// This function creates an editor mock, with given "editable" and calls
				// _getPreferredLevel method.
				_callGetPreferredLevel: function( editable, issueElement ) {
					if ( typeof editable === 'string' ) {
						editable = CKEDITOR.document.findOne( editable );
					}

					if ( typeof issueElement === 'string' ) {
						issueElement = editable.findOne( issueElement );
					}

					window.editable = editable;
					window.issueElement = issueElement;

					var editorMock = {
							editable: sinon.stub().returns( editable )
						},
						qfMock = {
							issue: {
								element: issueElement
							},
							_getPreferredLevel: ParagraphToHeader.prototype._getPreferredLevel
						};

					return qfMock._getPreferredLevel( editorMock );
				}
			};
		quickFixTest( 'ParagraphToHeader', tests );
	} );
} )();
