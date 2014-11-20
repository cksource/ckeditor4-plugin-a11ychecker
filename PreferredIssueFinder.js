define( function() {
	'use strict';

	/**
	 * An object encapsulating all the logic for determining the next issue when Controller
	 * ended the checking.
	 *
	 * It can work as an order strategy object.
	 *
	 * The idea is that you update the preferred issue each time user selects (focuses) an
	 * issue.
	 *
	 * If you want to know which issue out of given list should be focused just call
	 * {@link #getPreferredIssue}. It will inspect given issue list for the preferred
	 * issue, or any closest issue nearby.
	 *
	 * This method will automatically handle the case when given issue no longer appears
	 * in list. In this case it can find next issue in the DOM.
	 *
	 * @constructor
	 * @class CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
	 */
	function PreferredIssueFinder() {
	}

	PreferredIssueFinder.prototype = {
		/**
		 * A preferred issue object.
		 *
		 * @member CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
		 * @type {CKEDITOR.plugins.a11ychecker.Issue}
		 */
		preferredIssue: null
	};

	PreferredIssueFinder.prototype.constructor = PreferredIssueFinder;

	/**
	 * Sets the preferred issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
	 * @param {CKEDITOR.plugins.a11ychecker.Issue/null} issue Issue to be set as
	 * a preferred one. You might also use `null` to unset current value.
	 */
	PreferredIssueFinder.prototype.set = function( issue ) {
		this.preferredIssue = issue;
	};

	/**
	 * Unsets the preferred issue.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
	 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue
	 */
	PreferredIssueFinder.prototype.unset = function( issue ) {
		this.set( null );
	};

	/**
	 * Checks given list to find the {@link #preferredIssue}. If not found will
	 * try to return the most convenient proposition for end user, eg. next one
	 * in the DOM order.
	 *
	 * Note: This method assumes that issueList entries are already sorted by the DOM
	 * order.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList
	 * @returns {CKEDITOR.plugins.a11ychecker.Issue/null}
	 */
	PreferredIssueFinder.prototype.getFromList = function( issueList ) {
		var ret = null,
			preferredElement = this.preferredIssue && this.preferredIssue.element,
			// Set to true only if preferredIssue.element was found in issueList.
			// This means that we no longer need to seak any better option.
			preferredElementFound = false;

		if ( issueList.count() === 0 ) {
			// Issue list is empty so there's nothing to focus.
			return ret;
		} else if ( !preferredElement ) {
			// If there are some issues, but preferred issue is not known, we'll
			// return the first issue.
			return issueList.getItem( 0 );
		}

		issueList.each( function( issue ) {
			if ( preferredElementFound ) {
				return;
			}

			if ( issue.element.equals( preferredElement ) ) {
				preferredElementFound = true;
				ret = issue;
			} else if ( !ret && issue.element.getPosition( preferredElement ) & CKEDITOR.POSITION_FOLLOWING ) {
				// Else *ONLY IF* there's no ret candidate still, we can check position
				// of each node. If it's following the preferred mode, it makes a good
				// candidate for ret value.
				// Having it assigned to ret value, will prevent next position compares.
				ret = issue;
			}
		} );

		// Ret might be still a null, if preferredElement was not found at all.
		// So in that case we'll return first issue.
		return ret || issueList.getItem( 0 );
	};

	/**
	 * Works exactly the same as {@link #getFromList} but returns a number (index in
	 * `issueList`) rather than {@link CKEDITOR.plugins.a11ychecker.Issue} instance.
	 *
	 * @memberOf CKEDITOR.plugins.a11ychecker.PreferredIssueFinder
	 * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList
	 * @returns {Number/null}
	 */
	PreferredIssueFinder.prototype.getFromListIndex = function( issueList ) {
		var ret = this.getFromList( issueList );

		return ret ? issueList.indexOf( ret ) : null;
	};

	return PreferredIssueFinder;
} );