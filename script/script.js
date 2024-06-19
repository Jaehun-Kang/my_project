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
    for (let i = 0; i < 128 * 128; i++) {
      const gridInside = document.createElement('div');
      gridInside.classList.add('map_grid--inside');
      gridInside.classList.add('map_grid--force');
      mapGrid.appendChild(gridInside);
    }

    fetch('redPixelIndices.txt')
      .then(response => response.text())
      .then(text => {
        const redGridIndices = text.trim().split('\n').map(num => parseInt(num.trim(), 10));
  
        const gridInsides = mapGrid.querySelectorAll('.map_grid--inside');
  
        redGridIndices.forEach(index => {
          if (gridInsides[index]) {
            gridInsides[index].classList.remove('map_grid--inside');
            gridInsides[index].classList.add('map_grid--insideRed');
          }
        });
      })
      .catch(error => {
        console.error('Error fetching or processing file:', error);
      });
  }
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
    }
  }

  function dragEnd() {
    isDragging = false;
    zoom.style.cursor = 'grab';
  }

  function handleWheel(e) {
    if (document.querySelector('.underbar_buildings--selection-selected')) return;
    e.preventDefault();

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

  const buildingSelections = document.querySelectorAll('.underbar_buildings--selection');

  buildingSelections.forEach(selection => {
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
        buildingSelections.forEach(item => {
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

  const raceSelections = document.querySelectorAll('.underbar_race--selection')

  raceSelections.forEach(selection => {
    selection.addEventListener('click', () => {
      raceSelections.forEach(item => {
        item.classList.remove('underbar_race--selection-selected');
      });
      selection.classList.add('underbar_race--selection-selected');
    });
  });


  const mapContainer = document.querySelector('.container_map');
  let buildingPlacing = false;
  let imageStack = [];
  let saveImgStack = [];

  mapContainer.addEventListener('click', (event) => {

    const hatcherySelected = document.querySelector('.underbar_buildings--zerg--hatchery')
    && document.querySelector('.underbar_buildings--zerg--hatchery').classList.contains('underbar_buildings--selection-selected');
    const lairSelected = document.querySelector('.underbar_buildings--zerg--lair')
    && document.querySelector('.underbar_buildings--zerg--lair').classList.contains('underbar_buildings--selection-selected');
    const hiveSelected = document.querySelector('.underbar_buildings--zerg--hive')
    && document.querySelector('.underbar_buildings--zerg--hive').classList.contains('underbar_buildings--selection-selected');
    const creepColonySelected = document.querySelector('.underbar_buildings--zerg--creep-colony')
    && document.querySelector('.underbar_buildings--zerg--creep-colony').classList.contains('underbar_buildings--selection-selected');
    const sunkenColonySelected = document.querySelector('.underbar_buildings--zerg--sunken-colony')
    && document.querySelector('.underbar_buildings--zerg--sunken-colony').classList.contains('underbar_buildings--selection-selected');
    const sporeColonySelected = document.querySelector('.underbar_buildings--zerg--spore-colony')
    && document.querySelector('.underbar_buildings--zerg--spore-colony').classList.contains('underbar_buildings--selection-selected');
    const extractorSelected = document.querySelector('.underbar_buildings--zerg--extractor')
    && document.querySelector('.underbar_buildings--zerg--extractor').classList.contains('underbar_buildings--selection-selected');
    const spawningPoolSelected = document.querySelector('.underbar_buildings--zerg--spawning-pool')
    && document.querySelector('.underbar_buildings--zerg--spawning-pool').classList.contains('underbar_buildings--selection-selected');
    const evolutionChamberSelected = document.querySelector('.underbar_buildings--zerg--evolution-chamber')
    && document.querySelector('.underbar_buildings--zerg--evolution-chamber').classList.contains('underbar_buildings--selection-selected');
    const hydraliskDenSelected = document.querySelector('.underbar_buildings--zerg--hydralisk-den')
    && document.querySelector('.underbar_buildings--zerg--hydralisk-den').classList.contains('underbar_buildings--selection-selected');
    const spireSelected = document.querySelector('.underbar_buildings--zerg--spire')
    && document.querySelector('.underbar_buildings--zerg--spire').classList.contains('underbar_buildings--selection-selected');
    const greaterSpireSelected = document.querySelector('.underbar_buildings--zerg--greater-spire')
    && document.querySelector('.underbar_buildings--zerg--greater-spire').classList.contains('underbar_buildings--selection-selected');
    const queensNestSelected = document.querySelector('.underbar_buildings--zerg--queens-nest')
    && document.querySelector('.underbar_buildings--zerg--queens-nest').classList.contains('underbar_buildings--selection-selected');
    const ultraliskCavernSelected = document.querySelector('.underbar_buildings--zerg--ultralisk-cavern')
    && document.querySelector('.underbar_buildings--zerg--ultralisk-cavern').classList.contains('underbar_buildings--selection-selected');
    const defilerMoundSelected = document.querySelector('.underbar_buildings--zerg--defiler-mound')
    && document.querySelector('.underbar_buildings--zerg--defiler-mound').classList.contains('underbar_buildings--selection-selected');
    const infestedCommandCenterSelected = document.querySelector('.underbar_buildings--zerg--infested-command-center')
    && document.querySelector('.underbar_buildings--zerg--infested-command-center').classList.contains('underbar_buildings--selection-selected');
    const nexusSelected = document.querySelector('.underbar_buildings--protoss--nexus')
    && document.querySelector('.underbar_buildings--protoss--nexus').classList.contains('underbar_buildings--selection-selected');
    const pylonSelected = document.querySelector('.underbar_buildings--protoss--pylon')
    && document.querySelector('.underbar_buildings--protoss--pylon').classList.contains('underbar_buildings--selection-selected');
    const assimilatorSelected = document.querySelector('.underbar_buildings--protoss--assimilator')
    && document.querySelector('.underbar_buildings--protoss--assimilator').classList.contains('underbar_buildings--selection-selected');
    const gatewaySelected = document.querySelector('.underbar_buildings--protoss--gateway')
    && document.querySelector('.underbar_buildings--protoss--gateway').classList.contains('underbar_buildings--selection-selected');
    const forgeSelected = document.querySelector('.underbar_buildings--protoss--forge')
    && document.querySelector('.underbar_buildings--protoss--forge').classList.contains('underbar_buildings--selection-selected');
    const photonCanonSelected = document.querySelector('.underbar_buildings--protoss--photon-canon')
    && document.querySelector('.underbar_buildings--protoss--photon-canon').classList.contains('underbar_buildings--selection-selected');
    const cyberneticsCoreSelected = document.querySelector('.underbar_buildings--protoss--cybernetics-core')
    && document.querySelector('.underbar_buildings--protoss--cybernetics-core').classList.contains('underbar_buildings--selection-selected');
    const shieldBatterySelected = document.querySelector('.underbar_buildings--protoss--shield-battery')
    && document.querySelector('.underbar_buildings--protoss--shield-battery').classList.contains('underbar_buildings--selection-selected');
    const roboticsFacilitySelected = document.querySelector('.underbar_buildings--protoss--robotics-facility')
    && document.querySelector('.underbar_buildings--protoss--robotics-facility').classList.contains('underbar_buildings--selection-selected');
    const stargateSelected = document.querySelector('.underbar_buildings--protoss--stargate')
    && document.querySelector('.underbar_buildings--protoss--stargate').classList.contains('underbar_buildings--selection-selected');
    const citadelOfAdunSelected = document.querySelector('.underbar_buildings--protoss--citadel-of-adun')
    && document.querySelector('.underbar_buildings--protoss--citadel-of-adun').classList.contains('underbar_buildings--selection-selected');
    const roboticsSupportBaySelected = document.querySelector('.underbar_buildings--protoss--robotics-support-bay')
    && document.querySelector('.underbar_buildings--protoss--robotics-support-bay').classList.contains('underbar_buildings--selection-selected');
    const fleetBeaconSelected = document.querySelector('.underbar_buildings--protoss--fleet-beacon')
    && document.querySelector('.underbar_buildings--protoss--fleet-beacon').classList.contains('underbar_buildings--selection-selected');
    const templarArchivesSelected = document.querySelector('.underbar_buildings--protoss--templar-archives')
    && document.querySelector('.underbar_buildings--protoss--templar-archives').classList.contains('underbar_buildings--selection-selected');
    const observatorySelected = document.querySelector('.underbar_buildings--protoss--observatory')
    && document.querySelector('.underbar_buildings--protoss--observatory').classList.contains('underbar_buildings--selection-selected');
    const arbiterTribunalSelected = document.querySelector('.underbar_buildings--protoss--arbiter-tribunal')
    && document.querySelector('.underbar_buildings--protoss--arbiter-tribunal').classList.contains('underbar_buildings--selection-selected');
    const commandCenterSelected = document.querySelector('.underbar_buildings--terran--command-center')
    && document.querySelector('.underbar_buildings--terran--command-center').classList.contains('underbar_buildings--selection-selected');
    const commandCenterComsatStationSelected = document.querySelector('.underbar_buildings--terran--command-center-comsat-station')
    && document.querySelector('.underbar_buildings--terran--command-center-comsat-station').classList.contains('underbar_buildings--selection-selected');
    const commandCenterNuclearSiloSelected = document.querySelector('.underbar_buildings--terran--command-center-nuclear-silo')
    && document.querySelector('.underbar_buildings--terran--command-center-nuclear-silo').classList.contains('underbar_buildings--selection-selected');
    const supplyDepotSelected = document.querySelector('.underbar_buildings--terran--supply-depot')
    && document.querySelector('.underbar_buildings--terran--supply-depot').classList.contains('underbar_buildings--selection-selected');
    const refinerySelected = document.querySelector('.underbar_buildings--terran--refinery')
    && document.querySelector('.underbar_buildings--terran--refinery').classList.contains('underbar_buildings--selection-selected');
    const barracksSelected = document.querySelector('.underbar_buildings--terran--barracks')
    && document.querySelector('.underbar_buildings--terran--barracks').classList.contains('underbar_buildings--selection-selected');
    const engineeringBaySelected = document.querySelector('.underbar_buildings--terran--engineering-bay')
    && document.querySelector('.underbar_buildings--terran--engineering-bay').classList.contains('underbar_buildings--selection-selected');
    const missileTurretSelected = document.querySelector('.underbar_buildings--terran--missile-turret')
    && document.querySelector('.underbar_buildings--terran--missile-turret').classList.contains('underbar_buildings--selection-selected');
    const academySelected = document.querySelector('.underbar_buildings--terran--academy')
    && document.querySelector('.underbar_buildings--terran--academy').classList.contains('underbar_buildings--selection-selected');
    const bunkerSelected = document.querySelector('.underbar_buildings--terran--bunker')
    && document.querySelector('.underbar_buildings--terran--bunker').classList.contains('underbar_buildings--selection-selected');
    const factorySelected = document.querySelector('.underbar_buildings--terran--factory')
    && document.querySelector('.underbar_buildings--terran--factory').classList.contains('underbar_buildings--selection-selected');
    const factoryMachineShopSelected = document.querySelector('.underbar_buildings--terran--factory-machine-shop')
    && document.querySelector('.underbar_buildings--terran--factory-machine-shop').classList.contains('underbar_buildings--selection-selected');
    const starportSelected = document.querySelector('.underbar_buildings--terran--starport')
    && document.querySelector('.underbar_buildings--terran--starport').classList.contains('underbar_buildings--selection-selected');
    const starportControlTowerSelected = document.querySelector('.underbar_buildings--terran--starport-control-tower')
    && document.querySelector('.underbar_buildings--terran--starport-control-tower').classList.contains('underbar_buildings--selection-selected');
    const scienceFacilitySelected = document.querySelector('.underbar_buildings--terran--science-facility')
    && document.querySelector('.underbar_buildings--terran--science-facility').classList.contains('underbar_buildings--selection-selected');
    const scienceFacilityCovertOpsSelected = document.querySelector('.underbar_buildings--terran--science-facility-covert-ops')
    && document.querySelector('.underbar_buildings--terran--science-facility-covert-ops').classList.contains('underbar_buildings--selection-selected');
    const scienceFacilityPhysicsLabSelected = document.querySelector('.underbar_buildings--terran--science-facility-physics-lab')
    && document.querySelector('.underbar_buildings--terran--science-facility-physics-lab').classList.contains('underbar_buildings--selection-selected');
    const armorySelected = document.querySelector('.underbar_buildings--terran--armory')
    && document.querySelector('.underbar_buildings--terran--armory').classList.contains('underbar_buildings--selection-selected');

    if (hatcherySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/hatchery.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

    const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (lairSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.5;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/lair.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (hiveSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/hive.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (creepColonySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/creepColony.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (sunkenColonySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2.5;
      const imageHeight = gridSize * 2.1;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/sunkenColony.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (sporeColonySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2.1;
      const imageHeight = gridSize * 2.3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/sporeColony.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (extractorSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.5;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/extractor.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (spawningPoolSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/spawningPool.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (evolutionChamberSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.7;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/evolutionChamber.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (hydraliskDenSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/hydraliskDen.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (spireSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/spire.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (greaterSpireSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2.2;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/greaterSpire.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (queensNestSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.8;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/queensNest.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (ultraliskCavernSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.9;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/ultraliskCavern.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (defilerMoundSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 2.6;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/defilerMound.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (infestedCommandCenterSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/zerg/infestedCommandCenter.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (nexusSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4.2;
      const imageHeight = gridSize * 4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/nexus.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (pylonSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/pylon.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (assimilatorSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/assimilator.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (gatewaySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/gateway.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (forgeSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/forge.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (photonCanonSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/photonCanon.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (cyberneticsCoreSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.7;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/cyberneticsCore.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (shieldBatterySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/shieldBattery.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (roboticsFacilitySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3.05;
      const imageHeight = gridSize * 2.8;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/roboticsFacility.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (stargateSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.7;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/stargate.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (citadelOfAdunSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.6;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/citadelOfAdun.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (roboticsSupportBaySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3.1;
      const imageHeight = gridSize * 2.7;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/roboticsSupportBay.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (fleetBeaconSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/fleetBeacon.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (templarArchivesSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4.2;
      const imageHeight = gridSize * 3.5;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/templarArchives.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (observatorySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/observatory.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (arbiterTribunalSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/protoss/arbiterTribunal.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (commandCenterSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.05;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/commandCenter.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (commandCenterComsatStationSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6;
      const imageHeight = gridSize * 3.05;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/commandCenterComsatStation.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (commandCenterNuclearSiloSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6;
      const imageHeight = gridSize * 3.05;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/commandCenterNuclearSilo.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (supplyDepotSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2.3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/supplyDepot.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (refinerySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/refinery.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (barracksSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.5;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/barracks.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (engineeringBaySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4.2;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/engineeringBay.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (missileTurretSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 2;
      const imageHeight = gridSize * 2.05;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/missileTurret.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (academySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/academy.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (bunkerSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3;
      const imageHeight = gridSize * 2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/bunker.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (factorySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/factory.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (factoryMachineShopSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6.06;
      const imageHeight = gridSize * 3.4;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/factoryMachineShop.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (starportSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3.2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/starport.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (starportControlTowerSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6;
      const imageHeight = gridSize * 3.2;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/starportControlTower.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (scienceFacilitySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 4;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/scienceFacility.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (scienceFacilityCovertOpsSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/scienceFacilityCovertOps.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (scienceFacilityPhysicsLabSelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 6;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/scienceFacilityPhysicsLab.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    } else if (armorySelected) {
      const x = event.clientX;
      const y = event.clientY;

      const gridClickImgInput = document.elementFromPoint(x, y);
      if (!gridClickImgInput || !gridClickImgInput.classList.contains('map_grid--force')) {
        return;
      }

      const gridRect = gridClickImgInput.getBoundingClientRect();

      const gridSize = Math.min(gridRect.width, gridRect.height);
      const imageWidth = gridSize * 3.2;
      const imageHeight = gridSize * 3;

      const newImage = document.createElement('img');
      newImage.src = './assets/starcraftBuildings/terran/armory.webp';
      newImage.classList.add('map-image'); 
      newImage.style.position = 'absolute';
      newImage.style.width = `${imageWidth}px`;
      newImage.style.height = `${imageHeight}px`;

      newImage.style.left = `${gridRect.left - mapContainer.getBoundingClientRect().left}px`;
      newImage.style.top = `${gridRect.bottom - mapContainer.getBoundingClientRect().top - imageHeight}px`;

      mapContainer.appendChild(newImage);

      imageStack.push(newImage);

      const src = newImage.src.split(window.location.origin)[1];
      saveImgStack.push({
        src: src,
        left: newImage.style.left,
        top: newImage.style.top,
        width: newImage.style.width,
        height: newImage.style.height,
      });
    }
  });
    
const copyButton = document.querySelector('.copy');
if (copyButton) {
  copyButton.addEventListener('click', () => {
    const saveImgStackText = JSON.stringify(saveImgStack, null, 2); 
    console.log(saveImgStackText);

    navigator.clipboard.writeText(saveImgStackText)
      .then(() => {
        alert('복사가 완료되었습니다! 텍스트 파일로 저장해두세요');
      })
      .catch(err => {
        alert('복사 실패.. ', err);
      });
  });
}

const loadButton = document.querySelector('.load')

if (loadButton) {
  loadButton.addEventListener('click', () => {
    const savedData = prompt('복사한 텍스트를 붙여넣으세요 :');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        parsedData.forEach(imageData => {
          const newImage = document.createElement('img');
          newImage.src = imageData.src;
          newImage.classList.add('map-image');
          newImage.style.position = 'absolute';
          newImage.style.width = imageData.width;
          newImage.style.height = imageData.height;
          newImage.style.zIndex = 999;
          newImage.style.left = imageData.left;
          newImage.style.top = imageData.top;

          mapContainer.appendChild(newImage);

          imageStack.push(newImage);
          saveImgStack.push(imageData);
        });
      } catch (err) {
        alert('불러오기 실패.. ', err);
      }
    }
  });
}


const undoButton = document.querySelector('.undo');
if (undoButton) {
  undoButton.addEventListener('click', () => {
    if (imageStack.length > 0) {
      const lastImage = imageStack.pop();
      mapContainer.removeChild(lastImage);
      saveImgStack.pop();
    } else {
      alert('뒤로가기 할 단계가 없습니다');
    }
  });
  
}

const clearButton = document.querySelector('.clear');
if (clearButton) {
  clearButton.addEventListener('click', () => {
    var confirmflag = confirm('정말 초기화하시겠습니까?');
    if (confirmflag) {
    imageStack.forEach(image => {
      mapContainer.removeChild(image);
    });
    imageStack = [];
    saveImgStack = [];
    alert('초기화 완료')
    } else {
      
    }
  });
}



const selection = document.querySelector('.underbar_buildings--zerg--hatchery', '.underbar_buildings--zerg--lair');
if (selection) {
  selection.addEventListener('click', () => {
    buildingPlacing = !buildingPlacing;
    // console.log('건물 놓기:', buildingPlacing);

    if (buildingPlacing) {
      placingEnabled = true;
    } else {
      placingEnabled = false;
    }
  });
}

mapGrid.querySelectorAll('.map_grid--inside').forEach((gridInside, index) => {
  gridInside.addEventListener('click', () => {
    console.log(`Clicked gridInside index: ${index}`);
    // 추가적인 작업을 수행할 수 있습니다.
  });
});

  // 이거 주석 해제하면 여러개 그리드 hover 작동하긴 하는데 렉이 많이 걸리네요 그래서 그냥 패스하겠습니다
  //   const gridForce = document.querySelectorAll('.map_grid--force');
  // const buildingSelections = document.querySelectorAll('.underbar_buildings--selection');
  // gridForce.forEach((forcedGrid, index) => {
  //   forcedGrid.addEventListener('mouseover', function () {
  //     const numCols = 128;
  //     const row = Math.floor(index / numCols);
  //     const col = index % numCols;
  //     // if (buildingSelections.classList.contains('x6y3')) {
        
  //     // }
  //     // if (buildingSelections.classList.contains('x4y3')) {
  //     // }
  //     // if (buildingSelections.classList.contains('x4y2')) {
  //     // }
  //     // if (buildingSelections.classList.contains('x3y2')) {
  //     // }
  //     if (buildingSelections.classList.contains('x2y2')) {
  //       if (forcedGrid.classList.contains('map_grid--inside')) {
  //         forcedGrid.classList.add('map_grid--force-green');
  //       }
  //       if (forcedGrid.classList.contains('map_grid--insideRed')) {
  //         forcedGrid.classList.add('map_grid--force-red');
  //       }
  //       const rightIndex = index + 1;
  //       if (col < numCols - 1) {
  //         if (gridForce[rightIndex].classList.contains('map_grid--inside')) {
  //           gridForce[rightIndex].classList.add('map_grid--force-green');
  //         }
  //         if (gridForce[rightIndex].classList.contains('map_grid--insideRed')) {
  //           gridForce[rightIndex].classList.add('map_grid--force-red');
  //         }
  //       }
  //       const rightrightIndex = index + 2;
  //       if (col < numCols - 1) {
  //         if (gridForce[rightrightIndex].classList.contains('map_grid--inside')) {
  //           gridForce[rightrightIndex].classList.add('map_grid--force-green');
  //         }
  //         if (gridForce[rightrightIndex].classList.contains('map_grid--insideRed')) {
  //           gridForce[rightrightIndex].classList.add('map_grid--force-red');
  //         }
  //       }
  //       const aboveIndex = index - numCols;
  //       if (row > 0) {
  //         if (gridForce[aboveIndex].classList.contains('map_grid--inside')) {
  //           gridForce[aboveIndex].classList.add('map_grid--force-green');
  //         }
  //         if (gridForce[aboveIndex].classList.contains('map_grid--insideRed')) {
  //           gridForce[aboveIndex].classList.add('map_grid--force-red');
  //         }
  //       }
  //       const aboveaboveIndex = index - calc(numCols * 2);
  //       if (row > 0) {
  //         if (gridForce[aboveaboveIndex].classList.contains('map_grid--inside')) {
  //           gridForce[aboveaboveIndex].classList.add('map_grid--force-green');
  //         }
  //         if (gridForce[aboveaboveIndex].classList.contains('map_grid--insideRed')) {
  //           gridForce[aboveaboveIndex].classList.add('map_grid--force-red');
  //         }
  //       }
  //     }
  //   });
  //   forcedGrid.addEventListener('mouseout', function () {
  //     gridForce.forEach(grid => {
  //       grid.classList.remove('map_grid--force-green');
  //       grid.classList.remove('map_grid--force-red');
  //     });
  //   });
  // });
  // forcedGrid.addEventListener('mouseout', function () {
  //   gridForce.forEach(grid => {
  //     grid.classList.remove('map_grid--force-green');
  //     grid.classList.remove('map_grid--force-red');
  //   });
  // });
});
