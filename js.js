/*
 * Radar Dodge - Game Logic
 * Author: Kevin Lu
 * Created: 11/9/24
 * 
 * A browser-based arcade game where players navigate a radar field,
 * dodging enemy vehicles and defusing bombs before they explode.
 */

// ===================
// DOM Element References
// ===================

const ufoButton = document.getElementById('ufoButton');
const rocketButton = document.getElementById('rocketButton');
const planeButton = document.getElementById('planeButton');
const modal = document.getElementById('modalWindow');
const gameOverModal = document.getElementById('gameOverModal');
const dot = document.getElementById('movingDot');
const radar = document.querySelector('.radar');
const startGameButton = document.getElementById('startGameButton');
const restartButton = document.getElementById('restartButton');
const clearVehicles = document.getElementById('clearVehicles');
const howToPlayModal = document.getElementById('howToPlayModal');

// ===================
// Game State Variables
// ===================

let posX = 0;                    // Player X position (relative to center)
let posY = 0;                    // Player Y position (relative to center)
let gameInterval;                // Main game loop interval
let timerInterval;               // Score timer interval
const dia = dot.offsetWidth;     // Player dot diameter
let gameStarted = false;         // Whether game is currently active
let vehicles = [];               // Array of all vehicle objects
let bombTimeouts = [];           // Active bomb timeout IDs (for cleanup)
let time = 0;                    // Survival time in seconds
let count = 0;                   // Number of vehicles on screen

// ===================
// Vehicle Management
// ===================

/*
 * Generates random spawn coordinates for a new vehicle
 * Returns values between 0-1 representing percentage of radar dimensions
 */
function getRandomPosition() {
    const randomX = Math.random();
    const randomY = Math.random();
    return { x: randomX, y: randomY };
}

/*
 * Creates a new vehicle of the specified type and adds it to the game
 * Vehicles spawn at random positions with random diagonal movement directions
 * 
 * @param {string} vehicleType - 'ufo', 'rocket', or 'plane'
 */
function createVehicle(vehicleType) {
    const { x, y } = getRandomPosition();
    const vehicle = document.createElement('div');

    vehicle.classList.add(vehicleType);

    // Store vehicle data with relative positioning (0-1 range)
    // This allows proper scaling when the window is resized
    vehicles.push({
        element: vehicle,
        relativeX: x,
        relativeY: y,
        directionX: Math.random() > 0.5 ? 0.005 : -0.005,  // Random horizontal direction
        directionY: Math.random() > 0.5 ? 0.005 : -0.005,  // Random vertical direction
        type: vehicleType,
        moving: gameStarted,
    });

    radar.appendChild(vehicle);
    updateVehiclePositions();
}

/*
 * Updates all vehicle positions and sizes based on current radar dimensions
 * Called on every frame and when the window is resized
 */
function updateVehiclePositions() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;

    // Use smaller dimension to maintain circular aspect ratio
    const circleDiameter = Math.min(radarWidth, radarHeight);

    vehicles.forEach(({ element, relativeX, relativeY }) => {
        const absoluteX = relativeX * radarWidth;
        const absoluteY = relativeY * radarHeight;

        // Size vehicles as 4% of the radar, centered on their position
        element.style.width = `${circleDiameter * 0.04}px`;
        element.style.height = `${circleDiameter * 0.04}px`;
        element.style.left = `${absoluteX - circleDiameter * 0.02}px`;
        element.style.top = `${absoluteY - circleDiameter * 0.02}px`;
    });
}

/*
 * Removes all vehicles from the game and resets the count
 */
function resetVehicles() {
    vehicles.forEach(({ element }) => {
        radar.removeChild(element);
    });

    vehicles.length = 0;
    bombTimeouts.forEach((timeout) => clearTimeout(timeout));
    bombTimeouts.length = 0;
    count = 0;
    document.getElementById('numVehs').textContent = 0;
}

// ===================
// Collision Detection
// ===================

/*
 * Handles all collision detection and response:
 * - Vehicle-to-boundary collisions (bounce off walls)
 * - Vehicle-to-vehicle collisions (elastic collision response)
 */
