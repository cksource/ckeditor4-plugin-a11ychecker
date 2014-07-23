
/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Definition of issueTooltip. Dialog should display information
 * about type of a issue, and possible solutions.
 */

'use strict';
alert('issuehint.js added yay');

CKEDITOR.dialog.add( 'issuetooltip', function( editor ) {
	var lang = editor.lang.a11ychecker;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: 'foobar',
				title: 'foobar',
				elements: [
					// Dialog window UI elements.
					{
						id: 'title',
						type: 'text',
						style: 'width: 100%;',
						label: 'Issue type',
						'default': 'unknown'
					}
				]
			}
		]
	};
} );