document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    // If canvas doesn't exist, stop right away.
    if (!canvas) {
        console.error("Error: Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');
    const levelCounter = document.getElementById('level-counter');

    // --- GAME CONFIGURATION ---
    canvas.width = 400;
    canvas.height = 400;
    const cellSize = 20;
    const cols = canvas.width / cellSize;
    const rows = canvas.height / cellSize;

    // --- GAME STATE ---
    let grid; 
    let player;
    let goal;
    let currentLevel = 1;

    function setupNewLevel() {
        grid = [];
        const stack = []; 

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({ x, y, walls: [true, true, true, true], visited: false });
            }
        }

        player = { x: 0, y: 0 };
        goal = { x: cols - 1, y: rows - 1 };
        let currentCell = grid[0];
        currentCell.visited = true;

        while (true) {
            const neighbors = [];
            const { x, y } = currentCell;

            const top = y > 0 && grid[(y - 1) * cols + x];
            const right = x < cols - 1 && grid[y * cols + (x + 1)];
            const bottom = y < rows - 1 && grid[(y + 1) * cols + x];
            const left = x > 0 && grid[y * cols + (x - 1)];

            if (top && !top.visited) neighbors.push(top);
            if (right && !right.visited) neighbors.push(right);
            if (bottom && !bottom.visited) neighbors.push(bottom);
            if (left && !left.visited) neighbors.push(left);

            if (neighbors.length > 0) {
                const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(currentCell);

                const dx = currentCell.x - nextCell.x;
                const dy = currentCell.y - nextCell.y;
                if (dx === 1) { currentCell.walls[3] = false; nextCell.walls[1] = false; } 
                else if (dx === -1) { currentCell.walls[1] = false; nextCell.walls[3] = false; }
                if (dy === 1) { currentCell.walls[0] = false; nextCell.walls[2] = false; } 
                else if (dy === -1) { currentCell.walls[2] = false; nextCell.walls[0] = false; }

                currentCell = nextCell;
                currentCell.visited = true;
            } else if (stack.length > 0) {
                currentCell = stack.pop();
            } else {
                break; 
            }
        }
        drawGame();
    }

    function drawGame() {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        for (const cell of grid) {
            const x = cell.x * cellSize;
            const y = cell.y * cellSize;
            if (cell.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
            if (cell.walls[1]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
            if (cell.walls[2]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
            if (cell.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); ctx.stroke(); }
        }

        ctx.fillStyle = 'rgba(255, 0, 150, 0.7)';
        ctx.fillRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);

        ctx.fillStyle = '#39ff14';
        ctx.fillRect(player.x * cellSize + cellSize / 4, player.y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
    }

    // This is the most reliable way to listen for key presses.
    window.addEventListener('keydown', (e) => {
        // *** DEBUGGING STEP ***: This will log to your browser's console.
        console.log('Key pressed:', e.key); 

        // We only care about arrow keys.
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
        }

        // Stop the browser from scrolling with the arrow keys.
        e.preventDefault();

        const currentCell = grid[player.y * cols + player.x];
        let moved = false;

        switch (e.key) {
            case 'ArrowUp':
                if (!currentCell.walls[0]) { player.y--; moved = true; }
                break;
            case 'ArrowDown':
                if (!currentCell.walls[2]) { player.y++; moved = true; }
                break;
            case 'ArrowLeft':
                if (!currentCell.walls[3]) { player.x--; moved = true; }
                break;
            case 'ArrowRight':
                if (!currentCell.walls[1]) { player.x++; moved = true; }
                break;
        }

        if (moved) {
            drawGame();
            if (player.x === goal.x && player.y === goal.y) {
                currentLevel++;
                levelCounter.textContent = currentLevel;
                setupNewLevel(); 
            }
        }
    });


    setupNewLevel();
});
