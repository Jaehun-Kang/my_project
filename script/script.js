document.addEventListener('DOMContentLoaded', () => {
  const zoom = document.querySelector('.map_content');
  const container = document.querySelector('.container_map');
  const headerHeight = document.querySelector('.header').offsetHeight;
  const mapGrid = document.querySelector('.map_grid');

  let isDragging = false;
  let startX, startY;
  let offsetX = 0, offsetY = 0;
  let scale = 1;
  const scaleSteps = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  let currentScaleStep = 1;

  function createGridInside() {
    // 먼저 그리드 요소들을 생성합니다.
    for (let i = 0; i < 128 * 128 + 1; i++) {
      const gridInside = document.createElement('div');
      gridInside.classList.add('map_grid--inside');
      mapGrid.appendChild(gridInside);
    }
  
    // red_pixel_indices.txt 파일을 fetch하여 처리합니다.
    fetch('red_pixel_indices.txt')
      .then(response => response.text())
      .then(text => {
        const redGridIndices = text.trim().split('\n').map(num => parseInt(num.trim(), 10));
  
        // mapGrid의 모든 .map_grid--inside 요소들을 찾습니다.
        const gridInsides = mapGrid.querySelectorAll('.map_grid--inside');
  
        // redGridIndices 배열에 있는 각 인덱스에 대해 클래스를 변경합니다.
        redGridIndices.forEach(index => {
          if (gridInsides[index]) {
            // 기존 클래스를 제거하고 새 클래스를 추가합니다.
            gridInsides[index].classList.remove('map_grid--inside');
            gridInsides[index].classList.add('map_grid--insideRed');
          }
        });
      })
      .catch(error => {
        console.error('Error fetching or processing file:', error);
      });
  }
  
  // createGridInside() 함수 호출하여 실행합니다.
  createGridInside();

  function updateGridSize() {
    mapGrid.style.width = `${zoom.clientWidth}px`;
    mapGrid.style.height = `${zoom.clientHeight}px`;
  }

  function dragStart(e) {
    if (document.querySelector('.underbar_buildings--selection-selected')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = zoom.offsetLeft;
    offsetY = zoom.offsetTop;
    zoom.style.cursor = 'grabbing';
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

      // mapGrid.querySelectorAll('.map_grid--inside').forEach(gridInside => {
      //   gridInside.style.pointerEvents = 'none';
      // });
    }
  }

  function dragEnd() {
    isDragging = false;
    zoom.style.cursor = 'grab';

    // mapGrid.querySelectorAll('.map_grid--inside').forEach(gridInside => {
    //   gridInside.style.pointerEvents = 'auto';
    // });
  }

  function handleWheel(e) {
    if (document.querySelector('.underbar_buildings--selection-selected')) return;
    e.preventDefault();

    // let scaleFactor = e.deltaY > 0 ? -0.5 : 0.5;
    // scale += scaleFactor;
    // scale = Math.min(4, Math.max(1, scale));

    // zoom.style.transform = `scale(${scale})`;
    // mapGrid.style.transform = `scale(${scale})`;

    // let newLeft = Math.min(0, Math.max(zoom.offsetLeft, container.offsetWidth - (zoom.offsetWidth * scale)));
    // let newTop = Math.min(headerHeight, Math.max(zoom.offsetTop, container.offsetHeight - (zoom.offsetHeight * scale)));
    // zoom.style.left = `${newLeft}px`;
    // zoom.style.top = `${newTop}px`;
    // mapGrid.style.left = `${newLeft}px`;
    // mapGrid.style.top = `${newTop}px`;

    currentScaleStep = scaleSteps.indexOf(scale) + 1;
  }

  zoom.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
  container.addEventListener('wheel', handleWheel);

  zoom.style.cursor = 'grab';
  zoom.addEventListener('load', updateGridSize);
  updateGridSize();

  let buildings = document.querySelector('.underbar_buildings');
  let race = document.querySelectorAll('.underbar_race > div');

  race.forEach((raceIdx, idx) => {
    raceIdx.addEventListener('click', function (e) {
      let nth = idx + 1;
      buildings.dataset.opennth = nth;
      switch (nth) {
        case 1:
          buildings.style.gridTemplateRows = '15.625rem 0 0';
          break;
        case 2:
          buildings.style.gridTemplateRows = '0 15.625rem 0';
          break;
        case 3:
          buildings.style.gridTemplateRows = '0 0 15.625rem';
          break;
      }
    });
  });

  let selections = document.querySelectorAll('.underbar_buildings--selection');

  selections.forEach(selection => {
    selection.addEventListener('click', () => {
      if (selection.classList.contains('underbar_buildings--selection-selected')) {
        selection.classList.remove('underbar_buildings--selection-selected');
        mapGrid.querySelectorAll('.map_grid--inside').forEach(gridInside => {
          gridInside.style.pointerEvents = 'none';
          gridInside.style.zIndex = 'auto';
        });
        mapGrid.querySelectorAll('.map_grid--insideRed').forEach(gridInside => {
          gridInside.style.pointerEvents = 'none';
          gridInside.style.zIndex = 'auto';
        });
      } else {
        selections.forEach(item => {
          item.classList.remove('underbar_buildings--selection-selected');
        });
        selection.classList.add('underbar_buildings--selection-selected');
        mapGrid.querySelectorAll('.map_grid--inside').forEach(gridInside => {
          gridInside.style.pointerEvents = 'auto';
          gridInside.style.zIndex = '1';
        });
        mapGrid.querySelectorAll('.map_grid--insideRed').forEach(gridInside => {
          gridInside.style.pointerEvents = 'auto';
          gridInside.style.zIndex = '1';
        });
      }
    });
  });

  // mapGrid.querySelectorAll('.map_grid--inside').forEach((gridInside, index) => {
  //   gridInside.addEventListener('click', () => {
  //     console.log(`${index}`);
  //   });
  // });
});