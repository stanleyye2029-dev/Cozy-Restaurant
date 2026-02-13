document.addEventListener("DOMContentLoaded", () => {
    const draggableItem = document.getElementById("draggable-item");
    const gameContainer = document.getElementById("game-container");

    let isMoving = false;

    function updatePosition(event) {
        if (!isMoving) return;

        const containerRect = gameContainer.getBoundingClientRect();

        const newX =
            event.clientX -
            containerRect.left -
            draggableItem.offsetWidth / 2;

        const newY =
            event.clientY -
            containerRect.top -
            draggableItem.offsetHeight / 2;

        draggableItem.style.left = `${newX}px`;
        draggableItem.style.top = `${newY}px`;
    }

    /* Prevent browser's native image dragging which interferes with custom drag */
    draggableItem.addEventListener('dragstart', (e) => e.preventDefault());

    /* -------------------------------
       Pixel-perfect hit testing
       - Draw the displayed image into an offscreen canvas
       - On container clicks, check the clicked pixel's alpha
       - If alpha > 0 treat it as a click on the bowl; otherwise ignore
       - If getImageData is blocked by CORS, fall back to bounding-box click
    ------------------------------- */
    const hitCanvas = document.createElement('canvas');
    const hitCtx = hitCanvas.getContext('2d');
    // Precomputed visible columns (image-space) and top-most visible Y
    let visibleColumns = [];
    let topVisibleY = 0;

    function updateHitCanvas() {
        const w = Math.max(1, draggableItem.clientWidth);
        const h = Math.max(1, draggableItem.clientHeight);
        hitCanvas.width = w;
        hitCanvas.height = h;
        try {
            hitCtx.clearRect(0, 0, w, h);
            hitCtx.drawImage(draggableItem, 0, 0, w, h);
            // Precompute visible columns and top-most visible pixel
            visibleColumns.length = 0;
            topVisibleY = h; // large initial
            try {
                const imgData = hitCtx.getImageData(0, 0, w, h).data;
                for (let px = 0; px < w; px++) {
                    let colHas = false;
                    for (let py = 0; py < h; py++) {
                        const idx = (py * w + px) * 4 + 3; // alpha index
                        const a = imgData[idx];
                        if (a > 0) {
                            colHas = true;
                            if (py < topVisibleY) topVisibleY = py;
                            break;
                        }
                    }
                    if (colHas) visibleColumns.push(px);
                }
            } catch (err) {
                // getImageData may fail if canvas is tainted; leave visibleColumns empty
                visibleColumns.length = 0;
                topVisibleY = 0;
            }
        } catch (e) {
            // drawing may fail if image is not ready or cross-origin; ignore
        }
    }

    if (draggableItem.complete) updateHitCanvas();
    draggableItem.addEventListener('load', updateHitCanvas);
    window.addEventListener('resize', updateHitCanvas);

    /* Use container click to decide whether click was on visible pixel */
    gameContainer.addEventListener('click', (event) => {
        const containerRect = gameContainer.getBoundingClientRect();

        const clickX = event.clientX - containerRect.left;
        const clickY = event.clientY - containerRect.top;

        const imgLeft = draggableItem.offsetLeft;
        const imgTop = draggableItem.offsetTop;

        const x = Math.floor(clickX - imgLeft);
        const y = Math.floor(clickY - imgTop);

        const insideBox =
            x >= 0 && y >= 0 && x < draggableItem.clientWidth && y < draggableItem.clientHeight;

        if (!insideBox) {
            isMoving = false;
            return;
        }

        // Try pixel test; if it fails (CORS/tainted canvas) fall back to bounding-box
        try {
            const pixel = hitCtx.getImageData(x, y, 1, 1).data; // [r,g,b,a]
            const alpha = pixel[3];
            if (alpha > 0) {
                event.stopImmediatePropagation();
                isMoving = !isMoving;
                return;
            }
            // clicked a transparent pixel
            isMoving = false;
        } catch (e) {
            // If getImageData is blocked, use bounding-box behavior
            event.stopImmediatePropagation();
            isMoving = !isMoving;
        }
    });

    /* Move square while active */
    gameContainer.addEventListener("mousemove", updatePosition);

    /* (Removed unconditional container click handler to avoid
       immediately cancelling toggles from pixel-hit tests) */

    /* -------------------------------
       Steam particle spawner
       - Spawns a small steam PNG above the bowl
       - Random X within bowl left/right on spawn
       - Animates up and fades over 3s (CSS) then removed
    ------------------------------- */
    const STEAM_SRC = '../../../assets/steam-effect-pixilart.png';
    // Particle size range (px)
    const STEAM_WIDTH_MIN = 36;
    const STEAM_WIDTH_MAX = 64;

    function spawnSteam() {
        if (!document.body.contains(draggableItem)) return;

        const bowlRect = draggableItem.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        // Pick a random size first so we can center correctly
        const size = Math.round(STEAM_WIDTH_MIN + Math.random() * (STEAM_WIDTH_MAX - STEAM_WIDTH_MIN));

        // Pick a random X above a visible pixel column when available
        let spawnX;
        if (visibleColumns.length > 0) {
            const col = visibleColumns[Math.floor(Math.random() * visibleColumns.length)];
            // col is in image-space; convert to container-space
            const scaleX = bowlRect.width / Math.max(1, hitCanvas.width);
            const xInContainer = bowlRect.left - containerRect.left + col * scaleX + (scaleX / 2);
            spawnX = xInContainer - size / 2;
        } else {
            const r = Math.random();
            spawnX = bowlRect.left - containerRect.left + r * bowlRect.width - size / 2;
        }

        // Spawn 40px above the bowl's visible top when available
        let spawnY;
        if (typeof topVisibleY === 'number' && topVisibleY > 0) {
            const scaleY = bowlRect.height / Math.max(1, hitCanvas.height);
            const topInContainer = bowlRect.top - containerRect.top + topVisibleY * scaleY;
            spawnY = topInContainer - 40;
        } else {
            spawnY = bowlRect.top - containerRect.top - 40;
        }

        const steam = document.createElement('img');
        steam.src = STEAM_SRC;
        steam.className = 'steam';
        steam.style.left = `${Math.round(spawnX)}px`;
        steam.style.top = `${Math.round(spawnY)}px`;
        steam.style.width = `${size}px`;

        gameContainer.appendChild(steam);

        // Remove after animation (3s) + small buffer
        setTimeout(() => {
            steam.remove();
        }, 3100);
    }

    // Spawn continuously every 450-900ms (randomized)
    let steamTimer = null;
    function startSteam() {
        if (steamTimer) return;
        function scheduleNext() {
            // Faster spawn: ~150-350ms between spawns
            const delay = 150 + Math.random() * 200;
            steamTimer = setTimeout(() => {
                spawnSteam();
                scheduleNext();
            }, delay);
        }
        scheduleNext();
    }

    function stopSteam() {
        if (steamTimer) {
            clearTimeout(steamTimer);
            steamTimer = null;
        }
    }

    // Start steam by default
    startSteam();

    // Clean up on page unload
    window.addEventListener('beforeunload', stopSteam);
});