function handleCollisions() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const circleDiameter = Math.min(radarWidth, radarHeight);
    const radius = circleDiameter * 0.03;

    // Boundary collision: reverse direction when hitting radar edges
    vehicles.forEach((vehicle) => {
        const radiusX = radius / radarWidth;
        const radiusY = radius / radarHeight;

        if (vehicle.relativeX <= radiusX || vehicle.relativeX >= 1) {
            vehicle.directionX *= -1;
        }
        if (vehicle.relativeY <= radiusY || vehicle.relativeY >= 1) {
            vehicle.directionY *= -1;
        }
    });

    // Vehicle-to-vehicle collision detection
    for (let i = 0; i < vehicles.length; i++) {
        for (let j = i + 1; j < vehicles.length; j++) {
            const v1 = vehicles[i];
            const v2 = vehicles[j];

            // Calculate distance between vehicle centers
            const dx = (v1.relativeX - v2.relativeX) * radarWidth;
            const dy = (v1.relativeY - v2.relativeY) * radarHeight;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision occurs when distance < combined radii
            if (distance < radius * 2) {

                // Elastic collision: reverse velocity based on collision axis
                // If |dx| > |dy|, collision is more horizontal, reverse X
                // Otherwise collision is more vertical, reverse Y
                if (Math.abs(dx) > Math.abs(dy)) {
                    v1.directionX *= -1;
                    v2.directionX *= -1;
                } else {
                    v1.directionY *= -1;
                    v2.directionY *= -1;
                }

                // Separate overlapping vehicles to prevent sticking
                const overlap = radius * 2 - distance;
                const separationX = (dx / distance) * overlap / 2;
                const separationY = (dy / distance) * overlap / 2;

                v1.relativeX += separationX / radarWidth;
                v1.relativeY += separationY / radarHeight;
                v2.relativeX -= separationX / radarWidth;
                v2.relativeY -= separationY / radarHeight;
            }
        }
    }
}

/*
 * Checks if the player dot has collided with any vehicle
 * Uses circle-to-circle collision detection with a small buffer
 * to make the game slightly more forgiving
 * 
 * @returns {boolean} True if collision detected, false otherwise
 */
function checkDotCollision() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const dotSize = Math.min(radarWidth, radarHeight) * 0.03;
    const dotRadius = dotSize / 2;
    const dotCenterX = posX + radarWidth / 2;
    const dotCenterY = posY + radarHeight / 2;

    const collisionBuffer = 3;  // Pixels of forgiveness

    for (let vehicle of vehicles) {
        const vehicleRect = vehicle.element.getBoundingClientRect();
        const vehicleWidth = vehicleRect.width;
        const vehicleHeight = vehicleRect.height;
        const vehicleCenterX = vehicle.relativeX * radarWidth;
        const vehicleCenterY = vehicle.relativeY * radarHeight;
        const vehicleRadius = Math.min(vehicleWidth, vehicleHeight) / 2;

        const dx = dotCenterX - vehicleCenterX;
        const dy = dotCenterY - vehicleCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < dotRadius + vehicleRadius - collisionBuffer) {
            endGame();
            return true;
        }
    }

    return false;
}

// ===================
// Player Movement
// ===================

/*
 * Calculates player movement speed as a percentage of radar size
 * This ensures consistent feel across different screen sizes
 */
function getSpeed() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const circleDiameter = Math.min(radarWidth, radarHeight);
    return circleDiameter * 0.05;
}

/*
 * Updates the player dot's position and size
 * Constrains movement to stay within radar boundaries
 */
function updateDotPosition() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;

    // Calculate movement boundaries (accounting for dot size)
    const dotSize = Math.min(radarWidth, radarHeight) * 0.03;
    const minX = -radarWidth / 2 + dotSize / 2;
    const maxX = radarWidth / 2 - dotSize / 2;
    const minY = -radarHeight / 2 + dotSize / 2;
    const maxY = radarHeight / 2 - dotSize / 2;

    // Clamp position within boundaries
    posX = Math.max(minX, Math.min(maxX, posX));
    posY = Math.max(minY, Math.min(maxY, posY));

    // Apply position and maintain 1:1 aspect ratio
    dot.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;
    dot.style.width = `${dotSize}px`;
    dot.style.height = `${dotSize}px`;
}

/*
 * Handles all keyboard input for game controls
 * 
 * Game controls:
 *   Arrow keys - Move player
 *   Space - Start game
 *   A - Add vehicle menu
 *   R - Restart (when game over)
 * 
 * Menu controls:
 *   1/2/3 - Select UFO/Rocket/Plane
 *   Escape - Close modal
 */
function handleKeyDown(e) {
    const k = e.key.toLowerCase();

    // Game over screen: R to restart
    if (gameOverModal.style.display === "flex") {
        if (k === 'r') {
            restartButton.click();
        }
    }

    // Vehicle selection modal: number keys to select
    if (modal.style.display === "block") {
        switch (k) {
            case '1':
                ufoButton.click();
                break;
            case '2':
                rocketButton.click();
                break;
            case '3':
                planeButton.click();
                break;
        }
    } else {
        // In-game movement (only when game is active)
        if (gameStarted) {
            const currentSpeed = getSpeed();

            switch (e.key) {
                case 'ArrowUp':
                    posY -= currentSpeed;
                    break;
                case 'ArrowDown':
                    posY += currentSpeed;
                    break;
                case 'ArrowLeft':
                    posX -= currentSpeed;
                    break;
                case 'ArrowRight':
                    posX += currentSpeed;
                    break;
            }
            updateDotPosition();
        }

        // Menu controls (available before game starts)
        switch (k) {
            case 'a':
                if (gameOverModal.style.display === "none") {
                    document.getElementById('addVehicle').click();
                }
                break;
            case ' ':
                if (!gameStarted) {
                    document.getElementById('startGameButton').click();
                }
                break;
        }
    }

    e.preventDefault();  // Prevent page scrolling
}

