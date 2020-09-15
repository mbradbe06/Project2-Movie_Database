queryURL = "/api/v1.0/genres"

d3.json(queryURL, (movieData => {
    // console.log(movieData);
    let genreObjs = []
    movieData.forEach( d => {
        //create array of objects of movies with revenue values
        if(d.us_gross && d.ww_gross) {
            d.us_gross = +d.us_gross.replace(/\D/g,'').trim();
            d.ww_gross = +d.ww_gross.replace(/\D/g,'').trim();
            d.year_pub = +d.year_pub;
            let genreObj = {genre: d.genre,
                        year: d.year_pub,
                        us_gross: d.us_gross,
                        intl_gross: d.ww_gross - d.us_gross,
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
                genreAgg[existingIndex].us_gross += item.us_gross;
                genreAgg[existingIndex].intl_gross += item.intl_gross;
                genreAgg[existingIndex].ww_gross += item.ww_gross;
            } 
            else {
            if (item.genre)
                genreAgg.push(item);
            }  
        
    });

    // console.log(genreAgg);

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
          genreComb[existingInd].us_gross = genreComb[existingInd].us_gross.concat(movie.us_gross);
          genreComb[existingInd].intl_gross = genreComb[existingInd].intl_gross.concat(movie.intl_gross);
          genreComb[existingInd].ww_gross = genreComb[existingInd].ww_gross.concat(movie.ww_gross);
            } 
        else {
         if (typeof movie.genre == 'string')
            genreCombObj.genre = movie.genre;
            genreCombObj.year = [movie.year];
            genreCombObj.us_gross = [movie.us_gross];
            genreCombObj.intl_gross = [movie.instl_gross];
            genreCombObj.ww_gross = [movie.ww_gross]
            genreComb.push(genreCombObj)         
        }
      });

    //   console.log(genreComb);
    
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
        title: 'Worldwide Movie Genre Popularity Over the Years',
        xaxis: {
          autorange: true,
          rangeslider: {range: [data[0].year, data[data.length - 1].year]},
          type: 'date'
        }        
      };

    Plotly.newPlot('bar1', data, layout);
    
}));