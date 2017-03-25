/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 22.06.2015 23:08
 */
Drawing = function(map){



    var nextColor = (function () {
        var c = ["red", "blue", "green", "yellow", "magenta", "purple", "#FA5599", "#F0FF90", "#00FFAA", "#FA009A", "#995599", "#AABB33", "#AD9360"];
        var i = 0;
        return function () {
            i = (i + 1) % c.length;
            return c[i];
        }
    })();

    var labels = new Labels(map);

    var regions = {};
    var polygones = {};

    var clickCallbacks = [];

    this.onRegionClick = function(callback) {
        clickCallbacks.push(callback);
    };

    var onClick = function (event) {
        //console.log("new google.maps.LatLng(" + event.latLng.lat() + "," + event.latLng.lng() + ")");
        for (var i = 0; i < clickCallbacks.length; i++) {
            var callback = clickCallbacks[i];
            callback.apply(regions[this.title], [event]);
        }
    };


    this.removeRegion = function ( region ) {
        var poly = polygones[region.title];
        if(poly) {
            poly.setMap(null);
            delete regions[region.title];
            delete polygones[region.title];
        }
    };

    this.drawRegion = function( region, show, mistake ){

        var options;

        if(show===false) {
            options = {
                title: region.title,
                paths: region.paths,
                strokeColor: "black",
                strokeOpacity: 1,
                strokeWeight: 0.3,
                fillColor: "#0074D9",
                fillOpacity: 0.3
            };
        }
        else {
            if(mistake) {
                options = {
                    title: region.title,
                    paths: region.paths,
                    strokeColor: "black",
                    strokeOpacity: 1,
                    strokeWeight: 0.3,
                    fillColor: "#FF9999",
                    fillOpacity: 0.3
                };
            }
            else {
                options = {
                    title: region.title,
                    paths: region.paths,
                    strokeColor: "black",
                    strokeOpacity: 1,
                    strokeWeight: 0.3,
                    fillColor: "green",
                    fillOpacity: 0.3
                };

            }
        }



        if(polygones[region.title]) {
            polygones[region.title].setOptions(options);
        }
        else {
            var polygone = new google.maps.Polygon(options);

            var title = region.title;
            polygone.set("name", title);

            //todo: maybe, there is a way to set listener to all of polys at once?
            google.maps.event.addListener(polygone, 'click', onClick);

            polygone.setMap(map);

            regions[region.title] = region;
            polygones[region.title] = polygone;
        }

        labels.showLabel(region, show);

    };


    this.drawGameStateCaptions = function(gameState) {
        $("#current_region").textContent = gameState.getCurrentRegion().title;
        $("#mistakes_count").textContent = gameState.mistakes;
        $("#current_region_num").textContent = gameState.currentRegionNum+1;
        $("#total_regions").textContent = gameState.guessList.length;
        $("#level").textContent = Math.ceil((gameState.currentRegionNum+1)/LEVEL_SIZE);
        $("#max_mistakes").textContent = MAX_MISTAKES;
    };

    var shownModal = null;

    this.showModal = function(selector) {
        if(shownModal) {
            this.hide(shownModal, "hidden");
        }
        else {
            this.show($("#modal_bg"), "hidden");
        }
        shownModal = $(selector);
        this.show(shownModal, "hidden");
    };

    this.hideModal = function(){
        if(shownModal) {
            this.hide(shownModal, "hidden");
            this.hide($("#modal_bg"), "hidden");
            shownModal = null;
        }
    };

    this.show = function(el){
        removeClassName(el, "hidden");
    };

    this.hide = function(el){
        addClassName(el, "hidden");
    }

};