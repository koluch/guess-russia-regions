/**
 * Shuffles array in place. ES6 version
 *
 * https://stackoverflow.com/a/6274381/916330
 *
 * @param {Array} a items An array containing the items.
 */
export function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const KNOWN_WORDS = {
  "регион": {
    "0": "регионов", "1": "регион", "2-4": "региона", "5-19": "регионов"
  }
};

export function pluralize(num, text) {
  const map = KNOWN_WORDS[text];
  let result;
  if(map) {
    let _num = num % 100;
    if(_num >= 5  && _num <= 19) {
      result = map["5-19"];
    } else {
      _num = _num % 10;
      if(_num === 0) result = map["0"];
      else if(_num === 1) result =  map["1"];
      else if(2 <= _num && _num <= 4) result =  map["2-4"];
      else result =  map["5-19"];
    }
  } else {
    result = text;
  }
  return num + " " + result;
}
