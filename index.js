import { createStore } from 'set-state-store';
import {REGIONS, REGION_CODES} from "./regions.js"

const STATE = {
  INIT: "INIT",
  PLAYING: "INIT",
  GAME_OVER: "INIT",
};

const LEVEL_SIZE = 10;
const MAX_MISTAKES = 3;

function updateStats(currentRegion, mistakes) {
  document.querySelector('#stats .level span').textContent = `${1 + Math.ceil(currentRegion / LEVEL_SIZE)}/${Math.ceil(REGION_CODES.length / LEVEL_SIZE)}`
  document.querySelector('#stats .mistakes span').textContent = `${mistakes}/${MAX_MISTAKES}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const svgContainerEl = document.getElementById("svg-container");
  const svgEl = document.getElementById("svg");


  // Create state store and define update logic
  const store = createStore({
    state: STATE.INIT,
    isDragging: false,
    start: [0, 0],
    offset: [0, 0],
    zoom: 1,
    currentRegion: 0,
    mistakes: 0,
  });
  let update = (state, oldState) => {
    const {isDragging, offset, zoom, currentRegion, mistakes } = state;
    svgContainerEl.classList.toggle('isDragging', isDragging);
    svgEl.style.transform = `translateX(${offset[0]}px) translateY(${offset[1]}px) scale(${zoom})`;

    if (currentRegion !== oldState.currentRegion || mistakes !== oldState.mistakes) {
      updateStats(currentRegion, mistakes)
    }
  };
  store.subscribe(update);
  updateStats(store.getState().currentRegion, store.getState().mistakes);

  // Drag logic
  let handleStart = ([x, y]) => {
    store.setState({
      isDragging: true,
      start: [x, y],
    });
  };
  let handleStop = () => {
    store.setState({
      isDragging: false,
    });
  };
  let handleMove = ([x, y]) => {
    let state = store.getState();
    if (state.isDragging) {
      let diffX = x - state.start[0];
      let diffY = y - state.start[1];
      store.setState({
        offset: [state.offset[0] + diffX, state.offset[1] + diffY],
        start: [x, y],
      });
    }
  };
  let handleZoom = (delta) => {
    let newZoom = Math.max(0.25, Math.min(10, state.zoom + (delta * 0.01)));
    store.setState({
      zoom: newZoom,
    });
  };
  svgContainerEl.addEventListener("mousedown", (e) => handleStart([e.clientX, e.clientY]));
  svgContainerEl.addEventListener("mouseup", handleStop);
  svgContainerEl.addEventListener("mousemove", (e) => handleMove([e.clientX, e.clientY]));
  svgContainerEl.addEventListener("mouseleave", handleStop);
  svgContainerEl.addEventListener("wheel", (e) => handleZoom(e.deltaY));
  svgContainerEl.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      let firstTouch = e.touches.item(0);
      handleStart([firstTouch.clientX, firstTouch.clientY])
    }
  }, false);
  svgContainerEl.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      let firstTouch = e.touches.item(0);
      handleMove([firstTouch.clientX, firstTouch.clientY])
    }
  });
  svgContainerEl.addEventListener("touchend", handleStop);
  svgContainerEl.addEventListener("touchcancel", handleStop);
});
