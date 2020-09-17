// Code for creating genre drop-down for map
d3.json("/api/v1.0/genre_names", function(data) {
    // form array of unique genres
    var genres = data.map(genres => genres.genre)
    var uniqueGenres = genres.filter((x, ind, arr) => arr.indexOf(x) === ind)
    
    // Append genres to dropdown
    uniqueGenres.forEach(function(genre) {
      var genreDropdown = d3.select("#selGenre").append("option");
      genreDropdown.text(genre);
    });
});

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

// Create a new marker cluster group
const markers = L.markerClusterGroup();

// Initial map load w/ all movies
d3.json("/api/v1.0/movies", function(data) {
    
    // Loop through data
    data.forEach(movie => {
        //Check for location
        if(movie.lat && movie.lng){
            const marker = L.marker([movie.lat, movie.lng])
            .bindPopup("<h5>" + movie.title + 
            "</h5><hr><p> Year Produced: " + movie.year_pub +
            "</p><hr><p> Company: " + movie.company + 
            `</p><hr><a href="https://www.imdb.com/title/${movie.movie_id}" target=_blank>Movie on IMDB site</a>`);
            markers.addLayer(marker);
        }
    });

    // Add our marker cluster layer to the map
    markers.addTo(layers.movies);
});

// Function to handle changes in genre dropdown
function optionChanged(chosen){

    d3.json("/api/v1.0/genre_map", function(data){
        // Clear previous markers
        markers.clearLayers();
        
        // Get data for map based on selected genre
        const filteredGenre = data.filter(genres => genres.genre === chosen);
        // console.log(filteredGenre)
    
        // Loop through data
        filteredGenre.forEach(movie => {
            //Check for location
            if(movie.lat && movie.lng){
                const marker = L.marker([movie.lat, movie.lng])
                .bindPopup("<h5>" + movie.title + 
                "</h5><hr><p> Year Produced: " + movie.year_pub +
                "</p><hr><p> Company: " + movie.company + 
                `</p><hr><a href="https://www.imdb.com/title/${movie.movie_id}" target=_blank>Movie on IMDB site</a>`);
                markers.addLayer(marker);
            }
        });
        // Add our marker cluster layer to the map
        markers.addTo(layers.movies);
    });
};
  
// Add event listener for submit button
d3.select('#submit').on('click', optionChanged);

// Code for forming line chart with draggable time scale
d3.json("/api/v1.0/genre_charts", (movieData => {
    let genreObjs = []
    movieData.forEach( d => {
        //create array of objects of movies with revenue values
        if(d.ww_gross) {
            d.ww_gross = +d.ww_gross.replace(/\D/g,'').trim();
            d.year_pub = +d.year_pub;
            let genreObj = {
                    genre: d.genre,
                    year: d.year_pub,
                    ww_gross: d.ww_gross
            }
            genreObjs.push(genreObj)
        }
    });
    
    //aggregating genre gross amounts per year
    let genreAgg = [];
    genreObjs.forEach(function(item) {
        let existing = genreAgg.filter(function(v, i) {
            return v.genre == item.genre && v.year == item.year;
        });
        
        if (existing.length) {
        let existingIndex = genreAgg.indexOf(existing[0]);
        genreAgg[existingIndex].ww_gross += item.ww_gross;
        } 
        else {
            if (item.genre)
                genreAgg.push(item);
        }
    });
    
    //combining genres into each of their own objects and creating arrays for year and gross for plotly plotting
    let genreComb = [];
    genreAgg.forEach(function(movie) {
        const exist = genreComb.filter(function(v, i) {
            return v.genre == movie.genre;
        });
    
        let genreCombObj = {};
    
        if (exist.length) {
            var existingInd = genreComb.indexOf(exist[0]);
            genreComb[existingInd].year = genreComb[existingInd].year.concat(movie.year);
            genreComb[existingInd].ww_gross = genreComb[existingInd].ww_gross.concat(movie.ww_gross);
        } 
        else {
            if (typeof movie.genre == 'string')
            genreCombObj.genre = movie.genre;
            genreCombObj.year = [movie.year];
            genreCombObj.ww_gross = [movie.ww_gross]
            genreComb.push(genreCombObj)         
        }
    });
    
    //generate plotly line graph of genre revenues over the years
    data = []; 
    genreComb.forEach( (d,i) => {
        let trace = {
            x: d.year,
            y: d.ww_gross,
            name: d.genre
        }
    data.push(trace);
    });

    const layout = {
        title: {
            text: 'Worldwide Movie Genre Gross by Year',
            font: {
                color: 'purple'
            }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: {
            autorange: true,
            rangeslider: {range: [data[0].year, data[data.length - 1].year]},
            type: 'date'
        }        
    };

    const config = {responsive: true};

    Plotly.newPlot('line1', data, layout, config);

    // Code for creating chord diagram
    //creating objects with movie title and list of genres
    let genreCounts = []
    movieData.forEach( d => {
        let existing = genreCounts.filter(v => {
            return v.title == d.title;
            });
        let genreCombObj = {}
            if (existing.length) {
                let existingIndex = genreCounts.indexOf(existing[0]);
                genreCounts[existingIndex].genre = genreCounts[existingIndex].genre.concat(d.genre);
            } 
            else {
                if (typeof d.title == 'string')
                genreCombObj.title = d.title;
                genreCombObj.genre = [d.genre];
                genreCounts.push(genreCombObj);
            }
        });
        
    //narrowing down field of movies to those with two genres, primary and sub-genre and creating a count
    //of the total # of movies with the same genre-pairings
    const twoGenres = genreCounts.filter(d => d.genre.length == 2);
    let genreTotals = [];
    twoGenres.forEach( d => {
        let exists = genreTotals.filter(v => v.genre[0] == d.genre[0] && v.genre[1] == d.genre[1]);
        let genreTotalObj = {};
        if (exists.length) {
            var existingInd = genreTotals.indexOf(exists[0]);
            genreTotals[existingInd].count += 1;
              } 
        else {
            if (typeof d.title == 'string')
            genreTotalObj.genre = d.genre;
            genreTotalObj.count = 1;
            genreTotals.push(genreTotalObj)         
        }
    });

    //create/draw chord diagram showing genre relationships
    am4core.ready(function() {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("chartdiv", am4charts.ChordDiagram);
    chart.hiddenState.properties.opacity = 0;

    chart.data = [];
    genreTotals.forEach( d => {
        let chartDataObj = {};
        chartDataObj.from = d.genre[0],
        chartDataObj.to = d.genre[1],
        chartDataObj.value = d.count
        chart.data.push(chartDataObj)
    });

    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";

    var label = chart.nodes.template.label;
    label.fontSize = 10;

    var link = chart.links.template;
    link.fillOpacity = 0.7;
    
    // make nodes draggable
    var nodeTemplate = chart.nodes.template;
    nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
    nodeTemplate.showSystemTooltip = true;
    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer

    }); // end am4core.ready()
}));
