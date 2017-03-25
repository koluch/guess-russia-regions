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

function AppState(now) {
    this.now = "";
    this.afterBecomeCallbacks = {};
    this.afterLeaveCallbacks = {};
}


AppState.__runCallbacks = function(key, callbacks){
    var byKey = callbacks[key];
    if(byKey) {
        for (var i = 0; i < byKey.length; i++) {
            byKey[i].apply(this, []);
        }
    }
};

AppState.START = "START";
AppState.NEW_GAME = "NEW_GAME";
AppState.PLAYING = "PLAYING";
AppState.CORRECT_GUESS = "CORRECT_GUESS";
AppState.WRONG_GUESS = "WRONG_GUESS";
AppState.NEXT_LEVEL = "NEXT_LEVEL";
AppState.FINISH = "FINISH";

AppState.prototype.changeTo = function(to){
    var from = this.now;
    this.now = to;
    AppState.__runCallbacks(from, this.afterLeaveCallbacks);
    AppState.__runCallbacks(to, this.afterBecomeCallbacks);
};

AppState.prototype.afterBecome = function(to, callback){
    var callbacks = (this.afterBecomeCallbacks[to] || []);
    callbacks.push(callback);
    this.afterBecomeCallbacks[to] = callbacks;
};

AppState.prototype.afterLeave = function(from, callback){
    var callbacks = (this.afterLeaveCallbacks[from] || []);
    callbacks.push(callback);
    this.afterLeaveCallbacks[from] = callbacks;
};
