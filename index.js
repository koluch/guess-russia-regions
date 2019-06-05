import { createStore } from 'set-state-store';

document.addEventListener("DOMContentLoaded", () => {
  const svgContainerEl = document.getElementById("svg-container");
  const svgEl = document.getElementById("svg");

  // Drag logic
  const store = createStore({
    isDragging: false,
    start: [0, 0],
    offset: [0, 0],
    zoom: 1,
  });
  store.subscribe((state) => {
    const {isDragging, offset, zoom } = state;
    svgContainerEl.classList.toggle('isDragging', isDragging);
    svgEl.style.transform = `translateX(${offset[0]}px) translateY(${offset[1]}px) scale(${zoom})`;
  });

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
