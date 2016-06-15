/**
 * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get( {
		name: 'AttributeRename',
		callback: function( AttributeRename ) {
			function AttributeRenameDefault( issue ) {
				AttributeRename.call( this, issue );
			}

			AttributeRenameDefault.prototype = new AttributeRename();

			AttributeRenameDefault.prototype.constructor = AttributeRenameDefault;

			CKEDITOR.tools.extend( AttributeRenameDefault.prototype, {
				display: function( form ) {
					var element = this.issue.element,
						proposedValue = element.getAttribute( this.attributeTargetName ) ||
						element.getAttribute( this.attributeName ) || '';

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
		}
	} );
}() );
