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
	}

	LocalizedRepository.prototype = new Repository();
	LocalizedRepository.prototype.constructor = LocalizedRepository;

	LocalizedRepository.prototype._langDictionary = {};
	
	// An array of arguments from calls that were deferred.
	var deferredGetCalls = {},
		languagesRequested = [];

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
	 * @param {String} [langCode='en]
	 * @returns {Function}
	 */
	LocalizedRepository.prototype.get = function( name, callback, langCode ) {
		langCode = langCode || 'en';
		if ( this.deferGetCall( langCode, arguments ) ) {
			// Call should be deferred, because no lang is available yet.
			return;
		}
		
		// If lang is available call to the base class.
		return Repository.prototype.get.call( this, name, callback );
	};
	
	/**
	 * Similar to {@link #get} but returns localized instance rather than class.
	 *
	 * Please note that options.callback is mandatory.
	 *
	 * @todo: this method should be also available in generic class.
	 */
	LocalizedRepository.prototype.getInstance = function( options ) {
		options = options || {};
		var name = options.name,
			langCode = options.langCode  || 'en',
			that = this,
			devDistribution = CKEDITOR.plugins.a11ychecker.dev;
		
		this.get( name, function( QuickFixType ) {
			// This callback is guaranteed to be called when dictionary for langCode is fetched.
			var instance = new QuickFixType( options.issue );
			
			if ( devDistribution ) {
				// We only need to assign lang for dev version, built class will already have this property.
				instance.lang = that._langDictionary[ langCode ][ name ];
			}
			
			options.callback( instance );
		}, langCode );
	};
	
	
	/**
	 * If needed will defer {@link #get} call.
	 *
	 * @returns {Boolean} `true` if call was deferred, `false` otherwise.
	 */
	LocalizedRepository.prototype.deferGetCall = function( langCode, getArguments ) {
		var indexOf = CKEDITOR.tools.indexOf;
		if ( !CKEDITOR.plugins.a11ychecker.dev || this._langDictionary[ langCode ] ) {
			// Deferring is always disabled in built version, and if _langDictionary is already
			// loaded.
			return false;
		}
		
		this._addDeferredGet( langCode, getArguments );
		
		if ( indexOf( languagesRequested, langCode ) === -1 ) {
			// This particular language was not requested yet.
			languagesRequested.push( langCode );
			CKEDITOR.scriptLoader.load( this.basePath + 'lang/' + langCode + '.js' );
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
	LocalizedRepository.prototype.lang = function( langCode, dictionary ) {
		this._langDictionary[ langCode ] = dictionary;
		
		var getQueue = deferredGetCalls[ langCode ];
		
		if ( !getQueue ) {
			// No get calls were queued for that language.
			return;
		}
		
		// All deferred gets should be called in reversed order.
		for ( var i = getQueue.length - 1; i >= 0; i-- ) {
			this.get.apply( this, getQueue[ i ] );
		}
	};
	
	LocalizedRepository.prototype._addDeferredGet = function( langCode, getArguments ) {
		if ( deferredGetCalls[ langCode ] ) {
			deferredGetCalls[ langCode ].push( getArguments );
		} else {
			deferredGetCalls[ langCode ] = [ getArguments ];
		}
	};
	
	
	/**
	 * Function created for tests, returns count of deferred get functions.
	 *
	 * @returns {Number}
	 */
	LocalizedRepository.prototype._getDeferredGetCount = function( langCode ) {
		return deferredGetCalls[ langCode ] ? deferredGetCalls[ langCode ].length : 0;
	};
	
	/**
	 * Function created for tests, clears deferred get queue.
	 */
	LocalizedRepository.prototype._clearDeferredGetQueue = function() {
		deferredGetCalls = {};
	};

	return LocalizedRepository;
} );