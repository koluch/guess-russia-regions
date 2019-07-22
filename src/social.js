import { pluralize } from "./utils.js";

export default function (containerEl: HTMLElement) {
  // Twitter init
  // window.a = (function (d, s, id) {
  //   var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
  //   if (!d.getElementById(id)) {
  //     js = d.createElement(s);
  //     js.id = id;
  //     js.src = p + '://platform.twitter.com/widgets.js';
  //     fjs.parentNode.insertBefore(js, fjs);
  //   }
  // })(document, 'script', 'twitter-wjs');
  //

  const promises = [];

  promises.push(new Promise((resolve) => {
    window.twttr = (function(d: any, s: any, id: any) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      const p = /^http:/.test(d.location) ? 'http' : 'https'
      js = d.createElement(s);
      js.id = id;
      js.src = p + '://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
      return t;
    }(document, "script", "twitter-wjs"));
    containerEl.innerHTML = '<div class="widget" id="twitter_button_holder"></div>';
    window.twttr.ready(() => {
      resolve();
    })
  }));

  // Facebook init
  // promises.push(new Promise((resolve) => {
  //   containerEl.innerHTML += '<div class="widget" id="fb_button_holder">'
  //     + '<div id="fb_share" style=""><button title="Поделиться" ><span/></button><span>Поделиться</span></div>'
  //     + '<div id="fb-root"></div>'
  //     + '</div>';
  //   window.fbAsyncInit = function() {
  //     FB.init({
  //       appId: '405695916297888',
  //       xfbml: true,
  //       version: 'v2.3'
  //     });
  //   };
  //   (function(d, s, id) {
  //     var js, fjs = d.getElementsByTagName(s)[0];
  //     if (d.getElementById(id)) {return;}
  //     js = d.createElement(s);
  //     js.id = id;
  //     js.src = "//connect.facebook.net/en_US/sdk.js";
  //     fjs.parentNode.insertBefore(js, fjs);
  //     js.onload = () => {
  //       resolve();
  //     }
  //   }(document, 'script', 'facebook-jssdk'));
  // }));

  // VK init
  promises.push(new Promise((resolve) => {
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "//vk.com/js/api/share.js?90";
      js.onload  = function(){
        containerEl.innerHTML += '<div class="widget" id="vk_button_holder"></div>';
        resolve();
      };
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'vk-share-js'));
  }));

  let result = {
    update: function(guessed: number) {
      var resultMsg = 'Хорошо ли вы знаете Россию? Я отгадал ' + pluralize(guessed, "регион");

      // Update twitter button
      document.getElementById("twitter_button_holder").innerHTML = '<a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-lang="ru" data-text="' + resultMsg + '" data-hashtags="guess-russia-regions">Твитнуть</a>';
      window.twttr.widgets.load();

      // // Update FB button
      // var oldFbButton = $("#fb_button_holder #fb_share");
      // var newFbButton = oldFbButton.cloneNode(true);
      // oldFbButton.parentNode.replaceChild(newFbButton, oldFbButton);
      // newFbButton.addEventListener("click", function() {
      //   FB.ui({
      //     method: 'feed',
      //     link: 'http://www.koluch.ru/guess-russia-regions/',
      //     name: resultMsg,
      //     caption: 'www.koluch.ru',
      //     description: 'Игра, в которой нужно правильно угадать расположение регионов России'
      //   }, function(response) {});
      // });
      //
      // Update VK button
      document.getElementById("vk_button_holder").innerHTML = VK.Share.button({
        //url: 'http://mysite.com',
        title: resultMsg
        //image: 'http://mysite.com/mypic.jpg'
      }, {
        text: "Поделиться",
        type: "round_nocount"
      })
    }
  };

  // Finish initialization
  Promise.all(promises).then(() => {
    result.update(0);
  })

  return result
};
