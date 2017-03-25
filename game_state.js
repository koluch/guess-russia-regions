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
 * Created: 27.06.2015 22:05
 */

function GameState() {
    this.currentRegionNum = 0;
    this.mistakes = 0;
    this.totalMistakes = 0;
    this.guessList = [];
}

GameState.prototype.clone = function(){
    var result = {};
    for(var prop in this) {
        if(this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    return result;
};

GameState.prototype.isEnded = function(){
    return this.mistakes >= MAX_MISTAKES || this.currentRegionNum > this.guessList.length-1;
    //return this.currentRegionNum > this.guessList.length-1;
};

GameState.prototype.getCurrentRegion = function(){
    return this.guessList[this.currentRegionNum];
};


GameState.prototype.isNewLevelStart = function(){
    return this.currentRegionNum % LEVEL_SIZE == 0
};

GameState.prototype.getGuessedAmount = function(){
    return ((this.currentRegionNum) - this.totalMistakes)
}

