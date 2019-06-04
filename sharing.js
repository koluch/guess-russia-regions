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
 * Created: 05.07.2015 02:25
 */
sharing = new function(){

    this.init = function(parent){

        this.parent = parent;

        parent.innerHTML = '<div class="widget" id="twitter_button_holder"></div>';
        parent.innerHTML += '<div class="widget" id="fb_button_holder">'
            + '<div id="fb_share" style=""><button title="Поделиться" ><span/></button><span>Поделиться</span></div>'
            + '<div id="fb-root"></div>'
            + '</div>';

        window.fbAsyncInit = function() {
            FB.init({
                appId      : '405695916297888',
                xfbml      : true,
                version    : 'v2.3'
            });

        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        // VK loading
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//vk.com/js/api/share.js?90";
            js.onload  = function(){
                parent.innerHTML += '<div class="widget" id="vk_button_holder"></div>';

            };
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-share-js'));



    };


    this.updateButtons = function(guessed) {
        var resultMsg = 'Хорошо ли вы знаете Россию? Я отгадал '+language.toNum(guessed, "регион");

        // Update twitter button
        $("#twitter_button_holder").innerHTML = '<a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-lang="ru" data-text="'+resultMsg+'" data-hashtags="guess-russia-regions">Твитнуть</a>';
        twttr.widgets.load();

        // Update FB button
        var oldFbButton = $("#fb_button_holder #fb_share");
        var newFbButton = oldFbButton.cloneNode(true);
        oldFbButton.parentNode.replaceChild(newFbButton, oldFbButton);
        newFbButton.addEventListener("click", function() {
            FB.ui({
                method: 'feed',
                link: 'http://www.koluch.ru/guess-russia-regions/',
                name: resultMsg,
                caption: 'www.koluch.ru',
                description: 'Игра, в которой нужно правильно угадать расположение регионов России'
            }, function(response){});
        });


        // Update VK button
        $("#vk_button_holder").innerHTML =  VK.Share.button({
            //url: 'http://mysite.com',
            title: resultMsg
            //image: 'http://mysite.com/mypic.jpg'
        }, {
            type: "round_nocount"
        })


    }
};
