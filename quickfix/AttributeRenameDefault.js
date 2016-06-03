/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	'use strict'

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'AttributeRename',
		callback: function( QuickFix ) {
			function AttributeRenameDefault(issue) {
				QuickFix.call(this, issue);
			}

			AttributeRenameDefault.prototype = new QuickFix();

			AttributeRenameDefault.prototype.constructor = AttributeRenameDefault;

			CKEDITOR.tools.extend( AttributeRenameDefault.prototype, {
				display: function( form ) {
					var proposedValue = this.issue.element.getAttribute( this.attributeTargetName ) ||
						this.issue.element.getAttribute( this.attributeName ) || '';

					form.setInputs( {
						value: {
							type: 'text',
							label: 'Value',
							value: proposedValue
						}
					} );
				}
			}, true );

			CKEDITOR.plugins.a11ychecker.quickFixes.add( 'AttributeRenameDefault', AttributeRenameDefault );
		} } );
}() );
