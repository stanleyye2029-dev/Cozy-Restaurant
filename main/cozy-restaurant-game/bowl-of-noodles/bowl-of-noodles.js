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

    function updateHitCanvas() {
        const w = Math.max(1, draggableItem.clientWidth);
        const h = Math.max(1, draggableItem.clientHeight);
        hitCanvas.width = w;
        hitCanvas.height = h;
        try {
            hitCtx.clearRect(0, 0, w, h);
            hitCtx.drawImage(draggableItem, 0, 0, w, h);
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
});