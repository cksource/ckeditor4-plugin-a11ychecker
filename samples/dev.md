
# Accessibility Checker Developer Guide

## Current Project State

Currently we're focusing on:

* Providing a best possible Quail tests list to conform WCAG 2 level AA.
* General UI enhancements.

Next we'll put our resources on enhancing the backend.

## General Concepts

Accessibility Checker is an application that will find any accessibility issue in the document structure and present in a convenient way to the end-user. It will also provide a possibility to apply a **Quick Fix** to some of them.

### Document Structure vs Presentation

@todo: explain what's the difference and why didn't we decide to go with presentation checks

By default AC will focus on structural issues.

### Internals

First of all, Accessibility Checker is a [CKEditor](http://ckeditor.com) plugin, and as such, it works only with CKEditor.

When started it's using underlying **checking engine** to find all the issues within current editor content. Checking engines are defined by JavaScript class that provides integration between any checking library and AC. By default AC comes with a single checking engine class for [Quail](http://quailjs.org) library.

After the engine returns an issue list then AC triggers its UI to show the results in a user-friendly way. Now it's up to user to decide if he want fix, ignore or just to navigate to the other issue.

### Quail

#### Requirements

Note that Quail requires **jQuery**, and Accessibility Checker doesn't injects it by default. Not having jQuery loaded will result with following exceptin:

```
Uncaught ReferenceError: jQuery is not defined
```

#### Default Tests Preset

Quail provides over 200 tests (called assessments). For sake of simplicity by default we're using only a handful subset of them, so the results are less confusing.

Running all tests isn't the best idea, because it would produce hundreds of issues with notices, making navigation over severe issues very difficult. Also some of Quail tests might produce fake positive results, that might confuse end-user. That's why it's a good idea to reduce tests down to important and high quality tests.

**We’re currently working on an ideal Quail preset that would match WCAG2 AA level, and it will replace default config for future AC releases.**

Here's the list of default tests:

* imgHasAlt
* aMustNotHaveJavascriptHref
* aAdjacentWithSameResourceShouldBeCombined
* imgNonDecorativeHasAlt
* imgImportantNoSpacerAlt
* KINGUseLongDateFormat
* aTitleDescribesDestination
* blockquoteNotUsedForIndentation
* imgAltNotEmptyInAnchor
* tableUsesCaption
* imgShouldNotHaveTitle
* imgAltIsTooLong
* pNotUsedAsHeader

You can override this tests preset, see [Quail Tests Configuration](#).

#### Customize Tests

You can customize Quail tests by using the `a11ychecker_quailParams.guideline` [CKEditor configuration](http://docs.ckeditor.com/#!/guide/dev_configuration). This is an array storing Quail test (assessment) names.

1. Custom config example:

	```
	CKEDITOR.editorConfig = function( config ) {
		config.a11ychecker_quailParams = {
			guideline: [
				'aAdjacentWithSameResourceShouldBeCombined',
				'aImgAltNotRepetitive',
				'aLinksAreSeparatedByPrintableCharacters',
				'aMustNotHaveJavascriptHref',
				'aSuspiciousLinkText',
				'documentVisualListsAreMarkedUp',
				'headerH1',
				'headerH2',
				'headerH3',
				'imgAltIsDifferent',
				'imgAltIsTooLong',
				'imgAltNotEmptyInAnchor',
				'imgAltTextNotRedundant',
				'imgHasAlt',
				'linkHasAUniqueContext',
				'pNotUsedAsHeader',
				'tableDataShouldHaveTh',
				'tableNotUsedForLayout'
			]
		};
	};
	```
1. Custom [config including all Quail tests](https://gist.github.com/mlewand/3de6cda9f5a1085738d1) at gists, due to its size.

#### Version Compatibility

Note that since Quail **2.3.x** has not yet reached stable state, we're using Quail **2.2.x** version.

#### Adding a Custom Test

@todo

### Adding a Quick Fix

@todo

### How Do I Prevent Invalid Content From Being Saved?

@todo

### How to Report an Issue

Currently issues should be reported through e-mail. If you have found some issue, please send them to your contact in CKSource.

### More Questions? Ask Us!

If you have more questions that have not been covered in this guide, please let us know through e-mail. As you'll ask for more technical details, we'll be putting them into this guide.