// ===================
// Bomb System
// ===================

/*
 * Spawns a bomb at a random position on the radar
 * Bombs must be clicked within 2 seconds or the game ends
 */
function addBomb() {
    if (!gameStarted) return;

    const bomb = document.createElement('div');
    bomb.classList.add('bomb');

    const radarRect = radar.getBoundingClientRect();
    const bombDiameter = 30;
    const randomX = Math.random() * (radarRect.width - bombDiameter);
    const randomY = Math.random() * (radarRect.height - bombDiameter);

    bomb.style.position = 'absolute';
    bomb.style.width = `${bombDiameter}px`;
    bomb.style.height = `${bombDiameter}px`;
    bomb.style.borderRadius = '50%';
    bomb.style.left = `${randomX}px`;
    bomb.style.top = `${randomY}px`;

    radar.appendChild(bomb);

    // Defuse bomb on click
    bomb.addEventListener('click', () => {
        if (gameStarted) {
            radar.removeChild(bomb);
        }
    });

    // Bomb explodes after 2 seconds if not defused
    setTimeout(() => {
        if (radar.contains(bomb)) {
            endGame();
            radar.removeChild(bomb);
        }
    }, 2000);
}

/*
 * Starts the bomb spawning system
 * Bombs spawn at random intervals between 3-5 seconds
 */
function startBombs() {
    function scheduleNextBomb() {
        const delay = Math.random() * 2000 + 3000;  // 3000-5000ms
        const timeout = setTimeout(() => {
            if (gameStarted) {
                addBomb();
                scheduleNextBomb();
            }
        }, delay);
        bombTimeouts.push(timeout);
    }
    scheduleNextBomb();
}

// ===================
// Game State Management
// ===================

/*
 * Starts the game loop
 * Activates vehicle movement, collision detection, and the timer
 */
function startGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameStarted = true;

    // Start survival timer
    timerInterval = setInterval(() => {
        time++;
        document.getElementById('timeDisplay').textContent = time;
    }, 1000);

    // Activate all vehicles
    vehicles.forEach((vehicle) => {
        vehicle.moving = true;
    });

    // Main game loop (60 FPS)
    gameInterval = setInterval(() => {
        if (checkDotCollision()) {
            clearInterval(gameInterval);
            endGame();
            return;
        }

        // Update vehicle positions
        vehicles.forEach((vehicle) => {
            if (vehicle.moving) {
                vehicle.relativeX += vehicle.directionX;
                vehicle.relativeY += vehicle.directionY;
            }
        });

        handleCollisions();
        updateVehiclePositions();
    }, 16);  // ~60 FPS
}

/*
 * Ends the current game session
 * Stops all movement, clears bombs, and displays the game over screen
 */
function endGame() {
    clearInterval(gameInterval);
    stopTimer();
    gameStarted = false;

    // Stop all vehicles
    vehicles.forEach((vehicle) => {
        vehicle.moving = false;
    });

    // Clear all bomb timers and remove existing bombs
    bombTimeouts.forEach(timeout => clearTimeout(timeout));
    bombTimeouts = [];

    const bombs = document.querySelectorAll('.bomb');
    bombs.forEach(bomb => radar.removeChild(bomb));

    // Calculate and display final score
    document.getElementById('finalScore').textContent = time * count;
    showGameOverModal();
}

/*
 * Resets the game state for a new round
 * Preserves vehicles but resets position, score, and timer
 */
function resetGame() {
    clearInterval(timerInterval);
    time = 0;
    document.getElementById('timeDisplay').textContent = 0;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function showGameOverModal() {
    gameOverModal.style.display = "flex";
}

// ===================
// Modal Management
// ===================

function closeModal() {
    modal.style.display = "none";
}

// ===================
// Event Listeners
// ===================

// Vehicle selection buttons
ufoButton.onclick = function () {
    modal.style.display = "none";
    createVehicle('ufo');
    count++;
    document.getElementById('numVehs').textContent = count;
};

rocketButton.onclick = function () {
    modal.style.display = "none";
    createVehicle('rocket');
    count++;
    document.getElementById('numVehs').textContent = count;
};

planeButton.onclick = function () {
    modal.style.display = "none";
    createVehicle('plane');
    count++;
    document.getElementById('numVehs').textContent = count;
};

addVehicle.onclick = function () {
    modal.style.display = "block";
};

clearVehicles.onclick = function () {
    resetVehicles();
};

// Game control buttons
startGameButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
        startBombs();
    }
});

restartButton.onclick = () => {
    posX = 0;
    posY = 0;
    updateDotPosition();
    gameOverModal.style.display = "none";
    resetGame();
};

howToPlay.onclick = function () {
    howToPlayModal.style.display = "flex";
};

// Keyboard input
document.addEventListener('keydown', handleKeyDown);

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modals by clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === howToPlayModal) {
        howToPlayModal.style.display = "none";
    }
});

// Responsive scaling on window resize
window.addEventListener('resize', () => {
    updateDotPosition();
    updateVehiclePositions();
});
