/**
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/ or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 * This is a sample web app demonstrating how to implement a data driven application using NML.js library. This app uses Twitter Bootstrap 3, Jquery 1.10, jsviews and NMLjs. Templates are loaded from the template diretory.
 * Copyright 2014 Clickslide Limited. All rights reserved.
 * @namespace NML.js
 */
/*jshint unused: false */
/* global window, $, appconfig, NML, document, device */
var app = {
    /**
     * Callback for NML.get function
     * This is where we will process the data
     */
    onGetData: function (nmldata) {
        console.log("Got NML Data");
        console.log(nmldata);
        if (nmldata === null || nmldata === "" || nmldata === " ") {
            app.runLogin();
            //alert("Please be sure to enter an american phone number");
        } else {
            try {
                app.json = JSON.parse(nmldata);
            } catch (err) {
                app.json = nmldata;
            }
            app.map = L.map('map');

            L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-i875mjb7'
            }).addTo(app.map);
            L.control.locate().addTo(app.map);
            app.map.locate({
                setView: true,
                maxZoom: 11
            });
            app.map.on('locationfound', app.onLocationFound);
            app.map.on('locationerror', app.onLocationError);
            app.nml.setHomePageId(app.json.ListPage["@attributes"].id);
            var array = app.json.ListPage.pages.BasicPage;

            var markers = [];
            // roboto condensed
            var districts = {};
            _.each(array, function (item) {
                var id = parseInt(item.uniqueApiId);
                switch (item.title) {
                case "Manhattan":
                    id += 100;
                    break;
                case "Queens":
                    id += 400;
                    break;
                case "Bronx":
                    id += 200;
                    break;
                case "Brooklyn":
                    id += 300;
                    break;
                case "Staten Island":
                    id += 500;
                    break;

                }
                districts[id] = {
                    total: 0,
                    count: 0,
                    avg: 0,
                    paperhigh: 0,
                    paperlow: 0,
                    paperavg: 0,
                    refusehigh: 0,
                    refuselow: 0,
                    refuseavg: 0,
                    mgplow: 0,
                    mgphigh: 0,
                    mgpavg: 0,
                    name: ""
                }
            });
            _.each(array, function (item) {
                //districts[item.uniqueApiId] = {}
                var id = parseInt(item.uniqueApiId);
                switch (item.title) {
                case "Manhattan":
                    id += 100;
                    break;
                case "Queens":
                    id += 400;
                    break;
                case "Bronx":
                    id += 200;
                    break;
                case "Brooklyn":
                    id += 300;
                    break;
                case "Staten Island":
                    id += 500;
                    break;

                }
                districts[id].total += (
                    parseInt(item.glong) +
                    parseInt(item.glat) +
                    parseInt(item.pageText)
                );
                districts[id].name = item.title;
                districts[id].count++;
                districts[id].paperlow = _.min(array, function (o) {
                    return parseInt(o.glong);
                });
                districts[id].paperhigh = _.max(array, function (o) {
                    return parseInt(o.glong);
                });
                districts[id].refuselow = _.min(array, function (o) {
                    return parseInt(o.glat);
                });
                districts[id].refusehigh = _.max(array, function (o) {
                    return parseInt(o.glat);
                });
                districts[id].mgplow = _.min(array, function (o) {
                    return parseInt(o.pageText);
                });
                districts[id].mgphigh = _.max(array, function (o) {
                    return parseInt(o.pageText);
                });
            });
            var distmin = _.min(districts, function (o) {
                return o.total;
            });
            var distmax = _.max(districts, function (o) {
                return o.total;
            });
            console.log([distmin.total, distmax.total]);
            var scale = chroma.scale(['green', 'red']).domain([distmin.total, distmax.total]);


            // don't do anything until the template loads
            $.getJSON("community.json").done(function (data) {
                var distr;
                app.initGui();
                L.geoJson(data, {
                    style: function (feature) {
                        var hexi = "#000";
                        if (districts[feature.properties.communityDistrict] != undefined) {
                            var int = districts[feature.properties.communityDistrict].total;
                            //console.log(scale(int));
                            hexi = scale(int).hex();
                        }
                        return {
                            fillColor: hexi,
                            color: "#000",
                            fillOpacity: 100,
                            weight: 1,
                            opacity: 100
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        if (districts[feature.properties.communityDistrict] != undefined) {
                            disct = districts[feature.properties.communityDistrict];
                            console.log(disct);
                            layer.bindPopup("<h5>" + disct.name + " " + feature.properties.communityDistrict + "</h><p>" + disct.total + " tons collected.</p>");
                        } else {
                            disct = districts[feature.properties.communityDistrict];
                            console.log(disct);
                            layer.bindPopup("<h5>Not Yet Available</h5>");
                        }

                    }
                }).addTo(app.map);

            });

        }
    },
    onLocationFound: function (e) {
        var radius = e.accuracy / 2;
        var myIcon = L.icon({
            iconUrl: 'img/crown.png',
            iconRetinaUrl: 'img/crown.png',
            iconSize: [38, 38]
        });
        L.marker(e.latlng).bindPopup("<h5>Your Location</h5>").addTo(app.map);
    },

    onLocationError: function (e) {
        throw e;
    },
    /**
     * Give all the GUI elements their event listeners
     */
    initGui: function () {
        $("#map").hide();
        $("#information").show();
        $("#homebtn").bind('click', function(evt){
            $("#information").hide();
            $("#map").show();
        });
        $("#infobtn").bind('click', function(evt){
            $("#map").hide();
            $("#information").show();
        });
        $('#loading').fadeOut();
    },
    isGap: false,
    nml: null,
    tmpsrc: null,
    socket: null,
    json: {},
    screen: "#home",
    // Application Constructor
    initialize: function () {
        console.log("App Init");
        app.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function () {
        console.log("App Bind Events");
        if (document.location.protocol === "file:") {
            console.log("Phonegap App");
            app.isGap = true;
            document.addEventListener(
                "deviceready",
                app.onDeviceReady,
                false
            );
        } else {
            console.log("Browser App");
            // no phonegap, start initialisation immediately
            $(document).ready(function () {
                app.onDeviceReady();
            });
        }
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        console.log("App & Device Ready");
        $("#information").hide();
        $('#map').hide();
        app.nml = new NML();
        app.nml.initWithData = true;
        app.nml.isGap = app.isGap;
        app.nml.onGetData = app.onGetData;
        app.nml.setBaseUrl(appconfig[0].url, 'https', 'datadipity.com');
        app.nml.loginHandler = app.onLoginOrRegister;
        //app.runLogin();
        // TODO: Move to NML.js
        if (window.localStorage.appconfig !== undefined && window.localStorage.appconfig !== null) {
            var sessData = JSON.parse(window.localStorage.appconfig);
            if (sessData[0].url === appconfig[0].url) {
                if (sessData[0].sessid !== null && sessData[0].sessid !== undefined && sessData[0].sessid !== "") {
                    // got session already
                    app.nml.setAppConfig(sessData);
                    //app.onGetData();
                    app.nml.get(0, app.onGetData, true);
                } else {
                    $('#loader').modal('toggle');
                    app.runLogin();
                }
            } else {
                $('#loader').modal('toggle');
                app.runLogin();
            }
        } else {
            $('#loader').modal('toggle');
            app.runLogin();
        }
    },
    runLogin: function () {
        app.nml.loginHandler = app.onLoginOrRegister;
        app.nml.setAppConfig(appconfig);
        if (app.isGap) {

            app.nml.Login(device.uuid + "@clickslide.co", "password", app.onLoginOrRegister, app.nml);
        } else {
            var hash = CryptoJS.MD5(navigator.userAgent);
            app.nml.Login(hash.toString() + "@clickslide.co", "password", app.onLoginOrRegister, app.nml);
        }
        //app.nml.loadDialogs(app.onAppReady, app.nml, appconfig);
    },
    // custom callback for Logging in
    onLoginOrRegister: function (data) {
        console.log("Logged In Via App");
        console.log(data);
        // TODO: Check for login success

        if (data.session !== null && data.session !== undefined) {
            // $('#loadertext').html("Loading Tweets...");

            app.nml.onLogin(data);

            if (data.registerApis === true || data.registerApis === "true") {
                app.nml.manageAuthRedirect(app.nml);
            } else {
                $('#loader').modal('toggle');
                app.nml.get(0, app.onGetData, true);
            }
        } else {
            // add message to login modal
            if (app.isGap) {
                app.nml.Register(
                    device.uuid,
                    device.uuid + "@clickslide.co",
                    "password",
                    "password",
                    app.onLoginOrRegister
                );
            } else {
                console.log("Registering User Agent");
                var hash = CryptoJS.MD5(navigator.userAgent);
                console.log(navigator.userAgent);
                console.log(hash.toString());
                app.nml.Register(
                    hash.toString(),
                    hash.toString() + "@clickslide.co",
                    "password",
                    "password",
                    app.onLoginOrRegister
                );
            }

        }
    },
};
