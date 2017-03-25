var MAX_MISTAKES = 3;
var LEVEL_SIZE = 10;

function initialize() {

    var mapOptions = {
        center: {lat: 62.271565, lng: 83.775499},
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        styles: [
            {
                featureType: "all",
                elementType: "labels",
                stylers: [
                    {visibility: "off"}
                ]
            },
            {
                featureType: "road",
                stylers: [
                    {visibility: "off"}
                ]
            }
        ],
        zoom: 4
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    ajax({method: "GET", url: "regions.json"}).then(function (regions) {

        // Preprocessing
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            region.center = new google.maps.LatLng(region.center[0], region.center[1]);
            region.paths = region.paths.map(function (path) {
                return path.map(function (c) {
                    return new google.maps.LatLng(c[0], c[1])
                })
            });
        }


        var drawing = new Drawing(map);

        var appState = new AppState();

        var gameState = new GameState();


        appState.afterBecome(AppState.START, function(){
            drawing.showModal("#modal_game_start");
        });

        appState.afterLeave(AppState.START, function(){
            drawing.hideModal();
        });

        appState.afterBecome(AppState.CORRECT_GUESS, function(){
            drawing.show($("#correct_msg_wrapper"));
            setTimeout(function(){
                if(gameState.isEnded()) {
                    appState.changeTo(AppState.FINISH);
                }
                else if(gameState.isNewLevelStart()) {
                    gameState.mistakes=0;
                    appState.changeTo(AppState.NEXT_LEVEL);
                }
                else {
                    appState.changeTo(AppState.PLAYING);
                }
            }, 1000);
        });

        appState.afterLeave(AppState.CORRECT_GUESS, function(){
            drawing.hide($("#correct_msg_wrapper"));
        });

        appState.afterBecome(AppState.WRONG_GUESS, function(){
            drawing.show($("#wrong_msg_wrapper"));
            setTimeout(function(){
                if(gameState.isEnded()) {
                    appState.changeTo(AppState.FINISH);
                }
                else if(gameState.isNewLevelStart()) {
                    gameState.mistakes=0;
                    appState.changeTo(AppState.NEXT_LEVEL);
                }
                else {
                    appState.changeTo(AppState.PLAYING);
                }
            }, 1000);
        });

        appState.afterLeave(AppState.WRONG_GUESS, function(){
            drawing.hide($("#wrong_msg_wrapper"));
        });


        appState.afterBecome(AppState.NEXT_LEVEL, function(){
            drawing.show($("#next_level_msg_wrapper"));
            setTimeout(function(){
                appState.changeTo(AppState.PLAYING);
            }, 2500);
        });

        appState.afterLeave(AppState.NEXT_LEVEL, function(){
            drawing.hide($("#next_level_msg_wrapper"));
        });

        appState.afterBecome(AppState.NEW_GAME, function(){
            var isCrimeaBelongsToUs = $("#crimea_belongs_to_us").checked;


            var currentRegions;
            if(isCrimeaBelongsToUs) {
                currentRegions = regions;
            }
            else {
                currentRegions = regions.filter(function(region){ return region.title != "Республика Крым" && region.title != "Севастополь"})
                regions
                    .filter(function(region){ return region.title == "Республика Крым" || region.title == "Севастополь"})
                    .forEach(function(region){
                        drawing.removeRegion(region);
                    })
            }


            // Draw regions hidden
            currentRegions.forEach(function(region){
                drawing.drawRegion(region, false);
            });

            // Reset game state
            gameState.currentRegionNum = 0;
            gameState.mistakes = 0;
            gameState.totalMistakes = 0;
            gameState.guessList = shuffleRegions(currentRegions);
            appState.changeTo(AppState.PLAYING);
        });

        appState.afterBecome(AppState.PLAYING, function(){
            drawing.drawGameStateCaptions(gameState);
            drawing.show($("#stats"));
            drawing.show($("#current_region_wrapper"));
        });

        appState.afterLeave(AppState.PLAYING, function(){
            drawing.hide($("#stats"));
            drawing.hide($("#current_region_wrapper"));
        });

        appState.afterBecome(AppState.FINISH, function(){


            var msg;
            var header;
            var guessed = gameState.getGuessedAmount();
            if(guessed == 0) {
                msg = "Вы не отгадали ни одного региона!";
                header = "Слабовато!";
            }
            else if(guessed < 20) {
                msg = "Вы отгадали только <b>" + language.toNum(guessed, "регион") + "</b>";
                header = "Слабовато!";
            }
            else if(guessed >= 20 && guessed < 50) {
                msg = "Вы отгадали только <b>" + language.toNum(guessed, "регион") + "</b>";
                header = "Неплохо, но можно и лучше...";
            }
            else if(guessed >= 50 && guessed < gameState.guessList.length){
                msg = "Вы отгадали <b>" + language.toNum(guessed, "регион") + "</b>. Попробуйте еще раз, возможно получится отгадать все?";
                header = "Здорово!";
            }
            else {
                msg = " Вы отгадали все регионы! Поздравляем, вы настоящий патриот!";
                header = "Невероятно!";
            }
            $("#finish_msg").innerHTML = msg;
            $("#finish_header").innerHTML = header;

            sharing.updateButtons(guessed);

            drawing.showModal("#modal_game_finish");
        });

        appState.afterLeave(AppState.FINISH, function(){
            drawing.hideModal();
        });


        drawing.onRegionClick(function(){

            if(appState.now == "PLAYING") {
                var clickedRegion = this;
                var currentRegion = gameState.getCurrentRegion();

                var mistake = clickedRegion.title !== currentRegion.title;

                drawing.drawRegion(currentRegion,true,mistake);

                gameState.currentRegionNum++;
                if(mistake) {
                    gameState.mistakes++;
                    gameState.totalMistakes++;
                }

                if(mistake) {
                    appState.changeTo(AppState.WRONG_GUESS);
                }
                else {
                    appState.changeTo(AppState.CORRECT_GUESS);
                }
            }
        });

        $("#start_game_button").addEventListener("click", function(){
            appState.changeTo(AppState.NEW_GAME);
        });

        $("#once_again_button").addEventListener("click", function(){
            appState.changeTo(AppState.START);
        });


        // Begin app from START state
        appState.changeTo(AppState.START);



    }).catch(function (e) {
        throw e; //todo: show message with error
    });


}


google.maps.event.addDomListener(window, 'load', initialize);


/***** Helper functions *****/

function shuffleRegions(regions) {

    var result = [];

    for(var i = 0; i<(regions.length-LEVEL_SIZE); i+=LEVEL_SIZE) {
        var sliceSize = (regions.length-i-LEVEL_SIZE >= LEVEL_SIZE) ?  LEVEL_SIZE : LEVEL_SIZE*2;

        var slice = regions.slice(i, i + sliceSize);

        while(slice.length>0) {   //todo: change to 0
            var j = Math.floor(Math.random() * slice.length);
            result.push(slice[j]);
            slice.splice(j,1);
        }


    }

    return result;
}