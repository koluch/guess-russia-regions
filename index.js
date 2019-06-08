import { createStore } from "set-state-store";
import { REGIONS, REGION_CODES } from "./regions.js";
import { pluralize, shuffleArray } from "./utils.js";
import social from "./social.js";

const STATE = {
  INIT: "INIT",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
  TRY_SUCCESS: "TRY_SUCCESS",
  TRY_FAILED: "TRY_FAILED",
};

const LEVEL_SIZE = 10;
const MAX_MISTAKES = 3;


document.addEventListener("DOMContentLoaded", () => {
  // Init social buttons
  const socialObject = social(document.getElementById('social'));

  function updateStats(state) {
    const { currentRegionIndex, mistakes, gameState} = state;
    document.querySelector('#stats').classList.toggle('hidden', gameState !== STATE.PLAYING);
    document.querySelector('#stats .level span').textContent = `${Math.ceil((1 + currentRegionIndex) / LEVEL_SIZE)}/${Math.ceil(REGION_CODES.length / LEVEL_SIZE)}`
    document.querySelector('#stats .mistakes span').textContent = `${mistakes}/${MAX_MISTAKES}`;
  }

  function updateGameState(state) {
    const { gameState, regionCodes, currentRegionIndex, guessed } = state;
    Object.entries(STATE).forEach(([key, value]) => {
      window.document.body.classList.toggle(key, gameState === value);
    });

    if (gameState === STATE.PLAYING) {
      const currentRegionCode = regionCodes[currentRegionIndex];
      const currentRegion = REGIONS.find(({ code }) => code === currentRegionCode);
      document.getElementById('currentRegion').textContent = currentRegion.title;
    }

    if (gameState === STATE.GAME_OVER) {
      let msg;
      let header;
      if (guessed === 0) {
        msg = "Вы не отгадали ни одного региона!";
        header = "Слабовато!";
      }
      else if(guessed < 20) {
        msg = "Вы отгадали только <b>" + pluralize(guessed, "регион") + "</b>";
        header = "Слабовато!";
      }
      else if(guessed >= 20 && guessed < 50) {
        msg = "Вы отгадали только <b>" + pluralize(guessed, "регион") + "</b>";
        header = "Неплохо, но можно и лучше...";
      }
      else if(guessed >= 50 && guessed < REGIONS.length){
        msg = "Вы отгадали <b>" + pluralize(guessed, "регион") + "</b>. Попробуйте еще раз, возможно получится отгадать все?";
        header = "Здорово!";
      }
      else {
        msg = "Вы отгадали все регионы! Поздравляем, вы настоящий патриот!";
        header = "Невероятно!";
      }

      document.querySelector("#end-modal h1").innerHTML = header;
      document.querySelector("#end-modal h2").innerHTML = msg;
      socialObject.update(guessed);
    }
  }

  // Create state store and define update logic
  const store = createStore({
    gameState: STATE.INIT,
    draggingActive: false,
    draggingActiveActuallyStarted: false, // need to make sure that user actually dragged the map, to prevent click handling on regions after dragging
    draggingLastPoint: [0, 0],
    draggingOffset: [0, 0],
    draggingZoom: 1,
    regionCodes: [],
    currentRegionIndex: 0,
    guessed: 0,
    mistakes: 0,
  });

  // Drag logic
  const mapContainerEl = document.getElementById("map-container");
  const mapZoomEl = document.getElementById("map-zoom");
  const mapEl = document.getElementById("map");
  let updateDragging = (state) => {
    const {draggingActive, draggingOffset, draggingZoom } = state;
    mapContainerEl.classList.toggle('isDragging', draggingActive);
    mapZoomEl.style.transform = `scale(${draggingZoom})`;
    mapEl.style.transform = `translateX(${draggingOffset[0]}px) translateY(${draggingOffset[1]}px)`;
  };
  let handleStart = ([x, y]) => {
    store.setState({
      draggingActive: true,
      draggingActiveActuallyStarted: false,
      start: [x, y],
      draggingLastPoint: [x, y],
    });
  };
  let handleStop = () => {
    store.setState({
      draggingActive: false,
    });
  };
  let handleMove = ([x, y]) => {
    let state = store.getState();
    if (state.draggingActive) {
      let draggingActiveActuallyStarted = Math.abs(state.start[0] - x) > 3 || Math.abs(state.start[1] - y) > 3;
      let diffX = (x - state.draggingLastPoint[0]) / state.draggingZoom;
      let diffY = (y - state.draggingLastPoint[1]) / state.draggingZoom;
      store.setState({
        draggingOffset: [state.draggingOffset[0] + diffX, state.draggingOffset[1] + diffY],
        draggingLastPoint: [x, y],
        draggingActiveActuallyStarted: state.draggingActiveActuallyStarted || draggingActiveActuallyStarted,
      });
    }
  };
  let handleZoom = (delta) => {
    const state = store.getState();
    const newZoom = Math.max(0.25, Math.min(10, state.draggingZoom + (delta * 0.01)));
    store.setState({
      draggingZoom: newZoom,
    });
  };
  mapContainerEl.addEventListener("mousedown", (e) => handleStart([e.clientX, e.clientY]));
  mapContainerEl.addEventListener("mouseup", handleStop);
  mapContainerEl.addEventListener("mousemove", (e) => handleMove([e.clientX, e.clientY]));
  mapContainerEl.addEventListener("mouseleave", handleStop);
  mapContainerEl.addEventListener("wheel", (e) => handleZoom(e.deltaY, [e.clientX, e.clientY]));
  mapContainerEl.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      let firstTouch = e.touches.item(0);
      handleStart([firstTouch.clientX, firstTouch.clientY])
    }
  }, false);
  mapContainerEl.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      let firstTouch = e.touches.item(0);
      handleMove([firstTouch.clientX, firstTouch.clientY])
    }
  });
  mapContainerEl.addEventListener("touchend", handleStop);
  mapContainerEl.addEventListener("touchcancel", handleStop);

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
        guessed: 0,
        mistakes: 0,
      });

      // Reset painted regions
      document.querySelectorAll('.land').forEach((x) => {
        x.classList.remove('success');
        x.classList.remove('failed')
      })
    });
  });

  // Region click behaviour
  document.getElementById('regions').addEventListener('click', (e) => {
    let state = store.getState();

    if (state.draggingActiveActuallyStarted) {
      return;
    }

    const regionPathEl = e.target;
    if (!regionPathEl.classList.contains("land")) {
      return;
    }
    const regionCode = regionPathEl.id;
    const currentRegionIndex = state.currentRegionIndex;
    const currentRegionCode = state.regionCodes[currentRegionIndex];
    const isSuccess = regionCode === currentRegionCode;
    let newMistakes = state.mistakes + (isSuccess ? 0 : 1);

    document.getElementById(currentRegionCode).classList.add(isSuccess ? 'success' : 'failed')

    store.setState({
      gameState: isSuccess ? STATE.TRY_SUCCESS : STATE.TRY_FAILED,
      guessed: state.guessed + (isSuccess ? 1 : 0),
      mistakes: newMistakes,
    });
    setTimeout(() => {
      if (newMistakes > MAX_MISTAKES || state.currentRegionIndex === REGIONS.length - 1) {
        store.setState({
          gameState: STATE.GAME_OVER,
        });
      } else {
        const state = store.getState();
        const newRegionIndex = state.currentRegionIndex + 1;
        store.setState({
          gameState: STATE.PLAYING,
          currentRegionIndex: newRegionIndex,
          mistakes: newRegionIndex % LEVEL_SIZE === 0 ? 0 : state.mistakes,
        });
      }
    }, 1000);
  });

  let update = (state, oldState) => {
    updateDragging(state);
    updateStats(state);
    updateGameState(state);
  };
  store.subscribe(update);
  updateStats(store.getState());
  updateGameState(store.getState());

});
