/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: a11ychecker */

(function() {
	'use strict';

	var tests = {
			'test Select.setOptionsGrouped()': function() {
				var select = this._getSelect(),
					groups = [];

				select.setOptionsGrouped( groups );
				assert.areEqual( '', select.element.getHtml(), 'Invalid HTML for select after feeding with no groups' );

				groups = [
					{
						name: 'First group'
					},
					{
						name: 'Second "\'quoted\'" group'
					}
				];

				select.setOptionsGrouped( groups );

				// Checking children count
				var optgroupElements = select.element.find( 'optgroup' );
				assert.areSame( 2, optgroupElements.count(), 'Invalid count of optgroup.' );
				assert.areEqual( 'First group', optgroupElements.getItem( 0 ).getAttribute( 'label' ), 'Invalid label for first group' );
				assert.areEqual( 'Second "\'quoted\'" group', optgroupElements.getItem( 1 ).getAttribute( 'label' ), 'Invalid label for second group' );

				groups = [
					{
						name: 'first',
						options: {
							'a': 'A',
							'b': 'B'
						}
					},
					{
						name: 'second',
						options: {
							'c': 'C',
							'"': '"'
						}
					}
				];

				select.setOptionsGrouped( groups );

				var optionElements = select.element.find( 'optgroup option' );

				assert.areSame( 4, optionElements.count(), 'Invalid count of option tags' );
				assert.areSame( 'a', optionElements.getItem( 0 ).getAttribute( 'value' ), 'Invalid value for option at index 0' );
				assert.areSame( 'A', optionElements.getItem( 0 ).getText(), 'Invalid element text for option at index 0' );

				assert.areSame( '"', optionElements.getItem( 3 ).getAttribute( 'value' ), 'Invalid value for option at index 3' );
				assert.areSame( '"', optionElements.getItem( 3 ).getText(), 'Invalid element text for option at index 4' );
			},

			_getSelect: function() {
				return new CKEDITOR.ui.Select();
			}
		},
		// Needs to load external file before progressing with tests.
		uiComponentPath = '/apps/ckeditor/plugins/a11ychecker/UiComponent.js';

	CKEDITOR.scriptLoader.load( uiComponentPath, function() {
		bender.test( tests );
	} );
})();