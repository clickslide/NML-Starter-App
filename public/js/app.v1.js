/**
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/ or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 * This is a sample web app demonstrating how to implement a data driven application using NML.js library. This app uses Twitter Bootstrap 3, Jquery 1.10, jsviews and NMLjs. Templates are loaded from the template diretory.
 * Copyright 2014 Clickslide Limited. All rights reserved.
 * @namespace NML.js
 */
$(function () {

    /** Simple holder to tell which template system we are using **/
    var tmpsrc = "jsviews";

    /**
     * Step 1: Create the NML object
     */
    var nml = new NML();
    //nml.setBaseUrl(appconfig.url, 'http', 'clickslide.loc');
    nml.setBaseUrl(appconfig.url, 'https', 'datadipity.com');

//    $button.on('click', function(evt){
//
//        $.get('https://datadipity.com....?message=xyz&num=xyz');
//    });

    /**
     * Callback for NML.get function
     * This is where we will process the data
     */
    var onGetData = function (nmldata) {
        console.log(nmldata);
        var json = JSON.parse(nmldata);
        var map = L.map('map');

//        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
//			maxZoom: 18,
//			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
//			id: 'examples.map-i875mjb7'
//		}).addTo(map);
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-i875mjb7'
        }).addTo(map);

        function onLocationFound(e) {
            var radius = e.accuracy / 2;
            var myIcon = L.icon({
                iconUrl: 'img/crown.png',
                iconRetinaUrl: 'img/crown.png',
                iconSize: [38, 38]
            });
            L.marker(e.latlng).bindPopup("<h5>Your Location</h5>").addTo(map);
        }

        function onLocationError(e) {
            console.log(e);
        }

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        map.locate({
            setView: true,
            maxZoom: 11
        });
        // legend

        // set the home page ID for later use
        nml.setHomePageId(json.ListPage["@attributes"].id);
        var array = json.ListPage.pages.BasicPage;
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
                    }else{
                        disct = districts[feature.properties.communityDistrict];
                        console.log(disct);
                        layer.bindPopup("<h5>Not Yet Available</h5>");
                    }

                }
            }).addTo(map);

        });
    }
    // custom callback for Logging in
    var onLoginOrRegister = function (data) {
        //console.log(data.session);
        // TODO: Check for login success

        if (data.session != null && data.session != undefined) {
            // $('#loadertext').html("Loading Tweets...");
            nml.onLogin(data);
            nml.get(onGetData, true);
        } else {
            // add message to login modal
            //nml.Register("Aaron Franco", "aaron@clickslide.co", "4gFFr4nc0", "4gFFr4nc0", onLoginOrRegister);
        }
    }
    //nml.get(onGetData, true);
    nml.Login("aaron@clickslide.co", "4gFFr4nc0", onLoginOrRegister);
});
