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

    /* Toggle movement when square is clicked */
    draggableItem.addEventListener("click", (event) => {
        event.stopPropagation();
        isMoving = !isMoving;
    });

    /* Move square while active */
    gameContainer.addEventListener("mousemove", updatePosition);

    /* Stop movement when clicking container */
    gameContainer.addEventListener("click", () => {
        isMoving = false;
    });
});