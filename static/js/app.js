// Code for creating map

// Create the dark tile layer that will be the background of our map
const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

// Create the light tile layer
const lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
const layers = {
    movies: new L.LayerGroup()
};

// Create the map object with options
const map = L.map("map", {
    center: [52.4912, -1.9348],
    zoom: 2,
    layers: [darkmap, layers.movies]
});

// Define a baseMaps object to hold our base layers
const baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
};

// Create overlay object to hold our overlay layers
var overlayMaps = {
    "Movies": layers.movies
};

// Create a layer control and pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

// Store our API endpoint inside queryUrl
var queryUrl = "/api/v1.0/movies";

// Grab the data with d3
d3.json(queryUrl, function(data) {
  console.log(data);

  // Create a new marker cluster group
  const markers = L.markerClusterGroup();
    
  // Loop through data
  data.forEach(movie => {
    //Check for location
    if(movie.lat && movie.lng){
      const marker = L.marker([movie.lat, movie.lng])
      .bindPopup("<h3>" + movie.title + "</h3><hr><p>" + movie.company + "</p>");
      markers.addLayer(marker);
    }
  })

  // Add our marker cluster layer to the map
  markers.addTo(layers.movies);
});