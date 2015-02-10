
# Guide

## About Accessibility Checker

Accessibility Checker is an innovative solution that lets you inspect accessibility level of content created
in CKEditor and immediately solve any issues that are found. This sample uses
Quail as its accessibility tests library, but you can integrate any
other similar library to achieve comparable results.

_@ML: Above part was simply copied from current sample, I should remember to update it._

### How does it work?

It inspects your output HTML code against predefined patterns for common mistakes (...).

### How do I profit from accessible content?

The more accessible your content is, the bigger market you can gain.

(...)
It's especially important for government institutions and big companies
(...)

It's not only about increasing the market, accessibility guides makes your content more semantic, therefore it will be much easier to work on it using applications of tommorow.

### What's so special about Accessibility Checker?

It's the first major attempt to make content checking fully integrated to your content creation workflow.

You can validate your contents on the fly, without leaving CKEditor.

What's more, with Accessibility Checker we're introducing QuickFixes. It will automaticaly, or with a very little
input, fix some of the issues - minimizing the amount of work to bare minimum!

With QuickFixes you're able to solve issues within a blink of an eye!

## Feature Overview

Let us take you through Accessibility Checker functions (...).

### Running Accessibility Checker

You can enable Accessibility Checker by clicking "Check Accessibility" ![Accessibility Checker icon](assets/guide/acicon.png) button.

Once button is clicked, Accessibility Checker will perform a very quick checking process. Typically it takes fraction of a second.

Depending on issues presence Accessibility Checker will switch to a **checking mode** or display an information that the document contains no accessibility issues.

#### Issues Found / Checking Mode

When Accessibility Checker will find some isseues, it will display a panel containing the tools needed for understanding and solving the problem.

![Accessibility Checker in a checking mode](assets/guide/checkingmode.png)

Issues are presented as issue one at a time, allowing you to iterate over all the issue list.

For more information about Checking Mode, please refer to **Checking mode** section.

#### No Issues

In case of no issues in the checked document, Accessibility Checker will provide a relevant information.

![Dialog shown when no issues are found](assets/guide/noissues.png)

This means that your content is validated.

## Checking Mode

Checking mode is enabled when there is at least one issue in the content. It shows a panel containg all the key information about currently focused issue.

It's designed for:

* Quick problem identification (title, description, help links).
* Navigation over the issues.
* Fixing the problems, ideally without leaving

Checking mode will work with a single issue at a time, allowing you to iterate over other issues.

Following picture will highlight most important parts of the panel shown in checking mode.

![Checking mode panel with highlighted parts](assets/guide/panelparts.png)

### Navigating Over Issues

There are multiple ways to navigate over the issues.

#### Navigation Buttons

You can simply use `Previous` or `Next` buttons in Accessibility Checker panel.

![Navigation using next button](assets/guide/navigationbutton.png)

#### Clicking Desired Issue

Since issues are highlighted in the CKEditor itself, you can simply click the other issue with your mouse. It will focus first issue with given element.

The possibility to focus the issue is indicated by changing the coursor.

_@ML: I was wondering if we should include Accessibility Checker panel unfolded on other issue nearby. But at the end i find it not necessary._

![Navigation using mouse](assets/guide/navigationmouse.png)

#### Using a Keyboard

You can use also keyboard to move across issues.

_@ML: I've used term keystrokes rather than hotkey which is far less common, but we use it widely in CKEditor so I decided to keep the consistency here._

The default keystrokes are:

| Command | Keystroke |
| ----- | ----- |
| Next | `CTRL` + `E` |
| Previous | `CTRL` + `SHIFT` + `E` |

### Using QuickFixes

QuickFix is a powerful feature designed to solve issues as quickly as possible, without leaving the Accessibility Checker panel.

# @todo:

* Checking Mode
	* Using QuickFixes
		* Working with QuickFix form.
			* memo: Mention validation.
		* memo: Emphasize that they're super easy for devs to create.
	* Issue types
		* Error
		* Warning
		* Notice
	* Ignoring issues
	* Switching to listening mode
* Listening Mode
* Mastering Accessibility Checker
