            //declaration of variables and locs array    
                
                var locs = [
                { id: 0, title: 'gateway of india', location: { lat: 18.9220, lng: 72.8347 } },
                { id: 1, title: 'haji ali dargah', location: { lat: 18.9827, lng: 72.8090 } },
                { id: 2, title: 'essel world', location: { lat: 19.2327, lng: 72.8055 } },
                { id: 3, title: 'Mahalakshmi temple', location: { lat: 18.9774, lng: 72.8065 } },
                { id: 4, title: 'mumba devi temple', location: { lat: 18.9518, lng: 72.8309 } },
                { id: 5, title: 'worli fort', location: { lat: 19.0237, lng: 72.8168 } }
                ];
                var map;
                var markers = [];
                var placeMarkers = [];
                var marker;


                var appViewModel = function () {
                    function timeout(markr) {
                        markr.setAnimation(null);
                    }
                    var self = this;
                    this.placeList = ko.observableArray([]);
                    for (var j = 0; j < locs.length; j++) {
                        self.placeList.push(locs[j]);
                    }
                    for (var i = 0; i < locs.length; i++) {
                        console.log(i);
                        self.placeList()[i].marker = markers[i];
                    }
                    this.CurrentPlace = function (LocClicked) {
                        var marker;
                        for (var i = 0; i < self.placeList().length; i++) {
                            var id = self.placeList()[i].id;
                            if (LocClicked.id == id) {
                                this.currentLocation = self.placeList()[i];
                                marker = markers[self.placeList()[i].id];
                            }
                        }
                        if (!marker) alert('Something was wrong!');
                        else {
                            marker.setAnimation(google.maps.Animation.BOUNCE);
                            // when either the marker or location is selected open up the info window
                            google.maps.event.trigger(marker, 'click');
                        }
                    };
                    this.find = ko.observable('');
                    this.TSearch = function (value) {
                        console.log(value);
                        sboxMethod(value);
                    };

                    this.foundLocation = ko.observable('');
                    this.Filtr = function (value) {
                        self.placeList.removeAll();
                        for (var i = 0; i < locs.length; i++) {
                            var searchQuery = locs[i].title.toLowerCase();
                            // find the starting match in every location
                            
                            if (searchQuery.indexOf(value.toLowerCase()) >= 0) {
                                self.placeList.push(locs[i]);
                            }
                        }
                    };

                    this.FilterMarkers = function (value) {
                        for (var i in locs) {
                            var temp = markers[i];
                            if (temp.setMap(this.map) !== null) {
                                temp.setMap(null);
                            }
                            var searchQuery = temp.title.toLowerCase();
                            if (searchQuery.indexOf(value.toLowerCase()) >= 0) {
                                temp.setMap(map);
                            }
                        }
                    };
                    this.foundLocation.subscribe(this.Filtr);
                    this.foundLocation.subscribe(this.FilterMarkers);
                    this.find.subscribe(this.TSearch);
                };
                function getMarkerIcon(markercolor) {
                    var markerImage = new google.maps.MarkerImage('https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                        new google.maps.Size(21, 34),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(10, 34),
                        new google.maps.Size(21, 34)

                        );
                    return markerImage;
                }
                //when client made any serch this funtion helps 
                function sboxMethod(value) {
                    console.log(value);
                    var latlang = map.getBounds();
                    hideMarks(placeMarkers);
                    var pService = new google.maps.places.PlacesService(map);
                    pService.textSearch({
                        query: value,
                        bounds: latlang
                    },
                    function (results, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            createMarks(results);
                        } else {
                            window.alert("Sorry try again");
                        }
                    }
                    );
                }


      // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
                function popInfoWindow(marker, infowindow) {
                    // this funtion ensures info widow is open otherwise our app won't work

                    if (infowindow.marker != marker) {
                        // Clear  infowindow content to give the streetview time to load.
                        infowindow.setContent('');
                        infowindow.marker = marker;
                        // check the marker property is cleared if the infowindow is closed.
                        infowindow.addListener('closeclick', function() {
                            if(infowindow.marker !== null)
                                infowindow.marker.setAnimation(null);
                            infowindow.marker = null;
                        });

                        var streetViewService = new google.maps.StreetViewService();
                        var radii = 40;

                        infowindow.setContent(
                            '<div><h5 class=".h5" id="Title">' +
                            marker.title +
                            '</h5></div><div id="wiki-links" class="text-left text-info"><p>' +
                            '</p></div><div id="pano"></div>'
                            );

                        infowindow.open(map, marker);

                        var flag = true;
                        var wikiFlag = false;

                        var wikiElem = '';



                        //check the status if ok then get the streetview and set the panorama
                        function getStreetView(data, status) {
                            if (status == google.maps.StreetViewStatus.OK) {
                                var nearStreetLoc = data.location.latLng;
                                var head = google.maps.geometry.spherical.computeHeading( nearStreetLoc, marker.position);

                                //error handling
                                var errorTout = setTimeout(function() {
                                    alert("Something went wrong");
                                }, 9000);
                                clearTimeout(errorTout);

                                var panOptions = {
                                    position: nearStreetLoc,
                                    pov: {
                                        heading: head,
                                        // changes the angle of camera whether to look up or down
                                        pitch: 15
                                    }
                                };
                                var pan = new google.maps.StreetViewPanorama(
                                    document.getElementById('pano'), panOptions
                                    );
                            } else {
                                $('#wiki-links').text(wikiElem);
                                $('#pano').text('');
                                $('#pano').append("<span class='text-danger '> Street View Not Found</span>");
                                flag = false;
                            }
                        }

                        // Use streetview service to fetch the streetview image withe the 40m radius of marker position
                        streetViewService.getPanoramaByLocation(marker.position, radii, getStreetView);
                        // open the infowindow on marker
                        infowindow.open(map, marker);
                        var wikiTout = setTimeout(function() {
                            wikiElem = 'failed to get wikipedia resources';
                        }, 8000);

                        var wikiUrl = 'https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=' +
                        marker.title + '&format=json';

                        $.ajax({
                            url:wikiUrl,
                            dataType:"jsonp",
                            success:function(data) {
                                wikiFlag = true;
                                for(var i = 1; i < data.length; i++) {
                                    var artList = data[i];
                                    for(var j = 0; j < artList.length; j++) {
                                        articlestr = artList[j];
                                        if(articlestr.length > wikiElem.length) {
                                            wikiElem = articlestr;
                                        }
                                    }
                                }
                                console.log(wikiElem);
                                if(flag === false) {
                                    $('#wiki-links').text(wikiElem);
                                    $('#pano').text("");
                                    $('#pano').append("<span class='text-danger '>No Street View Found</span>");
                                } else {
                                    $('#wiki-links').text(wikiElem);
                                }
                                clearTimeout(wikiTout);
                            }
                        }).fail(function(jqXHR, textStatus) {
                            if(jqXHR.status === 0) {
                                alert('No Internet Connection Detected!');
                            } else if(jqXHR.status == 404) {
                                alert('CALLBACK Error in Html Detected');
                            }
                            else alert("Failed to Resolve Request:" + textStatus + "\n");
                        });
                    }
                }
                function setMarkers(map) {
                    var lInfowindow = new google.maps.InfoWindow();
                    var dIcon = getMarkerIcon('#FF0000');
                    var highIcon = getMarkerIcon('#ffffff');
                    var latlang = new google.maps.LatLngBounds();
                    for (var k = 0; k < locs.length; k++) {
                        var pos = locs[k].location;
                        var title = locs[k].title;
                        var marker = new google.maps.Marker({
                            map: map,
                            title: title,
                            position: pos,
                            id: k,
                            animation: google.maps.Animation.DROP
                        });
                        markers.push(marker);
                        marker.addListener('click', markClick);
                        marker.addListener('mouseover', markin);
                        marker.addListener('mouseout', markout);
                        latlang.extend(markers[k].position);
                    }
                    map.fitBounds(latlang);
                    var sbox = new google.maps.places.SearchBox(document.getElementById('places-find'));
                    sbox.setBounds(map.getBounds());
                    sbox.addListener('places_changed', function () {
                        sBoxPlaces(this);
                    });
                    //when marker is clicked
                    function markClick() {
                        console.log("Hello");
                        popInfoWindow(this, lInfowindow);
                        this.setAnimation(google.maps.Animation.BOUNCE);
                        var p = this;
                        setTimeout(function () {
                            p.setAnimation(null);
                        }, 3000);
                    }
                    //highlighted icon
                    function markin() {
                        this.setIcon(highIcon);
                    }
                    //hide marker
                    function markout() {
                        this.setIcon(null);
                    }

                }

                // in this part we create markers for places in the projcet
                function createMarks(places) {
                    var latlang = new google.maps.LatLngBounds();
                    for (var k = 0; k < places.length; k++) {
                        var plac = places[k];
                        var icon = {
                            url: plac.icon,
                            size: new google.maps.Size(35, 35),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(15, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };
                        var marker = new google.maps.Marker({
                            title: plac.name,
                            icon: icon,
                            map: map,
                            id: plac.id,
                            position: plac.geometry.location
                        });
                        placeMarkers.push(marker);
                        if (plac.geometry.viewport) {
                            latlang.union(plac.geometry.viewport);
                        } else {
                            latlang.extend(plac.geometry.location);
                        }
                    }
                    map.fitBounds(latlang);

                }

                //initializing the map
                //the center element will initialize the map to desired location

                function initMap() {
                    map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 13,

                        center: {
                            lat: 31.1048,
                            lng: 77.1734
                        }
                    });
                    setMarkers(map);
                }

                

                
                //this is funtion for the serchbox
                //it intialize the serch box to be used
                function sBoxPlaces(sbox) {
                    hideMarks(placeMarkers);
                    var places = sbox.getPlaces();
                    createMarks(places);
                    //error handling
                    if (places.length === 0) {
                        window.alert("Query not Found ...");
                    }
                }
                //this function is used to hide markers
                function hideMarks(marks) {
                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setMap(null);
                    }
                }
                //the function is used for error handling
                function displayError() {
                    window.alert("Oops Somethings Wrong");
                }

                

                


                //app model
                //executes after rest of the ode is executed

                var m = new appViewModel();

                ko.applyBindings(m);