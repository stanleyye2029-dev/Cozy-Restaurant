function clearTransition() {
    const transitionScreen = document.getElementById('transition-screen');
    transitionScreen.classList.add('clear');
    setTimeout(() => {
        transitionScreen.style.display = 'none';
    }, 2500);
}

/*----------CANVAS GAME IMPLEMENTATION----------*/
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const WORLD_LEFT = -1000;
const WORLD_RIGHT = 1000;
const WORLD_WIDTH = WORLD_RIGHT - WORLD_LEFT;
const CHARACTER_WIDTH = 40;
const CHARACTER_HEIGHT = 40;
const CHARACTER_SPEED = 5;

// Dynamic values that update on resize
let WORLD_HEIGHT = window.innerHeight;
let FLOOR_HEIGHT = WORLD_HEIGHT * 0.2;

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Update dynamic world dimensions
    WORLD_HEIGHT = window.innerHeight;
    FLOOR_HEIGHT = window.innerHeight * 0.2;
    
    // Update character position to stay on floor
    character.y = WORLD_HEIGHT - FLOOR_HEIGHT - CHARACTER_HEIGHT;
    
    // Update kitchen object positions
    updateKitchenObjectPositions();
}

// Function to update kitchen object Y positions based on world height
function updateKitchenObjectPositions() {
    for (let obj of kitchenObjects) {
        // Recalculate Y position based on floor
        if (obj.color === 'red') {
            obj.y = WORLD_HEIGHT - FLOOR_HEIGHT - 100; // stove
        } else if (obj.color === 'cyan') {
            obj.y = WORLD_HEIGHT - FLOOR_HEIGHT - 80; // sink
        } else if (obj.color === 'lightblue') {
            obj.y = WORLD_HEIGHT - FLOOR_HEIGHT - 120; // fridge
        } else if (obj.color === 'brown') {
            obj.y = WORLD_HEIGHT - FLOOR_HEIGHT - 100; // storage
        }
    }
}

// Kitchen objects (for reference, not collision for now)
const kitchenObjects = [
    { x: 300, y: WORLD_HEIGHT - FLOOR_HEIGHT - 100, width: 100, height: 100, color: 'red' }, // stove
    { x: 500, y: WORLD_HEIGHT - FLOOR_HEIGHT - 80, width: 80, height: 80, color: 'cyan' }, // sink
    { x: 700, y: WORLD_HEIGHT - FLOOR_HEIGHT - 120, width: 80, height: 120, color: 'lightblue' }, // fridge
    { x: 950, y: WORLD_HEIGHT - FLOOR_HEIGHT - 100, width: 100, height: 100, color: 'brown' } // storage
];

// Character object
const character = {
    x: 0,
    y: WORLD_HEIGHT - FLOOR_HEIGHT - CHARACTER_HEIGHT,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    vx: 0,
    vy: 0
};

// Camera
const camera = {
    x: 0,
    y: 0
};

// Debug toggle
let showDebug = false;

// Initialize canvas and set up resize listener
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Toggle debug on Alt key
    if (e.key === 'Alt') {
        showDebug = !showDebug;
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update function
function update() {
    // Handle input
    if (keys['ArrowLeft'] || keys['a']) {
        character.vx = -CHARACTER_SPEED;
    } else if (keys['ArrowRight'] || keys['d']) {
        character.vx = CHARACTER_SPEED;
    } else {
        character.vx = 0;
    }

    // Update character position
    character.x += character.vx;

    // Wall collision (left and right boundaries)
    if (character.x < WORLD_LEFT) {
        character.x = WORLD_LEFT;
    }
    if (character.x + character.width > WORLD_RIGHT) {
        character.x = WORLD_RIGHT - character.width;
    }

    // Update camera to follow character
    const targetCameraX = character.x - (canvas.width / 2) + (character.width / 2);
    camera.x = Math.max(WORLD_LEFT, Math.min(targetCameraX, WORLD_RIGHT - canvas.width));
}

// Draw function
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgb(150, 150, 200)'; // Sky color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply camera offset
    ctx.translate(-camera.x, 0);

    // Draw rainbow gradient background
    const gradient = ctx.createLinearGradient(WORLD_LEFT, 0, WORLD_RIGHT, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.17, 'orange');
    gradient.addColorStop(0.33, 'yellow');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(0.67, 'blue');
    gradient.addColorStop(0.83, 'indigo');
    gradient.addColorStop(1, 'violet');
    ctx.fillStyle = gradient;
    ctx.fillRect(WORLD_LEFT, 0, WORLD_WIDTH, WORLD_HEIGHT - FLOOR_HEIGHT);

    // Draw floor
    ctx.fillStyle = 'rgb(120, 60, 20)';
    ctx.fillRect(WORLD_LEFT, WORLD_HEIGHT - FLOOR_HEIGHT, WORLD_WIDTH, FLOOR_HEIGHT);

    // Draw kitchen objects
    for (let obj of kitchenObjects) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        // Draw border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }

    // Draw character
    ctx.fillStyle = 'blue';
    ctx.fillRect(character.x, character.y, character.width, character.height);
    // Draw border
    ctx.strokeStyle = 'darkblue';
    ctx.lineWidth = 2;
    ctx.strokeRect(character.x, character.y, character.width, character.height);

    // Restore context state
    ctx.restore();

    // Draw debug UI (only if enabled)
    if (showDebug) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Char X: ${Math.floor(character.x)}, Camera X: ${Math.floor(camera.x)}`, 10, 20);
        ctx.fillText(`World: ${WORLD_LEFT} to ${WORLD_RIGHT}`, 10, 40);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
window.addEventListener('load', () => {
    gameLoop();
});