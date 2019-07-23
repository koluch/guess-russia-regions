//@flow strict
import { createStore } from "set-state-store";
import { REGIONS, REGION_CODES, REGION_TITLES } from "./regions.js";
import { $, $$, pluralize, shuffleArray } from "./utils.js";
import social from "./social.js";
import type { IPoint } from "./types.js";

const STATE = {
  INIT: "INIT",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
  TRY_SUCCESS: "TRY_SUCCESS",
  TRY_FAILED: "TRY_FAILED",
};

const LEVEL_SIZE = 10;
const MAX_MISTAKES = 3;

type IState = {
  gameState: $Values<typeof STATE>,
  draggingActive: boolean,
  draggingActiveActuallyStarted: boolean, // need to make sure that user actually dragged the map, to prevent click handling on regions after dragging
  draggingLastPoint: IPoint,
  draggingOffset: IPoint,
  draggingZoom: number,
  regionCodes: string[],
  currentRegionIndex: number,
  guessed: number,
  mistakes: number,
  start: IPoint
}

document.addEventListener("DOMContentLoaded", () => {
  // Init social buttons
  const socialObject = social($('social'));

  function updateStats(state, oldState) {
    const { currentRegionIndex, mistakes, gameState} = state;
    $('#stats').classList.toggle('hidden', gameState !== STATE.PLAYING);
    $('#stats .level span').textContent = `${Math.ceil((1 + currentRegionIndex) / LEVEL_SIZE)}/${Math.ceil(REGION_CODES.length / LEVEL_SIZE)}`
    $('#stats .mistakes span').textContent = `${mistakes}/${MAX_MISTAKES}`;
  }

  function updateGameState(state, oldState) {
    const { gameState, regionCodes, currentRegionIndex, guessed } = state;
    Object.entries(STATE).forEach(([key, value]) => {
      window.document.body.classList.toggle(key, gameState === value);
    });

    if (gameState === STATE.PLAYING) {
      const currentRegionCode = regionCodes[currentRegionIndex];
      const currentRegion = REGIONS.find(({ code }) => code === currentRegionCode);
      if (currentRegion == null) {
        throw new Error(`Region not found: "${currentRegionCode}"`);
      }
      $('#currentRegion').textContent = currentRegion.title;
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

      $("#end-modal h1").innerHTML = header;
      $("#end-modal h2").innerHTML = msg;
      socialObject.update(guessed);
    }
  }

  // Create state store and define update logic
  const initialState: IState = {
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
    start: [0, 0]
  };
  const store = createStore(initialState);

  // Drag logic
  const mapContainerEl = $("#map-container");
  const mapZoomEl = $("#map-zoom");
  const mapEl = $("#map");
  let updateDragging = (state, oldState) => {
    const {draggingActive, draggingOffset, draggingZoom } = state;
    mapContainerEl.classList.toggle('isDragging', draggingActive);
    if (state.draggingZoom !== oldState.draggingZoom) {
      mapZoomEl.style.transform = `scale(${draggingZoom})`;
    }
    if (state.draggingOffset[0] !== oldState.draggingOffset[0] || state.draggingOffset[1] !== oldState.draggingOffset[1]) {
      mapEl.style.transform = `translateX(${draggingOffset[0]}px) translateY(${draggingOffset[1]}px)`;
    }
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
  mapContainerEl.addEventListener("mousedown", (e: MouseEvent) => handleStart([e.clientX, e.clientY]));
  mapContainerEl.addEventListener("mouseup", handleStop);
  mapContainerEl.addEventListener("mousemove", (e: MouseEvent) => handleMove([e.clientX, e.clientY]));
  mapContainerEl.addEventListener("mouseleave", handleStop);
  mapContainerEl.addEventListener("wheel", (e: WheelEvent) => handleZoom(e.deltaY));
  mapContainerEl.addEventListener("touchstart", (e: TouchEvent) => {
    const firstTouch = e.touches.item(0);
    if (firstTouch != null) {
      handleStart([firstTouch.clientX, firstTouch.clientY])
    }
  }, false);
  mapContainerEl.addEventListener("touchmove", (e: TouchEvent) => {
    const firstTouch = e.touches.item(0);
    if (firstTouch != null) {
      handleMove([firstTouch.clientX, firstTouch.clientY])
    }
  });
  mapContainerEl.addEventListener("touchend", handleStop);
  mapContainerEl.addEventListener("touchcancel", handleStop);

  // Start and end modal behaviour
  [
    $('start-modal'),
    $('end-modal')
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
      $$('.land').forEach((x) => {
        x.classList.remove('success');
        x.classList.remove('failed')
      });
      $$('#map-titles > span').forEach((x) => {
        x.classList.remove('visible');
      })
    });
  });

  // Region click behaviour
  $('#regions').addEventListener('click', (e: MouseEvent) => {
    let state = store.getState();

    if (state.draggingActiveActuallyStarted) {
      return;
    }

    const regionPathEl = e.target;
    if (regionPathEl instanceof HTMLElement) {
      if (!regionPathEl.classList.contains("land")) {
        return;
      }
      const regionCode = regionPathEl.id;
      const currentRegionIndex = state.currentRegionIndex;
      const currentRegionCode = state.regionCodes[currentRegionIndex];
      const isSuccess = regionCode === currentRegionCode;
      let newMistakes = state.mistakes + (isSuccess ? 0 : 1);

      $(`#${currentRegionCode}`).classList.add(isSuccess ? 'success' : 'failed');
      $(`#${currentRegionCode}__title`).classList.add('visible');

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
    }
  });

  // Mouse over logic
  const regionsEl = $('#regions');
  regionsEl.addEventListener('mouseover', (e: MouseEvent) => {
    const regionPathEl = e.target;
    if (regionPathEl instanceof HTMLElement) {
      if (!regionPathEl.classList.contains("land")) {
        return;
      }
      const regionCode = regionPathEl.id;
      $$('#map-titles > .hover').forEach((x) => {
        x.classList.remove("hover");
      });
      const titleEl = $(`#${regionCode}__title`);
      titleEl.classList.add('hover');
    }
  });
  regionsEl.addEventListener('mouseout', (e: MouseEvent) => {
    $$('#map-titles > .hover').forEach((x) => {
      x.classList.remove("hover");
    });
  });

  // Render titles
  REGIONS.forEach(({ code, title, titleParams = {} }) => {
    const regionPathEl = $(`#${code}`);
    const bounds = regionPathEl.getBoundingClientRect();

    const offset = titleParams.offset || [0, 0];
    const width = titleParams.width != null ? titleParams.width : bounds.width;
    const size = titleParams.size;

    const textEl = $(`#${code}__title`);
    textEl.textContent = title;
    const style = new CSSStyleDeclaration();
    style.left = `${bounds.left + bounds.width / 2 + offset[0]}px`;
    style.top = `${bounds.top + bounds.height / 2 + offset[1]}px`;
    style.width = `${width}px`;
    style.fontSize = size != null ? `${size}px` : style.fontSize;
    textEl.style = style;
  });

  let update = (state, oldState) => {
    updateDragging(state, oldState);
    updateStats(state, oldState);
    updateGameState(state, oldState);
  };
  store.subscribe(update);
  update(store.getState(), store.getState());
});
