/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker,toolbar */

(function() {
	'use strict';

	var tests = {
		/**
		 * This is very important test
		 * 1. it checks if quail is available
		 * 2. it performs Quail check against a dummy text, and saves results
		 *		into this.quailTotal and this.quailResults - so they can be used
		 *		to read-only later on
		 *
		 * This is kind of tricky usage, but will do for the moment.
		 */
		'Test Quail availability': function() {
			var that = this;
			assert.isInstanceOf( Function, jQuery.fn.quail, 'Quail is not available' );

			var quailConfig = {
				guideline : [ 'imgHasAlt', 'aMustNotHaveJavascriptHref', 'aAdjacentWithSameResourceShouldBeCombined', 'pNotUsedAsHeader' ],
				jsonPath : '/apps/ckeditor/plugins/a11ychecker/bower_components/quail/dist',
				complete: function( total, results ) {
					resume();
					console.log( 'quail complete called' );
					that.quailTotal = total;
					that.quailResults = results;
					//that.quailResults = total.results;
					console.log( that );
				}
			};

			// Performs Quail checkign, all the results should be saved to this.quail* props.
			$( '#quailMarkupSource' ).quail( quailConfig );
			wait();
		},

		'Test Issues creation': function() {
			this.issues = this._getIssues();
			assert.areEqual( 'object', typeof this.issues, 'Issues should be an object' );
			assert.isInstanceOf( CKEDITOR.plugins.a11ychecker.Issues, this.issues );

			assert.isInstanceOf( Object, this.issues.issues );
			assert.areSame( 0, this.issues.issuesCount, 'Initial issues list should be empty' );
		},

		'Test clear()': function() {
			this.issues = this._getIssues();
			this.issues.issues = { 'foo': 'bar' };
			this.issues.issuesCount = 1;

			this.issues.clear();

			assert.areSame( 0, CKEDITOR.tools.objectKeys( this.issues.issues ).length, 'Issues object was not cleaned' );
			assert.areSame( 0, this.issues.issuesCount, 'Issues count was not cleaned' );
		},

		'Test issues assign': function() {
			this.issues = this._getIssues();
			this.issues.setQuailIssues( this.quailTotal.results );

			var expectedKeys = [ 'imgHasAlt', 'aAdjacentWithSameResourceShouldBeCombined' ];

			arrayAssert.itemsAreEqual( expectedKeys, CKEDITOR.tools.objectKeys( this.issues.issues ), 'Invalid keys for this.issues.issues' );
			assert.areSame( 3, this.issues.issuesCount, 'Invalid count of total issues found' );

			assert.areEqual( 2, this.issues.issues[ 'imgHasAlt' ].length, 'Invalid count of errors: imgHasAlt' );
			assert.areEqual( 1, this.issues.issues[ 'aAdjacentWithSameResourceShouldBeCombined' ].length, 'Invalid count of errors: aAdjacentWithSameResourceShouldBeCombined' );
		},

		'Test iterator': function() {
			var expectedIssueTypes = [ 'imgHasAlt', 'imgHasAlt', 'aAdjacentWithSameResourceShouldBeCombined' ],
				iterationsCount = 0;

			this.issues = this._getIssues();
			this.issues.setQuailIssues( this.quailTotal.results );
			this.issues.each( function( element, issueType ) {
				assert.areSame( expectedIssueTypes[ iterationsCount ], issueType, 'Issue type mismatch for iteration: ' + iterationsCount );
				assert.isInstanceOf( CKEDITOR.dom.element, element, 'Element should be instance of CKEDITOR.dom.element' );
				iterationsCount++;
			} );

			assert.areEqual( 3, iterationsCount, 'Invalid iterations count' );

		},

		'Test issues are stored as CKEDITOR.dom.element': function() {
			this.issues = this._getIssues();
			this.issues.setQuailIssues( this.quailTotal.results );

			assert.isInstanceOf( CKEDITOR.dom.element, this.issues.issues[ 'imgHasAlt' ][ 0 ], 'Invalid type for issues property members' );
		},

		/**
		 * Returns the simplest possible Issues object.
		 */
		_getIssues: function() {
			/**
			 * @todo: this line was changed during CKFort to Bender port.
			 * For some reason we were not assigning editor to Issues object while testing.
			 * We need simplyfy it and it might be good idea to use real editor here.
			 */
			//return new CKEDITOR.plugins.a11ychecker.Issues( this.editor );
			return new CKEDITOR.plugins.a11ychecker.Issues( null );
		}
	};

	// Needs to load external file before progressing with tests.
	var issuesPath = '/apps/ckeditor/plugins/a11ychecker/Issues.js';
	CKEDITOR.scriptLoader.load( issuesPath, function() {
		window.setTimeout( function() {
			bender.test( tests );
		}, 230 );
	} );
})();