queryURL = "/api/v1.0/genres"

d3.json(queryURL, (movieData => {
    // console.log(movieData)
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
    console.log(genreTotals);

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

    // make nodes draggable
    var nodeTemplate = chart.nodes.template;
    nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
    nodeTemplate.showSystemTooltip = true;
    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer

    }); // end am4core.ready()


}));