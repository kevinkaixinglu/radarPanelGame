/*
File: js.js
Author: Kevin Lu
Created: 11/9/24
Description: The JavaScript file that enables all the user interaction of 
adding vehicles, moving the player dot, starting the game, and resizing.
Dependencies: None
*/

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

let posX = 0;
let posY = 0;
let gameInterval; 
let timerInterval;
const dia = dot.offsetWidth;
let gameStarted = false;

//Array to track vehicles and their relative positions
let vehicles = [];

let bombTimeouts = [];

let time = 0;

let count = 0;

//Creating random coordinates for vehicle spawns
function getRandomPosition() {
    const randomX = Math.random(); 
    const randomY = Math.random(); 
    return { x: randomX, y: randomY };
}

//Fucntion creating the vehicles 
function createVehicle(vehicleType) {
    const { x, y } = getRandomPosition();
    const vehicle = document.createElement('div');

    // Adding the appropriate class for UFO, Rocket, or Plane
    vehicle.classList.add(vehicleType);

    // Save relative positions, directions, type, and element in the vehicles array
    vehicles.push({
        element: vehicle,
        relativeX: x,
        relativeY: y,
        directionX: Math.random() > 0.5 ? 0.005 : -0.005, 
        directionY: Math.random() > 0.5 ? 0.005 : -0.005,
        type: vehicleType,
        moving: gameStarted, // Flag to track if the vehicle should move
    });

    // Add the vehicle to the radar
    radar.appendChild(vehicle);

    // Update the vehicle's position based on the radar size
    updateVehiclePositions();
}

//Function to update the positions for animation and resizing
function updateVehiclePositions() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;

    //Using the smaller of the radar width and height for the circular aspect of vehicles
    const circleDiameter = Math.min(radarWidth, radarHeight);

    vehicles.forEach(({ element, relativeX, relativeY }) => {
        const absoluteX = relativeX * radarWidth;
        const absoluteY = relativeY * radarHeight;

        //Appling styles with the aspect ratio enforced to maintain circular vehicles
        element.style.width = `${circleDiameter * 0.04}px`; 
        element.style.height = `${circleDiameter * 0.04}px`;
        element.style.left = `${absoluteX - circleDiameter * 0.02}px`; 
        element.style.top = `${absoluteY - circleDiameter * 0.02}px`; 
    });
}

//Event listeners for each vehicle button
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

//Collision detection and handling
function handleCollisions() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const circleDiameter = Math.min(radarWidth, radarHeight);
    const radius = circleDiameter * 0.03; 


    //Correctly adjusting for the full vehicle radius in boundary collision checks
    vehicles.forEach((vehicle) => {
        const radiusX = radius / radarWidth; 
        const radiusY = radius / radarHeight; 
    
        //Left boundary
        if (vehicle.relativeX <= radiusX) {
            vehicle.directionX *= -1; 
        }
        //Right boundary
        if (vehicle.relativeX >= 1) {
            vehicle.directionX *= -1;    
        }
    
        //Top boundary
        if (vehicle.relativeY <= radiusY) {
            vehicle.directionY *= -1; 
        }
        //Bottom boundary
        if (vehicle.relativeY >= 1) {
            vehicle.directionY *= -1;  
        }
    });
    

    // Vehicle collisions
for (let i = 0; i < vehicles.length; i++) {
    for (let j = i + 1; j < vehicles.length; j++) {
        const v1 = vehicles[i];
        const v2 = vehicles[j];

        // Calculate the distance between two vehicles
        const dx = (v1.relativeX - v2.relativeX) * radarWidth;
        const dy = (v1.relativeY - v2.relativeY) * radarHeight;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check for collision (distance is less than the combined radius)
        if (distance < radius * 2) {
            // Determine bounce directions based on current movement
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal collision: reverse horizontal directions
                v1.directionX *= -1;
                v2.directionX *= -1;
            } else {
                // Vertical collision: reverse vertical directions
                v1.directionY *= -1;
                v2.directionY *= -1;
            }

            // Slightly separate the vehicles to prevent sticking/glitching
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

function checkDotCollision() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const dotSize = Math.min(radarWidth, radarHeight) * 0.03;
    const dotRadius = dotSize / 2;
    const dotCenterX = posX + radarWidth / 2;
    const dotCenterY = posY + radarHeight / 2;

    const collisionBuffer = 3;

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
            endGame(); // Call endGame instead of just showing modal
            return true;
        }
    }

    return false;
}

//Get speed as a percentage of the radar size
function getSpeed() {
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;
    const circleDiameter = Math.min(radarWidth, radarHeight); 
    return circleDiameter * 0.05 ; 
}

//Function to update vehicle position
function updateDotPosition() {

    //Getting the current boundaries of the radar
    const radarRect = radar.getBoundingClientRect();
    const radarWidth = radarRect.width;
    const radarHeight = radarRect.height;

    //Calculating the boundaries for the dot to stay within
    const dotSize = Math.min(radarWidth, radarHeight) * 0.03;
    const minX = -radarWidth / 2 + dotSize / 2;
    const maxX = radarWidth / 2 - dotSize / 2;
    const minY = -radarHeight / 2 + dotSize / 2;
    const maxY = radarHeight / 2 - dotSize / 2;

    //Constraining position within boundaries
    posX = Math.max(minX, Math.min(maxX, posX));
    posY = Math.max(minY, Math.min(maxY, posY));

    //Updating dot position and size and enforcing 1 to 1 ratio
    dot.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;
    dot.style.width = `${dotSize}px`;
    dot.style.height = `${dotSize}px`;
}

// Function to close the modal
function closeModal() {
    modal.style.display = "none";
}



// Event listener for the Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Event listener for clicks outside the modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === howToPlayModal) {
        howToPlayModal.style.display = "none";
    }
});


