export function createStore(initialState) {
  let state = initialState;
  let observers = [];
  return {
    setState: function (diff) {
      let prevState = state;
      state = Object.assign({}, state, diff);
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i];
        observer(state, prevState);
      }
    },
    getState: function() {
      return state;
    },
    subscribe: function (observer) {
      observers.push(observer);
    },
    unsubscribe: function (observer) {
      observers = observers.filter(function(x) { return x !== observer });
    },
  }
}
