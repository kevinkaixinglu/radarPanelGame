# Radar Run

![Gameplay Demo](./assets/radar-run-gameplay.gif)

**A responsive, browser-based arcade survival game built with vanilla JavaScript.**

## About
Radar Dodge is a precision survival game where players navigate a chaotic radar field. The objective is to pilot the player entity (yellow dot) and survive as long as possible while dodging autonomously moving enemy vehicles.

Unlike standard canvas games, this project relies entirely on **DOM manipulation** and **math-based responsive scaling**, ensuring the game physics remain consistent across any window size.

## Technical Implementation

### Custom Physics Engine
Instead of using a pre-built game library, I engineered the movement and collision logic from scratch:
* **Elastic Collisions:** Implemented 2D vector math to resolve vehicle-to-vehicle collisions. When two entities collide, the system calculates the angle of impact and reverses trajectories based on the dominant axis.
* **Spatial Separation:** Added logic to detect overlapping entities and force-separate them to prevent "sticking" glitches common in bounding-box physics.

### Responsive Coordinate System
To ensure the game is playable on any screen size without breaking the physics:
* **Relative Positioning:** All entity positions (`x`, `y`) are stored as percentages (0.0 - 1.0) rather than fixed pixels.
* **Dynamic Rendering:** On every frame (and window resize), the engine recalculates the pixel positions based on the current `getBoundingClientRect()` of the container. This makes the game fully scalable in real-time.

### Game State Management
The system uses a centralized state manager to handle:
* **Entity Pooling:** An array-based system to track active vehicles, vectors, and types.
* **Game Loop:** A custom interval-based loop running at ~60 FPS that handles position updates, collision checks, and rendering.
* **Dynamic Difficulty:** Random "Bomb" events spawn on timers, forcing user interaction and preventing passive camping strategies.

### Tech
Vanilla JavaScript, HTML5, CSS3. No frameworks or libraries.

##  How to Play
1.  **Setup:** Use the Left Panel to add enemies (UFOs, Rockets, Planes).
2.  **Start:** Press "Start Game" to activate the physics engine.
3.  **Survive:** Use **Arrow Keys** to move the yellow dot.
4.  **Defuse:** Click red bombs before they explode (2-second fuse).
5.  **Score:** Survival Time × Number of Enemies.

## Development Notes

*The sections below document the code architecture for educational purposes.*

### JS1 - Initial Build

Created a simplified radar simulation with:

- Radar panel with circular design (circles, cross, and X lines)
- Vehicle spawning system via modal selection
- Three vehicle types (UFO, rocket, plane) distinguished by color
- Diagonal movement with boundary bouncing
- Vehicle-to-vehicle collision detection
- Arrow key movement for player dot
- Fully responsive/scalable UI

### JS2 - Game Implementation

Expanded the simulation into a full game:

- **Scoring system** — Time alive × vehicle count
- **Bomb mechanic** — Random bombs spawn every 3-5 seconds; click to defuse within 2 seconds
- **Game over conditions** — Vehicle collision or bomb explosion
- **Restart functionality** — Preserves vehicle setup between rounds
- **Clear vehicles** — Reset button to remove all vehicles

---

## Architecture

### Inheritance (CSS)

- `font-family` in body inherited by all text elements unless overridden
- Text color defaults from body to child elements
- `.radar` and `.lines-container` inherit layout properties from `.panel`
- Buttons inherit browser defaults unless explicitly styled

### Aggregation Hierarchy

```
document
├── modal (vehicle selection)
│   ├── ufoButton
│   ├── rocketButton
│   └── planeButton
├── panel
│   ├── left-controls
│   │   ├── addVehicle
│   │   └── clearVehicles
│   ├── radar
│   │   ├── vehicles[]
│   │   ├── playerDot
│   │   └── bombs[]
│   └── right-controls
│       └── startGameButton
└── gameOverModal
    ├── finalScore
    └── restartButton
```

### Key Functions

| Function | Responsibility |
|----------|----------------|
| `createVehicle()` | Spawns vehicle, adds to array, updates positions |
| `startGame()` | Initializes game loop, timer, and bomb system |
| `handleCollisions()` | Boundary and vehicle-to-vehicle collision detection |
| `checkDotCollision()` | Player collision detection, triggers game over |
| `addBomb()` | Spawns timed bomb at random position |
| `endGame()` | Clears intervals, stops movement, shows score |

### Information Hiding

| Module | Hidden Details |
|--------|----------------|
| `vehicles[]` | Internal direction, dimensions; exposed via `createVehicle()` |
| Collision logic | Distance calculations hidden in `handleCollisions()` |
| Radar scaling | Dimension calculations hidden in `updateVehiclePositions()` |
| Bomb system | Spawn timing and position hidden in `addBomb()` / `startBombs()` |