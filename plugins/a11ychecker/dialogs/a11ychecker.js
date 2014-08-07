
/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Definition for a11ychecker plugin dialog.
 *
 */

'use strict';
alert('origin yaya');

CKEDITOR.dialog.add( 'a11ychecker', function( editor ) {
	var lang = editor.lang.a11ychecker;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: 'Label goes here',
				title: 'Title here',
				elements: [
					// Dialog window UI elements.
					{
						id: 'name',
						type: 'text',
						style: 'width: 100%;',
						label: 'Text input',
						'default': '',
						required: true
					}
				]
			}
		]
	};
} );