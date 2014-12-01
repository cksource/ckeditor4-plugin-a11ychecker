
/**
 * Registers a global function which will return a typical Quail response object.
 * It's in separate file, because it's pretty long and boring.
 *
 * Remarks:
 * * "[object HTML*]" string represents DOMNodes/DOMElements objects.
 * * All test except "scriptsDoNotUseColorAlone" are marked as failed.
 */


function getQuailCollectionMockup() {
	/*jshint scripturl:true*/

	'use strict';

	// Returns a Mockup of tests collection given by Quail 2.2.8 to the HTML in #quailMarkupSource.
	var ret = [ {
		0: {
			listeners: {
				resolve: [ null, null, null ],
				timeout: [ null, null, null ]
			},
			timeout: 2,
			attributes: {
				element: 'http://www.cksource.com/',
				status: 'passed',
				selector: 'a[href="http://www.cksource.com"]',
				html: '<a href="http://www.cksource.com">CKSource website</a>'
			}
		},
		1: {
			listeners: {
				resolve: [ null, null, null ],
				timeout: [ null, null, null ]
			},
			timeout: 4,
			attributes: {
				element: 'javascript:foobar()',
				status: 'passed',
				selector: 'a[href="javascript:foobar()"]',
				html: '<a href="javascript:foobar()">Oldshool link</a>'
			}
		},
		2: {
			listeners: {
				resolve: [ null, null, null ],
				timeout: [ null, null, null ]
			},
			timeout: 6,
			attributes: {
				element: 'javascript:foobar2()',
				status: 'passed',
				selector: 'a[href="javascript:foobar2()"]',
				html: '<a href="javascript:foobar2()">Another bad link</a>'
			}
		},
		3: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: 8,
			attributes: {
				element: 'http://www.cksource.com/',
				status: 'failed',
				selector: 'a[href="http://www.cksource.com"]',
				html: '<a href="http://www.cksource.com">CKSource website</a>'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 4,
		attributes: {
			type: 'custom',
			testability: 1,
			title: {
				en: 'Adjacent links that point to the same location should be merged',
				nl: 'Voeg naast elkaar gelegen links die naar dezelfde locatie verwijzen samen'
			},
			description: {
				en: 'Because many users of screen-readers use links to navigate the page, providing two links' +
					' right next to eachother that point to the same location can be confusing. Try combining' +
					' the links.',
				nl: 'Veel gebruikers van schermlezers gebruiken links om op de pagina te navigeren. Voor' +
					' hen zijn naast elkaar gelegen links die naar dezelfde locatie verwijzen verwarrend.' +
					' Probeer de links samen te voegen.'
			},
			guidelines: {
				wcag: {
					'2.4.4': {
						techniques: [ 'H2', 'F89' ]
					},
					'2.4.9': {
						techniques: [ 'F89' ]
					},
					'4.1.2': {
						techniques: [ 'F89' ]
					}
				}
			},
			tags: [ 'link', 'content' ],
			callback: 'aAdjacentWithSameResourceShouldBeCombined',
			name: 'aAdjacentWithSameResourceShouldBeCombined',
			status: 'failed',
			complete: true
		},
		testComplete: null
	},
	{
		0: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: 'http://www.cksource.com/',
				selector: 'a[href="http://www.cksource.com"]',
				status: 'failed',
				html: '<a href="http://www.cksource.com" data-cacheid="id_0.05784848448820412"' +
					' style="visibility: visible;">CKSource website</a>'
			}
		},
		1: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: 'javascript:foobar()',
				selector: 'a[href="javascript:foobar()"]',
				status: 'failed',
				html: '<a href="javascript:foobar()" data-cacheid="id_0.2259478981141001"' +
					' style="visibility: visible;">Oldshool link</a>'
			}
		},
		2: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: 'javascript:foobar2()',
				selector: 'a[href="javascript:foobar2()"]',
				status: 'failed',
				html: '<a href="javascript:foobar2()" data-cacheid="id_0.5609192522242665"' +
					' style="visibility: visible;">Another bad link</a>'
			}
		},
		3: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: 'http://www.cksource.com/',
				selector: 'a[href="http://www.cksource.com"]',
				status: 'failed',
				html: '<a href="http://www.cksource.com" data-cacheid="id_0.6278089738916606"' +
					' style="visibility: visible;">CKSource website</a>'
			}
		},
		4: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: 'http://www.cksource.com/',
				selector: 'a[href="http://www.cksource.com"]',
				status: 'failed',
				html: '<a href="http://www.cksource.com" data-cacheid="id_0.08498003124259412"' +
					' style="visibility: visible;">CKSource website</a>'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 5,
		attributes: {
			type: 'selector',
			testability: 1,
			title: {
				en: 'All links must have a "title" attribute',
				nl: 'Alle links moeten een "title"-attribuut hebben'
			},
			description: {
				en: 'Every link must have a "title" attribute.',
				nl: 'Zorg ervoor dat elke link is voorzien van een "title"-attribuut.'
			},
			guidelines: [],
			tags: [ 'link', 'content' ],
			options: {
				selector: 'a:not(a[title])'
			},
			name: 'aMustHaveTitle',
			status: 'failed',
			complete: true
		},
		testComplete: null
	},
	{
		0: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLParagraphElement]',
				info: {
					acronyms: [ 'KISS\t\t' ]
				},
				status: 'failed',
				selector: 'p',
				html: '<p data-cacheid="id_0.9450893714092672" style="visibility: visible;">\t\t\tfoo' +
					' bar <span data-cacheid="id_0.5366379769984633" style="visibility: visible;">KISS</span></p>'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 1,
		attributes: {
			type: 'custom',
			testability: 0.5,
			title: {
				en: 'Acronyms must be marked with an "acronym" element',
				nl: 'Acroniemen moeten worden gemarkeerd met een "acronym"-element'
			},
			description: {
				en: 'Acronyms should be marked with an <code>acronym</code> element, at least once on the page for' +
					' each acronym.',
				nl: 'Acroniemen moeten worden gemarkeerd door middel van het <code>acronym</code>-element. Doe' +
					' dit ten minste een keer per pagina voor elke acroniem.'
			},
			guidelines: {
				wcag: {
					'3.1.4': {
						techniques: [ 'H28' ]
					}
				}
			},
			tags: [ 'acronym', 'content' ],
			components: [ 'acronym' ],
			callback: 'documentAcronymsHaveElement',
			name: 'documentAcronymsHaveElement',
			status: 'failed',
			complete: true
		},
		testComplete: null
	},
	{
		0: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLImageElement]',
				selector: 'img',
				status: 'failed',
				html: '<img src="foo.jpg">'
			}
		},
		1: {
			// This entry is faked.
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLImageElement]',
				selector: 'img',
				status: 'failed',
				html: '<img src="foo-bar-baz.jpg" data-remark="faked">'
			}
		},
		2: {
			// This entry is faked.
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLImageElement]',
				selector: 'img',
				status: 'passed',
				html: '<img src="bom-bom.jpg" data-remark="faked">'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 3,
		attributes: {
			type: 'selector',
			testability: 1,
			title: {
				en: 'Image elements must have an "alt" attribute',
				nl: 'Afbeeldingselementen moeten een "alt"-attribuut hebben'
			},
			description: {
				en: 'All <code>img</code> elements must have an alt attribute.',
				nl: 'Alle <code>img</code>-elementen moeten een "alt"-attribuut hebben.'
			},
			guidelines: {
				508: [ 'a' ],
				wcag: {
					'1.1.1': {
						techniques: [ 'F65', 'H37' ]
					}
				}
			},
			tags: [ 'image', 'content' ],
			options: {
				selector: 'img:not(img[alt])'
			},
			name: 'imgHasAlt',
			status: 'failed',
			complete: true
		},
		testComplete: null
	},
	{
		// We have manually changed test status to passed, so at least one in
		// collection is passed.
		0: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLScriptElement]',
				selector: 'script',
				status: 'passed',
				html: '<script src="quail/bower_components/jquery/jquery.min.js"></script>'
			}
		},
		1: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLScriptElement]',
				selector: 'script',
				status: 'passed',
				html: '<script src="quail/bower_components/quail/dist/quail.jquery.js"></script>'
			}
		},
		2: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				element: '[object HTMLScriptElement]',
				selector: 'script',
				status: 'passed',
				html: '<script data-cacheid="id_0.21958852466195822" style="visibility: visible;">\t\t\tvar' +
				'quailAdapter = {\t\t\t\t// Path to Quail dist directory.\t\t\t\tdistPath:' +
				' \'quail/bower_components/quail/dist/\',\t\t\t\t// Identifi... [truncated]'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 3,
		attributes: {
			type: 'selector',
			testability: 0,
			title: {
				en: 'The interface in scripts should not use color alone',
				nl: 'De interface in scripts gebruikt niet alleen maar kleur'
			},
			description: {
				en: 'All scripts should be assessed to see if their interface does not have an interface which' +
				' requires distinguishing between colors alone.',
				nl: 'Alle scripts moeten gecontroleerd worden om te zien of hun interface geen interface heeft die' +
				' alleen op kleur kan worden onderscheiden.'
			},
			guidelines: {
				508: [ 'c' ]
			},
			tags: [ 'javascript', 'color' ],
			options: {
				selector: 'script'
			},
			name: 'scriptsDoNotUseColorAlone',
			status: 'passed',
			complete: true
		},
		testComplete: null
	},
	{
		0: {
			listeners: {
				resolve: [ null, null ],
				timeout: [ null, null ]
			},
			timeout: null,
			attributes: {
				status: 'failed'
			}
		},
		listeners: {
			results: [ null ],
			resolve: [ null, null ],
			complete: [ null ]
		},
		length: 1,
		attributes: {
			type: 'custom',
			testability: 0.5,
			title: {
				en: 'A "skip to content" link should exist as one of the first links on the page',
				nl: 'Er moet een "skip to content"-link zijn als een van de eerste links op de pagina'
			},
			description: {
				en: 'A link reading "skip to content" should be the first link on a page.',
				nl: 'Er moet een link zijn om naar de content te navigeren als een van de eerste links op de pagina.'
			},
			guidelines: {
				508: [ 'o' ],
				wcag: {
					'2.4.1': {
						techniques: [ 'G1' ]
					}
				}
			},
			tags: [ 'document' ],
			strings: [ 'skipContent' ],
			callback: 'skipToContentLinkProvided',
			name: 'skipToContentLinkProvided',
			status: 'failed',
			complete: true
		},
		testComplete: null
	} ];

	function eachMock( callback ) {
		var ret;
		for ( var i = 0, len = this.length; i < len; ++i ) {

			ret = callback( i, this[ i ] );

			if ( ret === false ) {
				break;
			}
		}
		return this;
	}

	// Quail objects has some handy functions, we need to emulate them.
	ret.each = eachMock;

	function getMock( attrName ) {
		return this.attributes[ attrName ];
	}

	ret.each( function( index, test ) {
		test.get = getMock;
		// tests also have each method.
		test.each = eachMock;
	} );

	return ret;
}