function triggerButtonClick(button) {
    button.click();
}

//Moving the dot with arrow keys
function handleKeyDown(e) {
    
    const k = e.key.toLowerCase();
    if (gameOverModal.style.display === "flex") {
        if (k == 'r') {
            restartButton.click();
        }
    }
    
    if (modal.style.display === "block") {
        // Modal controls should always work regardless of game state
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
    } 

    else {
        // Only handle movement and game controls if the game hasn't ended
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

        // These controls should work even if the game hasn't started
        switch (k) {
            case 'a':
                if (gameOverModal.style.display == "none") {
                    document.getElementById('addVehicle').click();
                }

                break;
            case ' ':
                if (!gameStarted) {  // Only allow starting if game hasn't started
                    document.getElementById('startGameButton').click();
                }
                break;
        }
    }
    
    // Prevent page scrolling
    e.preventDefault();
}

//Function to start game from button
function startGame() {
    // Stop any existing game interval to avoid duplicates
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    // Set gameStarted to true so vehicles start moving
    gameStarted = true;


    timerInterval = setInterval(() => {
        time++;
        document.getElementById('timeDisplay').textContent = time;
    }, 1000);
        

    // Ensure all vehicles are set to move
    vehicles.forEach((vehicle) => {
        vehicle.moving = true; // Update the moving flag for all vehicles
    });

    // Starting a new interval to update vehicle positions
    gameInterval = setInterval(() => {
        // Check if the dot collides with any vehicle
        if (checkDotCollision()) {
            clearInterval(gameInterval); // Stop the game interval
            endGame();
            
            return; // Exit the game loop
        }

        // Move vehicles if they should
        vehicles.forEach((vehicle) => {
            if (vehicle.moving) {
                // Calculate new positions
                vehicle.relativeX += vehicle.directionX;
                vehicle.relativeY += vehicle.directionY;
            }
        });

        // Handling collisions (including boundary checks)
        handleCollisions();

        // Updating vehicle positions on the screen
        updateVehiclePositions();
    }, 16); // 60 FPS (16ms)
}


//Connecting startGame function to the start game button
startGameButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame(); 
        startBombs(); 
    }
});

//Updating boundaries and vehicle positions if window is resized
window.addEventListener('resize', () => {
    updateDotPosition();
    updateVehiclePositions();
});

function addBomb() {
    if (!gameStarted) return;  // Don't add bombs if game is over

    const bomb = document.createElement('div');
    
    bomb.classList.add('bomb');


    const radarRect = radar.getBoundingClientRect();
    const bombDiameter = 30;
    const randomX = Math.random() * (radarRect.width - bombDiameter);
    const randomY = Math.random() * (radarRect.height - bombDiameter);

    bomb.style.position = 'absolute';
    bomb.style.width = `${bombDiameter}px`;
    bomb.style.height = `${bombDiameter}px`;
    bomb.style.backgroundColor = 'red';
    bomb.style.borderRadius = '50%';
    bomb.style.left = `${randomX}px`;
    bomb.style.top = `${randomY}px`;

    radar.appendChild(bomb);

    bomb.addEventListener('click', () => {
        if (gameStarted) {  // Only remove bomb if game is still active
            radar.removeChild(bomb);
        }
    });

    setTimeout(() => {
        if (radar.contains(bomb)) {
            endGame();
            radar.removeChild(bomb);
        }
    }, 2000);
}

//Function to start generating bombs at random intervals
function startBombs() {
    function scheduleNextBomb() {
        const delay = Math.random() * 2000 + 3000; 
        const timeout = setTimeout(() => {
            if (gameStarted) {  // Only add bomb if game is still active
                addBomb();
                scheduleNextBomb();
            }
        }, delay);
        bombTimeouts.push(timeout);  // Store the timeout ID
    }
    scheduleNextBomb(); 
}

function showGameOverModal() {
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = "flex";
}

//Reloading the page to restart the game
restartButton.onclick = () => {
    
    posX = 0;
    posY = 0;
    updateDotPosition(); // Update the dot's position

    // Reset the game-over modal visibility
    gameOverModal.style.display = "none"; 
    resetGame();

};

function endGame() {
    // Stop the game loop
    clearInterval(gameInterval);
    stopTimer();
    gameStarted = false;

    // Stop all vehicles from moving
    vehicles.forEach((vehicle) => {
        vehicle.moving = false;
    });

    // Clear all bomb timeouts
    bombTimeouts.forEach(timeout => clearTimeout(timeout));
    bombTimeouts = [];  // Reset the timeouts array

    // Remove any existing bombs from the radar
    const bombs = document.querySelectorAll('.bomb');
    bombs.forEach(bomb => radar.removeChild(bomb));

    // Show the game over modal
    document.getElementById('finalScore').textContent = time * count;
    showGameOverModal();

}

clearVehicles.onclick = function () {
    resetVehicles();
};

function resetVehicles() {
    // Remove each vehicle's element from the radar
    vehicles.forEach(({ element }) => {
        radar.removeChild(element);
    });

    // Clear the vehicles array
    vehicles.length = 0;

    // Clear any pending bomb timeouts
    bombTimeouts.forEach((timeout) => clearTimeout(timeout));
    bombTimeouts.length = 0;
    document.getElementById('numVehs').textContent = 0;
}


document.addEventListener('keydown', handleKeyDown);

function stopTimer() {
    // Stop the interval using clearInterval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null; // Clear the interval ID to avoid accidental reuse
    }
}

function resetGame() {
    clearInterval(timerInterval);
    document.getElementById('timeDisplay').textContent = 0;
}

howToPlay.onclick = function () {
    howToPlayModal.style.display = "flex";
};