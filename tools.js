window.ajax = function(props) {
    return new Promise(function(resolve, reject){
        var xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    resolve(JSON.parse(xmlhttp.responseText));
                }
                else  {
                    reject(this.statusText); //todo: pass error description
                }
            }
        };
        xmlhttp.open(props.method || "GET", props.url, true);
        xmlhttp.send();
    }); //todo: add polifills for old browsers
};


window.$ = function(selector){
    return document.querySelector(selector); //todo: need polyfill
};

window.marker = function(point){
    new google.maps.Marker({
        position: point,
        map: map,
        title: 'Here!'
    });
};

window.addClassName = function(el, className){
    if(el.className.indexOf(className)==-1) {
        el.className += " " + className;
    }
};

window.removeClassName = function(el, className){
    el.className = el.className.replace(new RegExp("(\\s)?" + className), "")
};
