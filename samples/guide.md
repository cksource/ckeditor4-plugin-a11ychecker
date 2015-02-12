# Accessibility Checker Guide

## About Accessibility Checker

Accessibility Checker is an innovative solution that lets you **inspect the accessibility level** of content created in CKEditor and **immediately solve** any accessibility issues that are found.

It is built upon three key elements:

* User Interface optimized for quick problem solving.
* Flexibility allowing you to use the accessibility checking engine of your choice.
* QuickFix feature letting you fix common problems fully automatically!

All of this comes bundled with a tight integration with CKEditor.

### How Does It Work?

A typical accessibility checking process can be simplified to the following three steps.

#### Step One: Content Validation

First the Accessibility Checker inspects your output HTML code against predefined patterns of common accessibility problems.

For that purpose Accessibility Checker uses a dedicated **accessibility checking engine**.

The default checking engine is [Quail](http://quailjs.org), but you are free to integrate any other library you want &mdash; it can be written in JavaScript, PHP, Java, .NET or any other language of your choice.

#### Step Two: Report Issues

Accessibility Checker will list all issues found and highlight them in your document. It will provide a more detailed description of what is wrong with each issue so you can verify and solve the problem.

#### Step Three: Fix the Issue

Fix the markup, so your content is free of accessibility issues.

Thanks to the [QuickFix feature](#using-quickfixes) correcting common problems is as easy as clicking a button.

When there is no QuickFix available, you can switch Accessibility Checker [into listening mode](#switching-to-listening-mode) and make necessary corrections to your content manually, following the checking engine recommendations provided in the panel.

### How Do I Profit from Accessible Content?

Here are just a few advantages of giving everyone access to your content.

#### Increased Market Reach

The more accessible your content is, the bigger market you can gain. It is estimated that [around 15.3%](http://whqlibdoc.who.int/publications/2011/9789240685215_eng.pdf?ua=1) of the world population has moderate or severe disabilities. This is a huge group of potential customers that you can reach when you improve the accessibility of your content.

#### Conforming to Legal Requirements

Accessibility is crucial for certain entities including government institutions and big corporations who are obliged to conform to certain web accessibility standards when working for the public sector. These entities in turn request accessibility compliance from their partners &mdash; you!

#### Future-Proof Semantic Content

Accessibility guidelines make your content more semantic, therefore it will be much easier to work on it using applications of tomorrow. Designing accessible content overlaps with mobile usability, too, which is exponentially growing in demand.

#### Better UX for All Users

Following accessibilty guidelines helps fostering best content creation practices. This in turn brings better user experience not only for disabled people, but for your entire audience, including improvements for mobile users, older low performance PCs, keyboard-oriented users or older people.

#### Better SEO

Again, a better, standards-compliant structure enables search engines to explore more content on your page. Better page indexing means higher positioning in search results and an increase of traffic on your website.

#### Emphasize Social Responsibility

By keeping your content accessible you prove that your business cares about your entire audience, does not exclude anyone from reaching it, and in general, does "the right thing". That subtle advantage can help you build a positive public image both in the eyes of individual users as well as your B2B partners and potential customers.

If you would like to read more about how your company can benefit from accessible content, refer to the ["Commercial Benefits of Accessibility"](http://cksource.com/blog/Commercial-Benefits-of-Accessibility) article on CKSource blog.

### What's So Special About Accessibility Checker?

It is the first major attempt to make content accessibility checking fully integrated into your content creation workflow.

You can validate your content on the fly, without leaving CKEditor.

What is more, with Accessibility Checker we are introducing QuickFixes. This feature will automatically, or with very little
input from your side, correct some of the issues &mdash; reducing the amount of work to a bare minimum.

With QuickFixes you are able to solve issues within a blink of an eye!

## Functionality Overview

Let us take you through Accessibility Checker features.

### Running Accessibility Checker

You can enable Accessibility Checker by clicking the **Check Accessibility** ![Accessibility Checker icon](assets/guide/acicon.png) toolbar button.

Once the button is clicked, Accessibility Checker will perform a very quick checking process. Typically it takes a fraction of a second.

Depending on the result, Accessibility Checker will switch to **checking mode** or inform you that the document contains no accessibility issues.

#### Issues Found &mdash; Checking Mode

When Accessibility Checker finds some issues, it will display a panel containing the tools needed for understanding and solving the problem.

![Accessibility Checker in a checking mode](assets/guide/checkingmode.png)

Accessibility problems are presented as one issue at a time, allowing you to iterate over the entire list.

Issues can also be ignored. For more information see the [Ignoring Issues](#ignoring-issues) section.

For more information about checking mode please refer to the [Checking Mode](#checking-mode) section.

#### No Issues

If no issues were found in the document, Accessibility Checker will inform you about it.

![Dialog shown when no issues are found](assets/guide/noissues.png)

This means that your content is validated.

### What Exactly Are Issues?

An issue represents a single accessibility problem in your content, as defined by your checking engine.

Issue are grouped into different types.

#### Issue Types

* **Error** &ndash; The checking engine is 100% certain that the highlighted element contains an accessibility issue.
* **Warning** &ndash; The checking engine discovered that there is a possibility of a given error, but it does not have 100% certainty.
* **Notice** &ndash; The checking engine has no way to detect this issue, so it points an issue only as a notice and the user can verify if the content satisfies the given rule.

In checking mode the content highlight color will slightly differ in order to hint the issue type.

### Checking Mode

Checking mode is enabled when there is at least one issue in the content. It shows a panel containing all key information about the currently focused issue.

It is designed for:

* Quick problem identification (with a meaningful title, description, help links).
* Navigation over the detected issues.
* Fixing the problems, ideally without leaving the panel.

The checking mode will work on a single issue at a time, allowing you to iterate over all issues found in the document.

The following picture will highlight the most important parts of the panel shown in the checking mode.

![Checking mode panel with highlighted parts](assets/guide/panelparts.png)

#### Navigating Over Issues

Multiple ways to navigate over issues are available.

##### Navigation Buttons

Use the **Previous** or **Next** buttons in the Accessibility Checker panel to move between issues.

![Navigation using the Next button](assets/guide/navigationbutton.png)

##### Clicking a Selected Issue

Since issues are highlighted in CKEditor, you can click an issue with your mouse. It will focus the first issue within the selected element.

The possibility to focus an issue is indicated by a hightlight and a cursor change.

![Navigation using the mouse](assets/guide/navigationmouse.png)

##### Using the Keyboard

You can also use the keyboard to move across issues. A few keyboard shortcuts were defined to make navigation easy and intuitive.

Please refer to the [Keyboard Shortcuts](#keyboard-shortcuts) section for a complete list of available keystrokes.

#### Using QuickFixes

QuickFix is a powerful feature designed to solve issues as quickly as possible, without leaving the Accessibility Checker panel.

There are two QuickFix types:

* **Automatic** &ndash; Does not require any user input at all to fix the problem.
* **Semi-automatic** &ndash; Requires the user to provide some information before applying the QuickFix.

##### Working with QuickFixes

Depending on the QuickFix type, two approaches are possible.

###### Automatic QuickFix

For automatic QucikFixes you job comes down to pressing the **Quick Fix** button in the Accessibility Checker panel.

![Automatic QuickFix example](assets/guide/quickfixauto.png)

Once the button is pressed, the fix is applied. This will result in a change of the HTML source of your content.

###### Semi-Automatic QuickFix

A semi-automatic QuickFix requires some action from the user, typically requested by a form text input in the Accessibility Checker panel.

For example:

![Semi-automatic QuickFix example](assets/guide/quickfixmanual.png)

Initially this image has no alternative text so QuickFix asks the user to provide it as it is unable to determine this automatically.

###### User Input Validation

QuickFixes are also smart enough to validate the user input data if needed.

For example, it is recommended that an alternative text for an image should be shorter than 100 characters.

If the user enters a text exceeding 100 characters into the "Alternative Text" field and tries to apply it with a QuickFix, Accessibility Checker will raise an error warning the user that the text is too long.

![Invalid user-provided data causes a validation error](assets/guide/quickfixvalidation.png)

##### Adding QuickFixes

QuickFix feature was created with extensibility in mind, so it is very easy for a developer to add new, custom QuickFixes to Accessibility Checker.

More information on how to create a custom QuickFix is available in CKEditor developer documentation.

#### Ignoring Issues

Issues reported by Accessibility Checker can also be ignored. This can be done by clicking the **Ignore** button for each selected issue in the Accessibility Checker panel.

![Issue ignore button](assets/guide/ignorebutton.png)

If an issue is ignored, it will gain very subtle highlight which no longer indicates the initial issue type, as shown below.

![Ignored issue higlighting](assets/guide/ignoredstyling.png)

It is still possible to open Accessibility Checker on an ignored issue by clicking it, by navigating to it with your keyboard or moving to it from the previous or next issue.

Once the issue is ignored you can also unset its ignore status by clicking the **Stop ignoring** button.

![Stop ignoring button](assets/guide/ignorestopbutton.png)

#### Switching to Listening Mode

When you wish to introduce some manual changes to your content, Accessibility Checker will switch to listening mode, waiting for your changes to be done.

There are two ways of switching Accessibility Checker to listening mode:

* Clicking anywhere in the CKEditor content area.
* Pressing the listening mode [keyboard shortcut](#keyboard-shortcuts).

### Listening Mode

Listening mode is enabled when you want to make a quick change to the document.

In listening mode Accessibility Checker minimizes itself and waits until you are finished editing your content.

Listening mode will put the following indicator in the bottom right-hand corner of your browser:

![Listening mode indicator](assets/guide/listeningindicator.png)

When you are done with your changes you can return to checking the content by clicking the **Check again** button.

### Keyboard Shortcuts

Accessibility Checker comes with good keyboard support.

The following table describes default keystrokes and actions assigned to them.

#### Keyboard Shortcuts for Windows / Linux

| Command | Keystroke | Restrictions |
| ----- | ----- | ----- |
| Open/Close Accessibility Checker | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>E</kbd> | |
| Next Issue | <kbd>Ctrl</kbd>+<kbd>E</kbd> | Checking mode only |
| Previous Issue | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> | Checking mode only |
| Close Accessibility Checker | <kbd>Esc</kbd> | |
| Switch to listening mode | <kbd>Shift</kbd>+<kbd>Esc</kbd> | Checking mode only |
| Switch to checking mode | <kbd>Shift</kbd>+<kbd>Esc</kbd> | Listening mode only |

#### Keyboard Shortcuts for Mac

| Command | Keystroke | Restrictions |
| ----- | ----- | ----- |
| Open/Close Accessibility Checker | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>E</kbd> | |
| Next Issue | <kbd>Command</kbd>+<kbd>E</kbd> | Checking mode only |
| Previous Issue | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> | Checking mode only |
| Close Accessibility Checker | <kbd>Esc</kbd> | |
| Switch to listening mode | <kbd>Shift</kbd>+<kbd>Esc</kbd> | Checking mode only |
| Switch to checking mode | <kbd>Shift</kbd>+<kbd>Esc</kbd> | Listening mode only |

Please note that the predefined keyboard shortcuts can be changed with the custom configuration.

# @todo:

_@ML: We might add another section for accessibility of AC itself._
