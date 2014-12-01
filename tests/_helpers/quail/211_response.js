
// Registers a global function which will return a typical Quail response object.
// It's in separate file, because it's pretty long and boring.

function getQuailResultsMockup() {
	'use strict';

	// Returns a Mockup of response given by Quail 2.1.1 to the HTML in #quailMarkupSource.
	return {
		totals: {
			severe: 0,
			moderate: 0,
			suggestion: 0
		},
		results: {
			aAdjacentWithSameResourceShouldBeCombined: {
				elements: [],
				test:
					{
						callback: 'aAdjacentWithSameResourceShouldBeCombined',
						tags: [ 'link', 'content' ],
						testability: 1,
						type: 'custom',
						guidelines: {
							wcag: {
								'2.4.4': {
									techniques: [ 'H2' ]
								}
							}
						},
						title: {
							en: 'Adjacent links that point to the same location should be merged'
						},
						description: {
							en: 'Because many users of screen-readers use links to navigate the page, providing two' +
							' links right next to eachother that points to the same location can be confusing. ' +
							'Try combining the links.'
						}
					}
			},
			aMustNotHaveJavascriptHref: {
				elements: [],
				test:
					{
						selector: 'a[href^="javascript:"]',
						tags: [ 'link', 'content' ],
						testability: 1,
						type: 'selector',
						guidelines: [],
						title: {
							en: 'Links should not use "javascript" in their location'
						},
						description: {
							en: 'Anchor (<code>a</code>.  elements may not use the "javascript" protocol in their "href" attributes.'
						}
					}
			},
			imgHasAlt: {
				elements: [],
				test:
					{
						selector: 'img:not(img[alt])',
						tags: [ 'image', 'content' ],
						testability: 1,
						type: 'selector',
						guidelines: {
							508: [ 'a' ],
							wcag: {
								'1.1.1': {
									techniques: [ 'F65', 'H37' ]
								}
							}
						},
						title: {
							en: 'Image elements must have an "alt" attribute'
						},
						description: {
							en: 'All <code>img</code> elements must have an alt attribute'
						}
					}
			}
		} // End of results.
	};
}