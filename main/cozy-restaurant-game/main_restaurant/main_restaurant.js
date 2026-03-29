function clearTransition() {
    const transitionScreen = document.getElementById('transition-screen');
    transitionScreen.classList.add('clear');
    setTimeout(() => {
        transitionScreen.style.display = 'none';
    }, 5000); // Match the CSS transition duration
}

/*----------CHARACTER MOVEMENT AND CAMERA CONTROL----------*/
const character = document.getElementById('character-sprite');
const restaurant = document.getElementById('restaurant');
const gameContainer = document.getElementById('game-container');

const BUFFER = 100; // Distance from edge before locking scroll
let characterX = null; // Will be set after page loads
let characterY = null; // Will be set after page loads
const characterSpeed = 5; // Pixels per frame
const keys = {}; // Track which keys are pressed

// Initialize character position to center of screen on page load
window.addEventListener('load', () => {
    // Wait a frame for layout to settle
    setTimeout(() => {
        const restaurantWidth = restaurant.scrollWidth;
        const viewportWidth = window.innerWidth;
        
        // Spawn at visual center of viewport, not center of restaurant
        characterX = (viewportWidth / 2) - (character.offsetWidth / 2);
        characterY = (restaurant.offsetHeight * 0.8) - character.offsetHeight;
        
        // Set initial position
        character.style.left = characterX + 'px';
        character.style.top = characterY + 'px';
        restaurant.scrollLeft = 0;
    }, 0);
});

// Update character position based on keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game loop
function gameLoop() {
    // Handle character movement (left/right only for now)
    if (keys['ArrowLeft'] || keys['a']) {
        characterX -= characterSpeed;
    }
    if (keys['ArrowRight'] || keys['d']) {
        characterX += characterSpeed;
    }

    // Clamp character position to world bounds, not viewport
    const viewportWidth = window.innerWidth;
    const restaurantWidth = restaurant.scrollWidth;
    
    characterX = Math.max(0, Math.min(characterX, restaurantWidth - character.offsetWidth));

    // Update character visual position
    character.style.left = characterX + 'px';
    character.style.top = characterY + 'px';

    // Smart camera: keep character centered on screen, but lock at edges
    const maxScroll = restaurantWidth - viewportWidth;
    
    // Calculate scroll to center the character on screen
    const desiredScroll = characterX - (viewportWidth / 2) + (character.offsetWidth / 2);
    
    // Clamp scroll to valid range
    const newScroll = Math.max(0, Math.min(desiredScroll, maxScroll));
    restaurant.scrollLeft = newScroll;

    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();