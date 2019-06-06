import { createStore } from "set-state-store";
import { REGIONS, REGION_CODES } from "./regions.js";
import { shuffleArray } from "./utils.js";

const STATE = {
  INIT: "INIT",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
  TRY_SUCCESS: "TRY_SUCCESS",
  TRY_FAILED: "TRY_FAILED",
};

const LEVEL_SIZE = 10;
const MAX_MISTAKES = 3;

function updateStats(state) {
  const { currentRegionIndex, mistakes, gameState} = state;
  document.querySelector('#stats').classList.toggle('hidden', gameState !== STATE.PLAYING);
  document.querySelector('#stats .level span').textContent = `${1 + Math.ceil(currentRegionIndex / LEVEL_SIZE)}/${Math.ceil(REGION_CODES.length / LEVEL_SIZE)}`
  document.querySelector('#stats .mistakes span').textContent = `${mistakes}/${MAX_MISTAKES}`;
}

function updateGameState(state) {
  const { gameState, regionCodes, currentRegionIndex } = state;
  Object.entries(STATE).forEach(([key, value]) => {
    window.document.body.classList.toggle(key, gameState === value);
  });

  if (gameState === STATE.PLAYING) {
    const currentRegionCode = regionCodes[currentRegionIndex];
    const currentRegion = REGIONS[currentRegionCode];
    document.getElementById('currentRegion').textContent = currentRegion.titleRu;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const svgContainerEl = document.getElementById("svg-container");
  const svgEl = document.getElementById("svg");


  // Create state store and define update logic
  const store = createStore({
    gameState: STATE.INIT,
    isDragging: false,
    start: [0, 0],
    offset: [0, 0],
    zoom: 1,
    regionCodes: [],
    currentRegionIndex: 0,
    mistakes: 0,
  });
  let update = (state, oldState) => {
    const {isDragging, offset, zoom, currentRegionIndex, mistakes, gameState } = state;
    svgContainerEl.classList.toggle('isDragging', isDragging);
    svgEl.style.transform = `translateX(${offset[0]}px) translateY(${offset[1]}px) scale(${zoom})`;

    updateStats(state);
    updateGameState(state);
  };
  store.subscribe(update);
  updateStats(store.getState());
  updateGameState(store.getState());

  // Drag logic
  let handleStart = ([x, y]) => {
    store.setState({
      isDragging: true,
      start: [x, y],
    });
  };
  let handleStop = () => {
    console.log("handleStop!")
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
    let newZoom = Math.max(0.25, Math.min(10, store.getState().zoom + (delta * 0.01)));
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

  // Start and end modal behaviour
  [
    document.getElementById('start-modal'),
    document.getElementById('end-modal')
  ].forEach((modal) => {
    modal.addEventListener('submit', (e) => {
      e.preventDefault();

      // Generate new region code list for new game
      const regionCodes = [];
      for (let i = 0; i < Math.ceil(REGION_CODES.length / LEVEL_SIZE); i++) {
        let regionCodesPortion = REGION_CODES.slice(i * LEVEL_SIZE, i * LEVEL_SIZE + LEVEL_SIZE);
        shuffleArray(regionCodesPortion);
        regionCodes.push(...regionCodesPortion);
      }

      // Reset state
      store.setState({
        regionCodes: regionCodes,
        gameState: STATE.PLAYING,
        currentRegionIndex: 0,
        mistakes: 0,
      })

      // Reset painted regions
      document.querySelectorAll('.land').forEach((x) => {
        x.classList.remove('success');
        x.classList.remove('failed')
      })
    });
  })

  // Region click behaviour
  document.getElementById('regions').addEventListener('click', (e) => {
    console.log("click!", store.getState().isDragging)
    const regionPathEl = e.target;
    if (!regionPathEl.classList.contains("land")) {
      return;
    }
    const regionCode = regionPathEl.id;
    const currentRegionIndex = store.getState().currentRegionIndex;
    const currentRegionCode = store.getState().regionCodes[currentRegionIndex];
    const isSuccess = regionCode === currentRegionCode;
    let newMistakes = store.getState().mistakes + (isSuccess ? 0 : 1);

    document.getElementById(currentRegionCode).classList.add(isSuccess ? 'success' : 'failed')

    store.setState({
      gameState: isSuccess ? STATE.TRY_SUCCESS : STATE.TRY_FAILED,
      mistakes: newMistakes,
    });
    setTimeout(() => {
      if (newMistakes === MAX_MISTAKES) {
        store.setState({
          gameState: STATE.GAME_OVER,
        });
      } else {
        store.setState({
          gameState: STATE.PLAYING,
          currentRegionIndex: store.getState().currentRegionIndex + 1,
        });
      }
    }, 1000);
  })
});
