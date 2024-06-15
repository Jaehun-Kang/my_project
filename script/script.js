document.addEventListener("DOMContentLoaded", () => {
  const zoom = document.querySelector(".map_content");
  const container = document.querySelector(".container_map");
  const headerHeight = document.querySelector(".header").offsetHeight;
  const mapGrid = document.querySelector(".map_grid");

  let isDragging = false;
  let startX, startY;
  let offsetX = 0, offsetY = 0;
  let scale = 1;
  const scaleSteps = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  let currentScaleStep = 1;

  function createGridInside() {
    for (let i = 0; i < 128 * 128 + 1; i++) {
      const gridInside = document.createElement("div");
      gridInside.classList.add("map_grid-inside");
      mapGrid.appendChild(gridInside);
      // console.log(`Grid element ${i} created`);
    }
  }
  createGridInside();

  function updateGridSize() {
    mapGrid.style.width = `${zoom.clientWidth}px`;
    mapGrid.style.height = `${zoom.clientHeight}px`;
  }

  function dragStart(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = zoom.offsetLeft;
    offsetY = zoom.offsetTop;
    zoom.style.cursor = "grabbing";
    e.preventDefault();
  }

  function dragMove(e) {
    if (isDragging) {
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);

      let newLeft = offsetX + deltaX;
      let newTop = offsetY + deltaY;

      let minLeft, maxLeft, minTop, maxTop;
      switch (currentScaleStep) {
        case 1:
          minLeft = 0;
          maxLeft = 0;
          minTop = -700;
          maxTop = 0;
          break;
        case 2:
          minLeft = -325;
          maxLeft = 325;
          minTop = -1025;
          maxTop = 325;
          break;
        case 3:
          minLeft = -650;
          maxLeft = 650;
          minTop = -1350;
          maxTop = 650;
          break;
        case 4:
          minLeft = -975;
          maxLeft = 975;
          minTop = -1675;
          maxTop = 975;
          break;
        case 5:
          minLeft = -1300;
          maxLeft = 1300;
          minTop = -2000;
          maxTop = 1300;
          break;
        case 6:
          minLeft = -1625;
          maxLeft = 1625;
          minTop = -2325;
          maxTop = 1625;
          break;
        case 7:
          minLeft = -1950;
          maxLeft = 1950;
          minTop = -2650;
          maxTop = 1950;
          break;
        default:
          minLeft = -((zoom.offsetWidth * scale) - container.offsetWidth);
          maxLeft = 0;
          minTop = 0;
          maxTop = container.offsetHeight - (zoom.offsetHeight * scale);
          break;
      }

      newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
      newTop = Math.min(maxTop, Math.max(newTop, minTop));

      zoom.style.left = `${newLeft}px`;
      zoom.style.top = `${newTop}px`;
      mapGrid.style.left = `${newLeft}px`;
      mapGrid.style.top = `${newTop}px`;
    }
  }

  function dragEnd() {
    isDragging = false;
    zoom.style.cursor = "grab";
  }

  function handleWheel(e) {
    e.preventDefault();

    let scaleFactor = e.deltaY > 0 ? -0.5 : 0.5;
    scale += scaleFactor;
    scale = Math.min(4, Math.max(1, scale));

    zoom.style.transform = `scale(${scale})`;
    mapGrid.style.transform = `scale(${scale})`;

    let newLeft = Math.min(0, Math.max(zoom.offsetLeft, container.offsetWidth - (zoom.offsetWidth * scale)));
    let newTop = Math.min(headerHeight, Math.max(zoom.offsetTop, container.offsetHeight - (zoom.offsetHeight * scale)));
    zoom.style.left = `${newLeft}px`;
    zoom.style.top = `${newTop}px`;
    mapGrid.style.left = `${newLeft}px`;
    mapGrid.style.top = `${newTop}px`;

    currentScaleStep = scaleSteps.indexOf(scale) + 1;
  }

  zoom.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("mouseup", dragEnd);
  container.addEventListener("wheel", handleWheel);

  zoom.style.cursor = "grab";
  zoom.addEventListener("load", updateGridSize);
  updateGridSize();
});

