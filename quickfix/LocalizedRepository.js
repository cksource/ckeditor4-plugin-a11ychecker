define( [ 'quickfix/Repository' ], function( Repository ) {
	'use strict';
	
	/**
	 * This type adds localization support for repository.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix
	 * @constructor
	 * @param {String} basePath A path to the directory where QuickFix classes are
	 * stored.
	 */
	function LocalizedRepository( basePath ) {
		Repository.call( this, basePath );
		
		this._langDictionary = null;
	}

	LocalizedRepository.prototype = new Repository();
	LocalizedRepository.prototype.constructor = LocalizedRepository;

	// An array of arguments from calls that were deferred.
	var deferredGetCalls = [],
		languageRequested = false;

	/**
	 * Returns the QuickFix class with given name. When type is loaded `callback` will
	 * be called.
	 *
	 *		quickFixes.get( 'ImgAlt', function( ImgAlt ) {
	 *			var quickFix = new ImgAlt( myIssue );
	 *			quickFix.fix();
	 *		} );
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.LocalizedRepository
	 * @param {String} name
	 * @param {Function} callback A function to be called when given type is registered.
	 * It gets only one parameter which is a construct function for given QuickFix.
	 * @returns {Function}
	 */
	LocalizedRepository.prototype.get = function( name, callback ) {
		if ( this.deferGetCall( arguments ) ) {
			// Call should be deferred, because no lang is available yet.
			return;
		}
		
		// If lang is available call to the base class.
		return Repository.prototype.get.call( this, name, callback );
	};
	
	/**
	 * If needed will defer {@link #get} call.
	 *
	 * @returns {Boolean} `true` if call was deferred, `false` otherwise.
	 */
	LocalizedRepository.prototype.deferGetCall = function( getArguments ) {
		if ( !CKEDITOR.plugins.a11ychecker.dev || this._langDictionary ) {
			// Deferring is always disabled in built version, and if _langDictionary is already
			// loaded.
			return false;
		}
		console.log('deferring' + getArguments[ 0 ] );
		
		deferredGetCalls.push( getArguments );
		
		if ( !languageRequested ) {
			console.log('requesting lang');
			CKEDITOR.scriptLoader.load( this.basePath + 'lang/' + 'it' + '.js' );
			// Language was not requested yet.
			languageRequested = true;
		}
		
		return true;
	};
	
	/**
	 * Registers a class of given QuickFix.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.LocalizedRepository
	 * @param {String} name QuickFix name.
	 * @param {Function} cls QuickFix type.
	 */
	LocalizedRepository.prototype.add = function( name, cls ) {
		// At this point language dictionary *must* be available so we can freely access it.
		cls.prototype.lang = this._langDictionary[ name ] || {};
		
		console.log( name, cls.prototype );

		return Repository.prototype.add.call( this, name, cls );
	};
	
	/**
	 * Method to register language dictionary for developer version.
	 *
	 * In built version languages are already inlined into a QuickFix class file, so there's
	 * no need to execute it.
	 *
	 * @param {Object} dictionary
	 */
	LocalizedRepository.prototype.lang = function( dictionary ) {
		console.log( 'lang received' );
		this._langDictionary = dictionary;
		// All deferred gets should be called in reversed order.
		for ( var i = deferredGetCalls.length - 1; i >= 0; i-- ) {
			this.get.apply( this, deferredGetCalls[ i ] );
		}
	};
	
	/**
	 * Function created for tests, returns count of deferred get functions.
	 *
	 * @returns {Number}
	 */
	LocalizedRepository.prototype._getDeferredGetCount = function() {
		return deferredGetCalls.length;
	};
	
	/**
	 * Function created for tests, clears deferred get queue.
	 */
	LocalizedRepository.prototype._clearDeferredGetQueue = function() {
		deferredGetCalls.splice( 0, deferredGetCalls.length );
	};

	return LocalizedRepository;
} );