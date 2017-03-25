Labels = function(map, centers){
    var fontByZoom = {
        1: "2"
        , 2: "2"
        , 3: "2"
        , 4: "4"
        , 5: "6"
        , 6: "10"
        , 7: "12"
    };

    var currentZoom = map.getZoom();

    var labels = {};

    function getFont(zoom) {
        return (fontByZoom[zoom] || 14) + "pt";
    }

    google.maps.event.addListener(map, 'zoom_changed', function () {
        currentZoom = this.getZoom();

        for(var i in labels) {
            labels[i].setOptions({
                boxStyle: {
                    border: "0px solid black"
                    , textAlign: "center"
                    , fontSize: getFont(currentZoom)
                    , width: "50px"
                }
            });
        }
    });


    this.showLabel = function(region, show){

        var options = {
            content: region.title
            , boxStyle: {
                border: "0px solid black"
                , textAlign: "center"
                , fontSize: getFont(currentZoom)
                , width: "50px"
            }
            , disableAutoPan: true
            , maxWidth: "50px"
            , closeBoxURL: ""
            , isHidden: false
            , pane: "mapPane"
            , enableEventPropagation: true
            , position: region.center
        };

        if(labels[region.title]) {
            var label = labels[region.title];
            if(show!==false) {
                label.setOptions(options);
                label.show();
            }
            else {
                label.hide();
            }
        }
        else {
            if(show!==false) {
                var ib = new InfoBox(options);
                ib.open(map);
                labels[region.title] = ib;
            }
        }



    }
};