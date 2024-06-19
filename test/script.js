document.addEventListener("DOMContentLoaded", function() {
    const cells = document.querySelectorAll(".grid-cell");

    cells.forEach(cell => {
        cell.addEventListener("mouseover", function() {
            // 현재 칸의 인덱스 계산
            const index = Array.from(cells).indexOf(cell);
            const numRows = 4;
            const numCols = 4;
            const row = Math.floor(index / numCols);
            const col = index % numCols;

            // 오른쪽 칸 hover 효과 추가
            const rightIndex = index + 1;
            if (col < numCols - 1) {
                cells[rightIndex].classList.add("hovered");
            }

            // 위쪽 칸 hover 효과 추가
            const aboveIndex = index - numCols;
            if (row > 0) {
                cells[aboveIndex].classList.add("hovered");
            }
        });

        cell.addEventListener("mouseout", function() {
            // 모든 칸에서 hovered 클래스 제거
            cells.forEach(cell => {
                cell.classList.remove("hovered");
            });
        });
    });

    const green = document.querySelector('.green');
    
});