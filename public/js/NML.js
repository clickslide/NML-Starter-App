/**
 * Datadipity.NML is an extensible object oriented JavaScript library for connecting and communicating with Datadipity.com APIs. This is designed to drasitically reduce development time when building connected products and software. Copyright 2014 Clickslide Limited. All rights reserved.
 * @namespace Datadipity
 */
function NML() {
    /** @protected */
    this.created = false;

    /** @protected */
    this.BaseUrl = null;

    /** @protected */
    this.homePageId = null;

    this.search = "0";

    /**
     * Set the homePageId parameter.
     * @function setHomePageId
     * @memberOf Datadipity
     * @param {String} id - id of the homepage
     * @return null
     */
    this.setHomePageId = function (id) {
        this.homePageId = id;
    }

    /**
     * Get the homePageId parameter.
     * @function setHomePageId
     * @memberOf Datadipity
     * @return null
     */
    this.getHomePageId = function () {
        return this.homePageId;
    }

    /**
     * Set the BaseUrl parameter.
     * @function setBaseUrl
     * @memberOf Datadipity
     * @param {String} url - the url as developer/app based on your Datadipity API.
     * @param {String} protocol - http or https, always https for Datadipity.com
     * @param {String} host - datadipity.com
     * @return null
     */
    this.setBaseUrl = function (url, protocol, host) {
        this.BaseUrl = protocol + "://" + host + "/" + url;
    }
    /**
     * Get the BaseUrl parameter.
     * @function getBaseUrl
     * @memberOf Datadipity
     * @return {String} BaseUrl - The base url variable
     */
    this.getBaseUrl = function () {
        return this.BaseUrl;
    }

    /** @protected */
    this.Session = null;
    this.setSession = function (sess) {
        this.Session = sess;
    }
    this.getSession = function () {
        return this.Session;
    }
    /**
     * Create a new NML object that will connect with Datadipity.com
     * @constructor
     * @function NML
     * @memberOf Datadipity
     * @return null
     */
    var __construct = function () {
        // so nothing in the constructor
        this.created = true;
    }(this)

    /**
     * Add a new user to an app.
     * @function Register
     * @memberOf Datadipity
     * @description Registration and Login use similar functionality. New users and possibly returning users will have to authorize API services. Once logged in or registered, if authorization is required, Clickslide will return a "registerApis=true" in its JSON response. The manageAuthRedirect Method in the example handles this behavior. It is altered slightly in Cordova Phonegap.
     * @param {String} userName - Name of user to register
     * @param {String} userEmail - Email address of the user ro register
     * @param {String} userPassword1 - Email address of the user to register
     * @param {String} userPassword2 - Verify the user password
     * @param {Function} callback - a custom function to override the onRegister method. This method will take a data object as an argument.
     * @example 
     // Redirect users to authorize APIs on behalf of the App
     var manageAuthRedirect = function () {
        $("#authlink").attr('href', nml.BaseUrl + '/register/apis?PHPSESSID=' + nml.Session);
        $("#authlink").click(function (evt) {
            evt.preventDefault();
            var url = evt.currentTarget.href;
            var popup = open(url, 'App Authorization', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350');
            var timer = setInterval(function () {
                if (popup.closed) {
                    clearInterval(timer);
                    nml.get(onGetData, true);
                }
            }, 100);
        });
    }
    // custom callback for Logging in & registration
    // both results can share identical behavior because Clickslide automatically logs new users in and returns an identical piece of JSON as a result.
    var onLoginOrRegister = function (data) {
        if (data.session != null && data.session != undefined) {
            nml.onLogin(data);
        
            if (data.registerApis == true || data.registerApis == 'true') {
                // force API authorization
                manageAuthRedirect();
            } else {
                // if we don't need to authorize APIs
                nml.get(onGetData, true);
            }
        } else {
            // error message
            alert("No session was returned");
        }
    }
    // Initialize App by Logging a user in
    $("#loginForm").on('submit', function (evt) {
        evt.preventDefault();
        var email = $('#loginEmail').val();
        var password = $('#loginPassword').val();
        nml.Login(email, password, onLoginOrRegister);
    });
    // register a new user
    $("#registerForm").on('submit', function (evt) {
        evt.preventDefault();
        var name = $('#registerName').val();
        var email = $('#registerEmail').val();
        var password = $('#registerPassword').val();
        var password2 = $('#registerPassword2').val();
        nml.Register(name, email, password, password2, onLoginOrRegister);
    });
     * @return null
     */
    this.Register = function (userName, userEmail, userPassword1, userPassword2, callback) {
        var next = null;
        if (callback != null) {
            next = callback;
        } else {
            next = this.onRegister;
        }
        // simple validation
        if (userEmail.length == 0) {
            alert('Enter valid email address');
            return true;
        }
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(userEmail)) {
            alert('Enter valid email address');
            return false;
        }
        if (userName.length == 0) {
            alert('Enter name');
            return false;
        }
        if (userPassword1.length == 0) {
            alert('Enter password');
            return false;
        }
        if (userPassword2.length == 0) {
            alert('Repeat password');
            return false;
        }
        if (userPassword1 != userPassword2) {
            alert('Password is not the same');
            return false;
        }
        
        var nml = this;

        $.ajax({
            type: 'POST',
            url: this.BaseUrl + "/register/doRegister.json",
            crossDomain:true,
            data:{
                name: userName,
                email: userEmail,
                password: userPassword1
            },
            success: function(data){
                next(data, nml);   
            },
            error: this.failedRequest
        });
    }

    /**
     * Default callback for the Register method.. This function does nothing at the moment except log the data returned. You should override this in your app by sending a <callback> function to the Register function.
     * @function onRegister
     * @memberOf Datadipity
     * @param {Object} data - This is the JSON object coming from the server.
     * @param {Object} nml - This is the NML object used to maintain scope. TODO: Manage Scope internally
     * @return null
     */
    this.onRegister = function (data, nml) {
        // default callback for Login 
        console.log(data);
        
        if( data.success == true 
           || data.success == 'true'){
            
            nml.Session = data.session.id;
            
            if( data.registerApis == true 
               || data.registerApis == 'true'){
                
                // force redirect
                //window.location = nml.BaseUrl+'/register/apis';
               // alert(nml.BaseUrl);
                window.open(nml.BaseUrl+'/register/apis?PHPSESSID='+nml.Session,'App Authorization','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350');
            }
        }
    }

    /**
     * Login an App user or developer to their Clickslide account.
     * @method Login
     * @memberOf Datadipity
     * @param {String} userEmail - Email address of the user to login
     * @param {String} userPassword - To be used once to connect for a session *DO NOT STORE THIS*
     * @param {Function} callback - a custom function to override the onLogin method. This method will take a data object as an argument.
     * @summary See {@link Datadipity.Register|NML.Register} for sample code.
     * @return null
     */
    this.Login = function (userEmail, userPassword, callback) {
        var next = null;
        var nml = this;
        if (callback != null) {
            next = callback;
        } else {
            next = this.onLogin;
        }
        
        $.ajax({
            type: 'POST',
            url: this.BaseUrl + "/login/doLogin.json",
            crossDomain:true,
            data:{  
                email: userEmail,
                password: userPassword
            },
            success: function(data){
                next(data);   
            },
            error: this.failedRequest
        });
    }

    /**
     * Default callback for the Login method.. This function sets the user session for this NML object. You can override this but we suggest calling NML.onLogin(data) in the first line of your custom callback to make sure the NML object maintains its session data properly.
     * @function onLogin
     * @memberOf Datadipity
     * @param {Object} data - This is the JSON object coming from the server.
     * @summary This method will redirect to the API authentication page if the logged in user needs to authenticate with any APIs used in the application.
     * @return null
     */
    this.onLogin = function (data) {
        // default callback for Login 
        if( data.success == true 
           || data.success == 'true'){
            // save the session
            this.Session = data.session.id;
        }
    }

    /**
     * POST data to Datadipity.com to create a new resource or trigger the "add" event for API communication. TODO: Add the ability to upload files.
     * @function add
     * @memberOf Datadipity
     * @param {String} action - This is an NML String representing the resource to add. This resource will be parsed and will trigger the API events on the server side. <BasicPage>...</BasicPage>
     * @param {String} pageType - A NML page type in lowercase and plural: basicpages, listpages, etc. It depends on the type of page you are posting to the ListPage and which type of page it accepts.
     * @param {Function} callback - A custom callback function to override the default. This takes an NML object as an argument.
     * @return null
     */
    this.add = function (action, pagesType, callback) {
        var next = null;
        if (callback != null) {
            next = callback;
        } else {
            next = this.processPageData;
        }
        console.log(next);
        // post request to Datadipity.com
        $.get(
            this.BaseUrl + "/" + pagesType + ".xml?_method=post&_action=" + action + "&PHPSESSID=" + this.Session
        ).done(next);

    }

    /**
     * Update an NML resource on the Datadipity server
     * @function update
     * @memberOf Datadipity
     * @param {String} action - This is an NML String representing the resource to add. This resource will be parsed and will trigger the API events on the server side. <BasicPage>...</BasicPage>
     * @param {String} pageType - A NML page type in lowercase and plural: basicpages, listpages, etc. It depends on the type of page you are posting to the ListPage and which type of page it accepts.
     * @param {Function} callback - A custom callback function to override the default. This takes an NML object as an argument.
     * @return null
     */
    this.update = function (action, pageType, callback) {
        var next = null;
        if (callback != null) {
            next = callback;
        } else {
            next = this.processPageData;
        }
        // GET put request to Datadipity.com
        // post request to Datadipity.com
        $.get(
            this.BaseUrl + "/" + pagesType + ".xml?_method=put&_action=" + action + "&PHPSESSID=" + this.Session
        ).done(next);
    }

    /**
     * Remove a resource from the Datadipity server using basic pages as an example it would look similar to https://datadipity.com/developerurl/apiurl/basicpages/1234.xml?_method=delete
     * @function remove
     * @memberOf Datadipity
     * @param {String} pageType - the type of page eg: basicpages, listpages, linkpages, etc.
     * @param {String} pageId - Required to execute a delete on a resource
     * @return null
     */
    this.remove = function (pageType, pageId, callback) {
        var next = null;
        if (callback != null) {
            next = callback;
        } else {
            next = this.processPageData;
        }
        // GET delete request to Datadipity.com using XML
        $.get(
            this.BaseUrl + "/" + pagesType + "/" + pageId + ".xml?_method=delete&PHPSESSID=" + this.Session
        ).done(next);
    }

    /**
     * A simple method to get a single NML object or a collection of objects. Urls for requests are formed as NML.AppUrl/pageUrl.json or NML.AppUrl/pageTypespageId.json. This uses JSON by default. This has an XML endpoint but is not implemented in JavaScript.
     * @function get
     * @memberOf Datadipity
     * @param {Function} callback - A function to override the default event listener.
     * @param {Boolean} withUpdate - Adds ?update to force the API data provider to refresh
     * @param {Array} postparams - Adds ?postparam[key]=val from [{name:key, value:val}] for every Object in the array
     * @param {String} pageType - basicpages, listpages, linkpages, etc.
     * @param {String} pageId - The ID parameter from the @attributes.id element
     * @param {String} pageUrl - This will override using pageType/pageId 
     * @todo More testing needs to be done using individual page types.
     * @return null
     */
    this.get = function (callback, withUpdate, postparams, pageType, pageId, pageUrl) {
        var next = null
        if (callback) {
            next = callback;
        } else {
            next = null;
        }

        // get request to Datadipity.com
        var reqUrl = this.BaseUrl;
        try {
            if (pageType != null && pageId == null) {
                // get the collection
                reqUrl = this.BaseUrl + "/" + pageType.toLowerCase();
            } else if (pageId != null && pageType == null) {
                throw {
                    name: "Configuration Error",
                    level: "Cancel Request",
                    message: "pageType cannot be null when pageId is not. NML.get()"
                }
            } else if (pageId != null && pageType != null) {
                // pageType and pageId are both set
                reqUrl = this.BaseUrl + "/" + pageType.toLowerCase() + "/" + pageId.toLowerCase();
            }
        } catch (err) {
            console.log("error");
            console.log(err);
        }

        if (pageUrl != null) {
            reqUrl = this.BaseUrl + "/" + pageUrl.toLowerCase();
        }

        // include the session
        if (withUpdate == true) {
            reqUrl += ".json?update&PHPSESSID=" + this.Session;
        } else {
            reqUrl += ".json?PHPSESSID=" + this.Session;
        }


        // include postparams
        if (postparams != null && postparams.length > 0) {
            var c = postparams.length;
            for (var i = 0; i < c; i++) {
                reqUrl += "&postparam[" + postparams[i].name + "]=" + postparams[i].value;
            }
        }
        var that = this;
        // get the request
        $.ajax({
            type: "GET",
            url: reqUrl,
            dataType: "text"
        }).done(next).fail(this.failedRequest);
    }
    this.failedRequest = function (xhr, status, err) {
        console.log(err);
    }
    /**
     * Description
     * @function processPageData
     * @memberOf Datadipity
     * @param {Object} data
     * @return null
     */
    this.processPageData = function (data) {
        // load homepage template
        this.search = data.ListPage.search;
        this.setHomePageId(data.ListPage['@attributes'].id);
    }
    /**
     * TODO: Extract the parentPage (if it exists) using a page ID
     * @function getParentPage
     * @memberOf Datadipity
     * @param {String} pageid - the current page id
     * @return Object - the parent page
     */
    this.getParentPage = function (pageid) {
        // TODO: make this work
    }
}