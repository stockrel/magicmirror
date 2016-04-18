/* global Module */

/* Magic Mirror
 * Module: CurrentWeather
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("tcl",{


	// Default module config.
	defaults: {
		map : null,
		retryDelay: 5000,
	},

	// Define required scripts.
	getScripts: function() {
		return ["infobox.js"];
	},

	// Define required scripts.
	/*getStyles: function() {
		return [];
	},*/

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		/*moment.locale(config.language);*/
		this.markers = [];
		this.windSpeed = null;
		this.sunriseSunsetTime = null;
		this.sunriseSunsetIcon = null;
		this.temperature = null;
		this.weatherType = null;

		this.loaded = false;
		/*this.scheduleUpdate(this.config.initialLoadDelay);
*/
		this.updateTimer = null;

	},

	/*showError: function(error) {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        geolocError = "User denied the request for Geolocation."
                        break;
                    case error.POSITION_UNAVAILABLE:
                        geolocError = "Location information is unavailable."
                        break;
                    case error.TIMEOUT:
                        geolocError = "The request to get user location timed out."
                        break;
                    case error.UNKNOWN_ERROR:
                        geolocError = "An unknown error occurred."
                        break;
                }
            },

            getLocation: function() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(getPosition, showError);
                } else { 
                    geolocError = "Geolocation is not supported by this browser.";
                }
            },

            getPosition: function(position) {
              console.log("setting position to ",position.coords.latitude,position.coords.longitude)
                latitude = position.coords.latitude;
                longitude =  position.coords.longitude; 
            }

             getLocation();*/

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.id = "map";
		wrapper.style.height = "500px";
		wrapper.style.width = "1200px";
       	this.map = new google.maps.Map(wrapper, {
          center: {lat: 45.768946, lng: 4.832159},
          zoom: 16,
          disableDefaultUI: true
        });
        this.map.set('styles',[
					    {
					        "featureType": "all",
					        "elementType": "labels.text.fill",
					        "stylers": [
					            {
					                "color": "#FFFFFF"
					            },
					            {
					                "lightness": 16
					            }
					        ]
					    },
					    {
					        "featureType": "all",
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "visibility": "off"
					            },
					            {
					                "color": "#FFFFFF"
					            },
					            {
					                "lightness": 16
					            }
					        ]
					    },
					    {
					        "featureType": "all",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "administrative",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "color": "#000000"
					            },
					            {
					                "lightness": 20
					            }
					        ]
					    },
					    {
					        "featureType": "administrative",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "color": "#000000"
					            },
					            {
					                "lightness": 17
					            },
					            {
					                "weight": 1.2
					            }
					        ]
					    },
					    {
					        "featureType": "landscape",
					        "elementType": "all",
					        "stylers": [
					            {
					                "color": "#000000"
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#000000"
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#666666"
					            },
					            {
					                "lightness": 17
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#666666"
					            },
					            {
					                "lightness": 18
					            }
					        ]
					    },
					    {
					        "featureType": "road.local",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#666666"
					            },
					            {
					                "lightness": 16
					            }
					        ]
					    },
					    {
					        "featureType": "transit",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#641E16"
					            },
					            {
					                "lightness": 19
					            }
					        ]
					    },
					    {
					        "featureType": "water",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#2B547E",
					                "lightness" : -10
					            }
					        ]
					    }
					]);
	var self = this;
	var url = "https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=500&request=GetFeature&typename=jcd_jcdecaux.jcdvelov";
	var velovRequest = new XMLHttpRequest();
		velovRequest.open("GET", url, true);
		velovRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processVelov(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.config.appid = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}
				

				self.scheduleUpdate(self.config.retryDelay);
				self.loaded = true;
				/*if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}*/
			}
		};
		velovRequest.send();

		return wrapper;
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateVelov: function() {
		console.log("updateVelov : "+new Date())
		var retry = true;

		var self = this;
		self.loaded = false;
		var url = "https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=500&request=GetFeature&typename=jcd_jcdecaux.jcdvelov";
		var velovRequest = new XMLHttpRequest();
		velovRequest.open("GET", url, true);
		velovRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processVelov(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.config.appid = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate(self.config.retryDelay);
				}
			}
		};
		velovRequest.send();

	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	/*getParams: function() {
		var params = "?";
		params += "q=" + this.config.location;
		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

		return params;
	},*/

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */

	distance: function(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist
	},

	processVelov: function(data) {
		var infoboxWrapper = document.createElement("div");
		infoboxWrapper.id = "infoboxWrapper"
		infoboxWrapper.className = "infobox-wrapper";
		document.getElementById("map").appendChild(infoboxWrapper);

		for (var m = 0 ; m < this.markers.length ; m++){
			this.markers[m].setMap(null);
		}
		this.markers = [];

		for (var i = 0 ; i < data.features.length ; i++){
			if (this.distance(45.768946, 4.832159,data.features[i].geometry.coordinates[1],data.features[i].geometry.coordinates[0],'K') <= 0.4){
				console.log("velov station "+data.features[i].properties.name+" matches distance criteria, bikes available : "+data.features[i].properties.available_bikes);

				
				var image = new google.maps.MarkerImage(
							(parseInt(data.features[i].properties.available_bikes) > 0) ? './img/green_dot.svg' : './img/red_dot.svg',
							null, // size
							null, // origin
							new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
							new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
						);
				 

				var marker = new google.maps.Marker({
					flat: true,
					icon: image,
					map: this.map,
					optimized: false,
					visible: true,
					status: (parseInt(data.features[i].properties.available_bikes) > 0) ? 'available' : 'empty',
				    position: {
				    	lat: data.features[i].geometry.coordinates[1],
				    	lng: data.features[i].geometry.coordinates[0]
				    },
				    map: this.map,
				    title: (parseInt(data.features[i].properties.available_bikes) > 0) ? 'available' : 'empty',
				    icon: image
				  });
				this.markers.push(marker);
				/*infobox.open(this.map,marker);*/
			}
		}

		this.loaded = true;
		//this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateVelov();
		}, nextLoad);
	},


});
