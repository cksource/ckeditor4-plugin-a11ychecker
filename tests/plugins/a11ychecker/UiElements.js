/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker */

(function() {
	'use strict';

	var tests = {
		'Test HBox: addChild': function() {
			var box = this._getHBox(),
				childComponent = this._getButton();

			assert.areSame( 0, box.children.length, 'Invalid children count after init' );
			assert.areSame( 0, box.element.getChildCount(), 'Invalid elements children count after init' );

			box.addChild( childComponent );

			// Checking the box.children array;
			assert.areSame( 1, box.children.length, 'Invalid children count after addChild()' );
			assert.areSame( childComponent, box.children[ 0 ], 'Invalid child assigned to box.children' );

			// Checking box.element children.
			assert.areSame( 1, box.element.getChildCount(), 'Invalid elements children count after addChild()' );
			assert.areSame( childComponent.element, box.element.getChild( 0 ), 'Invalid child assigned to box.element' );

			assert.areSame( box, childComponent.parent, 'Invalid parent for childComponent' );
		},

		'Test HBox: addChild - move to another parent': function() {
			var box = this._getHBox(),
				box2 = this._getHBox(),
				childComponent = this._getButton();

			box.addChild( childComponent );
			// Now we add childComponent to box2 so it should be removed from box.
			box2.addChild( childComponent );

			// Checking the box.children array;
			assert.areSame( 0, box.children.length, 'Invalid children count in initial box' );
			// Checking box.element children.
			assert.areSame( 0, box.element.getChildCount(), 'Invalid elements children count in initial box' );

			// Checking the box2.children array;
			assert.areSame( 1, box2.children.length, 'Invalid children count in initial box2' );
			// Checking box2.element children.
			assert.areSame( 1, box2.element.getChildCount(), 'Invalid elements children count in initial box2' );
		},

		'Test HBox: removeChild': function() {
			var box = this._getHBox(),
				childComponent = this._getButton();

			box.addChild( childComponent );
			box.removeChild( childComponent );

			// Checking the box.children array;
			assert.areSame( 0, box.children.length, 'Invalid children count after removeChild()' );
			// Checking box.element children.
			assert.areSame( 0, box.element.getChildCount(), 'Invalid elements children count after removeChild()' );
		},

		'Test UiComponent hide()': function() {
			var component = this._getMockUiComponent();

			component.hide();
			assert.areEqual( 'none', component.element.getStyle( 'display' ), 'Invalid value for elements display style' );
		},

		'Test UiComponent show()': function() {
			var component = this._getMockUiComponent();

			component.hide();
			component.show();
			assert.areEqual( '', component.element.getStyle( 'display' ), 'Invalid value for elements display style' );
		},

		/**
		 * Returns the simplest possible HBox object.
		 */
		_getHBox: function() {
			return new CKEDITOR.ui.HBox();
		},

		_getButton: function() {
			return new CKEDITOR.ui.Button();
		},

		_getMockUiComponent: function() {
			return new CKEDITOR.ui.MockUiComponent();
		}
	};

	// Needs to load external file before progressing with tests.
	var uiComponentPath = '/apps/ckeditor/plugins/a11ychecker/UiComponent.js';
	CKEDITOR.scriptLoader.load( uiComponentPath, function() {
		/**
		 * This is a mockup class, which can be instanced. By design UiComponent should not be
		 * instanced, that's why we need Mock here.
		 *
		 * @class
		 * @extends CKEDITOR.ui.UiComponent
		 */
		CKEDITOR.ui.MockUiComponent = CKEDITOR.tools.createClass( {
			base: CKEDITOR.ui.UiComponent,
			/**
			 * Creates an instance.
			 *
			 * @constructor
			 */
			$: function() {
				this.base();
			}
		} );

		bender.test( tests );
	} );
})();