/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: fakeobjects */

/**
 * @fileoverview An integration test suite with fakeobjects plugin.
 */

( function() {
	'use strict';

	bender.editor = true;

	bender.require( [
		'EditableDecorator',
		'mock/EditableDecoratorMockup'
	], function(
		EditableDecorator,
		EditableDecoratorMockup
	) {
		// Name of attribute used to identify nodes.
		var a11yCheckerIdAttr = EditableDecorator.ID_ATTRIBUTE_NAME,
			a11yCheckerIdAttrFull = EditableDecorator.ID_ATTRIBUTE_NAME_FULL;

		bender.test( {
			setUp: function() {
				this.mockup = new EditableDecoratorMockup();
				// These tests require us to use read editor, because of restoreRealElement dependency.
				this.mockup.editor = this.editor;
			},

			'test EditableDecorator.applyMarkup to fakeobjects': function() {
				// We also need to take care of encoded fakeobjects.
				var editable = this.mockup.editable(),
					editor = this.editor;

				this.mockup.loadContentFrom( 'fakeObjectContent' );
				this.mockup.applyMarkup();

				var anchorFakeObject = editable.findOne( '.cke_anchor' ),
					iframeFakeObject = editable.findOne( '.cke_iframe' );

				// Cast fake object to CKEDITOR.dom.element.
				anchorFakeObject = editor.restoreRealElement( anchorFakeObject );
				iframeFakeObject = editor.restoreRealElement( iframeFakeObject );

				// Now checking attribute in both objects.
				assert.isTrue( anchorFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Anchor fakeobj contains ' + a11yCheckerIdAttrFull + ' attribute' );
				assert.areSame( '4', anchorFakeObject.data( a11yCheckerIdAttr ),
					'Anchor have valid ' + a11yCheckerIdAttrFull + ' attr value'  );

				assert.isTrue( iframeFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Iframe fakeobj contains ' + a11yCheckerIdAttrFull + ' attribute' );
				assert.areSame( '5', iframeFakeObject.data( a11yCheckerIdAttr ),
					'Iframe have valid ' + a11yCheckerIdAttrFull + ' attr value'  );
			},

			'test EditableDecorator.removeMarkup from fakeobjects': function() {
				// We need to ensure that our node id attribute is removed in removeMarkup().
				var editable = this.mockup.editable(),
					editor = this.editor;

				this.mockup.loadContentFrom( 'fakeObjectMarkupApplied' );
				this.mockup.removeMarkup();

				var anchorFakeObject = editable.findOne( '.cke_anchor' ),
					iframeFakeObject = editable.findOne( '.cke_iframe' );

				// Cast fake object to CKEDITOR.dom.element.
				anchorFakeObject = editor.restoreRealElement( anchorFakeObject );
				iframeFakeObject = editor.restoreRealElement( iframeFakeObject );

				// Now checking attribute in both objects.
				assert.isFalse( anchorFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Attr ' + a11yCheckerIdAttrFull + ' removed from anchor' );

				assert.isFalse( iframeFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Attr ' + a11yCheckerIdAttrFull + ' removed from iframe' );
			},

			'test EditableDecorator.applyMarkup fakeobjects skipped without plugin': function() {
				// There's no reason to modify fakeobject elements if there's no fakeobject plugin.
				var editable = this.mockup.editable(),
					editor = this.editor;

				// We need to set dummy editor, which will not contain fakeobject plugin.
				this.mockup.editor = {
					plugins: {}
				};

				this.mockup.loadContentFrom( 'fakeObjectContent' );
				this.mockup.applyMarkup();

				var anchorFakeObject = editable.findOne( '.cke_anchor' );

				// Cast fake object to CKEDITOR.dom.element.
				anchorFakeObject = editor.restoreRealElement( anchorFakeObject );

				assert.isFalse( anchorFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Anchor fakeobj has no ' + a11yCheckerIdAttrFull + ' attribute' );
			},

			'test EditableDecorator.removeMarkup fakeobjects skipped without plugin': function() {
				// There's no reason to modify fakeobject elements if there's no fakeobject plugin.
				var editable = this.mockup.editable(),
					editor = this.editor;

				// We need to set dummy editor, which will not contain fakeobject plugin.
				this.mockup.editor = {
					plugins: {}
				};

				this.mockup.loadContentFrom( 'fakeObjectMarkupApplied' );
				this.mockup.removeMarkup();

				var anchorFakeObject = editable.findOne( '.cke_anchor' );

				// Cast fake object to CKEDITOR.dom.element.
				anchorFakeObject = editor.restoreRealElement( anchorFakeObject );

				assert.isTrue( anchorFakeObject.hasAttribute( a11yCheckerIdAttrFull ),
					'Anchor attribute ' + a11yCheckerIdAttrFull + ' was not removed' );
			}
		} );
	} );
} )();
