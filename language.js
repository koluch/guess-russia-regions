/**
 * Created by Nikolai_Mavrenkov on 30/06/15.
 */
language = new function(){


    var knownWords = {
        "регион": {
            "0": "регионов","1":"регион","2-4":"региона","5-19":"регионов"}
    };

    this.toNum = function(num, text) {
        var map = knownWords[text];
        var result;
        if(map) {
            var _num = num % 100;
            if(_num >= 5  && _num <= 19) {
                result =  map["5-19"];
            }
            else {
                _num = _num % 10;
                if(_num == 0) result =  map["0"];
                else if(_num == 1) result =  map["1"];
                else if(2 <= _num && _num <= 4) result =  map["2-4"];
                else result =  map["5-19"];
            }
        }
        else {
            result = text;
        }
        return num + " " + result;
    }
};
