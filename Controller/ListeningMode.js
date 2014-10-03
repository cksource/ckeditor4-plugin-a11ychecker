
define( function() {

	/**
	 * A controller mode which should detach all the Accessibility Checker functionality and
	 * limit itself to gently notify end user about its presence.
	 *
	 * @class CKEDITOR.plugins.a11ychecker.ListeningMode
	 * @constructor
	 */
	function ListeningMode( controller ) {
		/**
		 * @property {CKEDITOR.plugins.a11ychecker.Controller} controller
		 */
		this.controller = controller;

		/**
		 * @property {Object} notification Helper object representing the notification
		 * telling user that he needs to refresh Accessibility Checker.
		 */
		this.notification = new Notification();
	}

	ListeningMode.prototype = {};
	ListeningMode.prototype.constructor = ListeningMode;

	/**
	 * Method to be called when controller enters this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.ListeningMode
	 */
	ListeningMode.prototype.init = function() {
		// Reposition the notification to convenient position.
		this.notification.adjustPosition( this.controller.editor.container );

		this.notification.show();

		var that = this;

		this.notification.element.on( 'click', function() {
			// User intend to check the content once again.
			that.controller.check();
			that.controller.editor.focus();
		} );
	};

	/**
	 * Method to be called when controller leaves this mode.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.ListeningMode
	 */
	ListeningMode.prototype.close = function() {
		this.notification.hide();
	};

	// Second helper type in the same file. If it will grow, we will move it to
	// a separate file.
	function Notification() {
		this.element = getNotificationWrapper();
	}

	Notification.prototype = {};
	Notification.prototype.constructor = Notification;

	Notification.prototype.show = function() {
		CKEDITOR.document.getBody().append( this.element );
	};

	Notification.prototype.hide = function() {
		this.element.remove();
	};

	/**
	 * Repositions notification to bottom right corner.
	 */
	Notification.prototype.adjustPosition = function( container ) {
		var rect = container.getClientRect(),
			newPosition = {
				left: rect.left + rect.width,
				top: rect.top + rect.height
			};

		newPosition.top -= 60;
		newPosition.left -= 220;

		this.element.setStyles( {
			left: CKEDITOR.tools.cssLength( newPosition.left ),
			top: CKEDITOR.tools.cssLength( newPosition.top )
		} );
	};

	function getNotificationWrapper() {
		var ret = CKEDITOR.document.createElement( 'div' );

		ret.addClass( 'cke_a11yc_ui_listening_tooltip' );

		ret.setHtml( 'Click here to retry accessibility checking' );

		return ret;
	}

	return ListeningMode;
} );