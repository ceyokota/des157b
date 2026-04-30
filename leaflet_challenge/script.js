(function(){
    'use strict';

    // add your script here
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var marker1 = L.marker([37.5657539, -122.32398972222222]).addTo(map);

    var marker2 = L.marker([37.537388, -122.300375]).addTo(map);



    var circle = L.circle([37.55187, -122.329079], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);



    marker1.bindPopup("This is where me and my friends hung out a lot in our hometown!!").openPopup();
    marker2.bindPopup("This is another place where me and my friends hung out a lot in our hometown!!").openPopup();
    circle.bindPopup("This is also where we hung out a lot (it's my highschool...)");
    polygon.bindPopup("I am a polygon.");

    var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

    // function onMapClick(e) {
    //     alert("You clicked the map at " + e.latlng);
    // }
    
    // map.on('click', onMapClick);

    // var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);
    
}());