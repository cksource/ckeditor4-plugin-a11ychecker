
# Guide

## About Accessibility Checker

Accessibility Checker is an innovative solution that lets you inspect accessibility level of content created
in CKEditor and immediately solve any issues that are found. This sample uses
Quail as its accessibility tests library, but you can integrate any
other similar library to achieve comparable results.

_@ML: Above part was simply copied from current sample, I should remember to update it._

### How does it work?

It inspects your output HTML code against predefined patterns for common mistakes (...).

_@ML: @todo: mention dedicated engine (Quail), flexebility for other engines / usages._

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

For more information about Checking Mode, please refer to [Checking mode](#checking-mode) section.

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

_@ML: @todo: This table should not be present here, instead we should put a link to complete default hotkeys table to keep it DRY._

### Using QuickFixes

_@ML: This is the last moment to decide how do we want to refer to QF - QuickFix or Quick Fix. After we'll start using one version we should stick to it in the future._

QuickFix is a powerful feature designed to solve issues as quickly as possible, without leaving the Accessibility Checker panel.

There are two QuickFix types:

* **Automatical** - Doesn't require any user input at all in order to fix the problem.
* **Semi-automatic** - Requires user to provide some information before applying the QuickFix.

#### Working with QuickFixes

##### Automatical QuickFix

_@ML: Mby lets change button text to "QuickFix"? I thought about adding an exclaimation mark, but it might take too much of the end user attention._

For automatical QucikFixes it comes down to pressing the "Quick fix" button.

![Automatical QuickFix example](assets/guide/quickfixauto.png)

Once the button is pressed, the fix is applied. This will result with source markup being changed.

##### Semi-automatic QuickFix

_@ML: Hmm not sure about name "semi-automatic". Back in a days at some point I was using "manual" term, but i think it sounds bad, and carries a conotation that end-user will need to do whole job._

Semi-automatic QuickFix requires some input from the user, typically requested by the text inputs in a form.

As an example we can use following case:

![Semi-automatic QuickFix example](assets/guide/quickfixmanual.png)

Image had no alternative text at the begining, and QuickFix asks for the alternative text, as it's unable to determine this automatically.

###### User Input Validation

QuickFixes are also smart enough to validate user input data if needed.

Lets consider that we should keep image alternative text shorter than `100` characters.

If we'll provide too long text into the "Alternative Text" field, and try to apply it with a QuickFix, it will raise an error telling that it's too long.

![Invalid user-provided data causes validation error](assets/guide/quickfixvalidation.png)

#### Adding QuickFixes

QuickFixes feature is created with extensibility in mind, as a result it's very easy for developer to add new, custom QuickFixes to his Accessibility Checker.

More information on how to create QuickFix is available in developer tutorials.

#### Issue Types

_@ML: I think that this section should actually be moved closer to the root. Maybe directly inside `Feature overview`, there would be a position `Issues` briefly describing the issues and their types._

Issues occures with different types.

* **Error** - Checking engine is 100% sure that highlighted element contains the issue.
* **Warning** - Checking engine discovered that there is a possibility for given error, but it can't give 100% certainty.
* **Notice** - Checking engine has no way to detect this issue - it points issue only as a notice, so the user can verify if the content satisfy given rule.

Based on their type, their highlight color will slightly differ while in checking mode in order to hint the type.

Issue can be also ignored for more information see [Ignoring Issues](#ignoring-issues).

#### Ignoring Issues

You can also ignore issues individually.

![Issue ignore button](assets/guide/ignorebutton.png)

If the issue is ignored it will gain very subtle highlight despite of its initial type, as shown below.

![Ignored issue higlighting](assets/guide/ignoredstyling.png)

It's still possible to open the Accessibility Checker on the ignored issue by clicking it, or through issue navigation buttons.

Once the issue is ignored you can also unset its ignore status, just by clicking "stop ignoring" button.

![Ignored issue higlighting](assets/guide/ignorestopbutton.png)

#### Switching to Listening Mode

When you wish to do some manual changes to the content, Accessibility Checker will switch to a listening mode, waiting for your changes to be done.

There are two ways of switching Accessibility Checker to listening mode:

* Clicking anywhere in the content of the CKEditor.
* Pressing listening mode keystroke (see [Keystrokes](#keystrokes)).

### Listening Mode

Listening mode is a mode loaded turned when you want to make a quick change in a document.

With listening mode Accessibility Checker minimalizes itself and waits until you're finished with your changes.

Listening mode will put following indicator in bottom right corner of your browser screen.

![Listening mode indicator](assets/guide/listeningindicator.png)

Once you're done with your changes you can return to checking the content by clicking "Check again" button.

### Keystrokes

Accessibility Checker comes with a good keyboard support.

Following table describes default keystrokes and assigned actions.

#### Keystrokes for Windows / Linux

| Command | Keystroke | Restrictions |
| ----- | ----- | ----- |
| Open/Close Accessibility Checker | `CTRL` + `ALT` + `E` | |
| Next Issue | `CTRL` + `E` | Checking mode only |
| Previous Issue | `CTRL` + `SHIFT` + `E` | Checking mode only |
| Close Accessibility Checker | `ESC` | |
| Switch to listening mode | `SHIFT` + `ESC` | Checking mode only |
| Switch to checking mode | `SHIFT` + `ESC` | Listening mode only |

#### Keystrokes for Mac

| Command | Keystroke | Restrictions |
| ----- | ----- | ----- |
| Open/Close Accessibility Checker | `COMMAND` + `OPTION` + `E` | |
| Next Issue | `COMMAND` + `E` | Checking mode only |
| Previous Issue | `COMMAND` + `SHIFT` + `E` | Checking mode only |
| Close Accessibility Checker | `ESC` | |
| Switch to listening mode | `SHIFT` + `ESC` | Checking mode only |
| Switch to checking mode | `SHIFT` + `ESC` | Listening mode only |

Please, note that these keystrokes might be changed by the custom configuration.

### Accessibility

Accessibilty Checker is itself accessible

# @todo:

* Listening Mode
* Mastering Accessibility Checker

Move issue types headline.