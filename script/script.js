document.addEventListener("DOMContentLoaded", () => {
  const zoomElement = document.querySelector(".map_content");
  const container = document.querySelector(".container_map");
  const headerHeight = document.querySelector(".header").offsetHeight;

  let isDragging = false;
  let startX, startY;
  let offsetX = 0, offsetY = 0;
  let scale = 1;
  const scaleSteps = [1, 1.5, 2, 2.5, 3, 3.5, 4];
 let currentScaleStep = 1;


  function dragStart(e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      offsetX = zoomElement.offsetLeft;
      offsetY = zoomElement.offsetTop;
      zoomElement.style.cursor = "grabbing";
      e.preventDefault();
  }

  function dragEnd() {
      isDragging = false;
      zoomElement.style.cursor = "grab";
  }


  
  function dragStep1(e) {
      if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          let newLeft = offsetX + deltaX / scale;
          let newTop = offsetY + deltaY / scale;

          const minLeft = -((zoomElement.offsetWidth * scale) - container.offsetWidth);
          newLeft = Math.min(0, Math.max(newLeft, minLeft));
          newTop = Math.min(0, Math.max(newTop, container.offsetHeight - (zoomElement.offsetHeight * scale)));

          zoomElement.style.left = `${newLeft}px`;
          zoomElement.style.top = `${newTop}px`;
          
          console.log("1번");
      }
  }

  function dragStep1_5(e) {
      if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;


          let newLeft = offsetX + deltaX / scale;
          let newTop = offsetY + deltaY / scale;

          const maxLeft = 325;
          const minLeft = -325;
          const maxTop = 325;
          const minTop = -1025;
          newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
          newTop = Math.min(maxTop, Math.max(newTop, minTop));

          zoomElement.style.left = `${newLeft}px`;
          zoomElement.style.top = `${newTop}px`;

          console.log('1.5번');
      }
  }

  function dragStep2(e) {
      if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          let newLeft = offsetX + deltaX / scale;
          let newTop = offsetY + deltaY / scale;

          const maxLeft = 650;
          const minLeft = -650;
          const maxTop = 650;
          const minTop = -1350;
          newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
          newTop = Math.min(maxTop, Math.max(newTop, minTop));

          zoomElement.style.left = `${newLeft}px`;
          zoomElement.style.top = `${newTop}px`;

          console.log('2번');
      }
  }

  function dragStep2_5(e) {
    if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newLeft = offsetX + deltaX / scale;
        let newTop = offsetY + deltaY / scale;

        const maxLeft = 975;
        const minLeft = -975;
        const maxTop = 975;
        const minTop = -1675;
        newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
        newTop = Math.min(maxTop, Math.max(newTop, minTop));

        zoomElement.style.left = `${newLeft}px`;
        zoomElement.style.top = `${newTop}px`;

        console.log('2.5번');
    }
}

function dragStep3(e) {
  if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = offsetX + deltaX / scale;
      let newTop = offsetY + deltaY / scale;

      const maxLeft = 1300;
      const minLeft = -1300;
      const maxTop = 1300;
      const minTop = -2000;
      newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
      newTop = Math.min(maxTop, Math.max(newTop, minTop));

      zoomElement.style.left = `${newLeft}px`;
      zoomElement.style.top = `${newTop}px`;

      console.log('3번');
  }
}

function dragStep3_5(e) {
  if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = offsetX + deltaX / scale;
      let newTop = offsetY + deltaY / scale;

      const maxLeft = 1625;
      const minLeft = -1625;
      const maxTop = 1625;
      const minTop = -2325;
      newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
      newTop = Math.min(maxTop, Math.max(newTop, minTop));

      zoomElement.style.left = `${newLeft}px`;
      zoomElement.style.top = `${newTop}px`;

      console.log('3.5번');
  }
}

function dragStep4(e) {
  if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = offsetX + deltaX / scale;
      let newTop = offsetY + deltaY / scale;

      const maxLeft = 1950;
      const minLeft = -1950;
      const maxTop = 1950;
      const minTop = -2650;
      newLeft = Math.min(maxLeft, Math.max(newLeft, minLeft));
      newTop = Math.min(maxTop, Math.max(newTop, minTop));

      zoomElement.style.left = `${newLeft}px`;
      zoomElement.style.top = `${newTop}px`;

      console.log('4번');
  }
}

  function handleWheel(e) {
    e.preventDefault();

    let scaleFactor = e.deltaY > 0 ? -0.5 : 0.5;
    scale += scaleFactor;
    scale = Math.min(4, Math.max(1, scale));

    zoomElement.style.transform = `scale(${scale})`;

    let newLeft = Math.min(0, Math.max(zoomElement.offsetLeft, container.offsetWidth - (zoomElement.offsetWidth * scale)));
    let newTop = Math.min(headerHeight, Math.max(zoomElement.offsetTop, container.offsetHeight - (zoomElement.offsetHeight * scale)));
    zoomElement.style.left = `${newLeft}px`;
    zoomElement.style.top = `${newTop}px`;

    currentScaleStep = scaleSteps.indexOf(scale) + 1;

    zoomElement.removeEventListener("mousedown", dragStep1);
    zoomElement.removeEventListener("mousedown", dragStep1_5);
    zoomElement.removeEventListener("mousedown", dragStep2);
    zoomElement.removeEventListener("mousedown", dragStep2_5);
    zoomElement.removeEventListener("mousedown", dragStep3);
    zoomElement.removeEventListener("mousedown", dragStep3_5);
    zoomElement.removeEventListener("mousedown", dragStep4);
    document.removeEventListener("mousemove", dragStep1);
    document.removeEventListener("mousemove", dragStep1_5);
    document.removeEventListener("mousemove", dragStep2);
    document.removeEventListener("mousemove", dragStep2_5);
    document.removeEventListener("mousemove", dragStep3);
    document.removeEventListener("mousemove", dragStep3_5);
    document.removeEventListener("mousemove", dragStep4);


    if (currentScaleStep === 1) {
        zoomElement.addEventListener("mousedown", dragStep1);
        document.addEventListener("mousemove", dragStep1);
    } else if (currentScaleStep === 2) {
        zoomElement.addEventListener("mousedown", dragStep1_5);
        document.addEventListener("mousemove", dragStep1_5);
    } else if (currentScaleStep === 3) {
      zoomElement.addEventListener("mousedown", dragStep2);
      document.addEventListener("mousemove", dragStep2);
    } else if (currentScaleStep === 4) {
      zoomElement.addEventListener("mousedown", dragStep2_5);
      document.addEventListener("mousemove", dragStep2_5);
    } else if (currentScaleStep === 5) {
      zoomElement.addEventListener("mousedown", dragStep3);
      document.addEventListener("mousemove", dragStep3);
    } else if (currentScaleStep === 6) {
      zoomElement.addEventListener("mousedown", dragStep3_5);
      document.addEventListener("mousemove", dragStep3_5);
    } else if (currentScaleStep === 7) {
      zoomElement.addEventListener("mousedown", dragStep4);
      document.addEventListener("mousemove", dragStep4);
    }
  }


  zoomElement.addEventListener("mousedown", dragStart);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("mousemove", dragStep1);
  container.addEventListener("wheel", handleWheel);


  zoomElement.style.cursor = "grab";
});
