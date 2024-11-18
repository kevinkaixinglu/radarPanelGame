# radarPanelGame

For the JS1 Assignment, I created a simplified version of my previous final 
project. In this assignment, I created the radar panel with the radar graphic 
in the middle. The radar includes the the circles, cross, and x lines to create
the radar design. There is a button the left side that allows the user to add
a vehicle. A modal pops up where they can specify the type of vehicle to add
to the screen. The vehicles are all circles but are distinguished by color.
Once a vehicle is picked the modal dissapears and the vehicle is added to 
a random part of the screen. They can add however many vehicles they want.
They can then proceed to press the "Start Game" button on the right side in 
order to begin the animation of the vehicles. They all have respective 
starting directions they begin to move in all in one of the 4 diagonal 
directions. The vehicles bounce off of the radar boundaries and each other.
There is a yellow dot in the middle that signifies the player vehicle. 
The user can use the arrow keys to move the player vehicle. In theory, the
idea of the game is to dodge the other vehicles with each second of survival
being a point, like the final version I created in Java. All elements of the
program are scalable to the correct extent, meaning that the window can be 
resized and all elements will shift and resize as intended. The game is 
technicaly runnable on mobile devices, however, one must connect an external
keyboard to play. Future potential iterations will include arrow buttons on 
screen so users can better play on mobile devices.

"Inheritance"
    - font-family in body is inherited by all text elements like h1 and footer and buttons unless overridden.
    - Text color defaults from body to child elements unless explicitly defined 
    - Text elements like h1 inherit line-height and spacing-related properties from parent rules unless overridden.
    - Child elements like .radar and .lines-container inherit layout properties defined in parent containers like .panel.
    - Nested elements like .horizontal-line and .vertical-line inherit relative positioning from .radar.
    - Buttons inherit default browser padding, borders, and alignment from HTML button defaults unless styled explicitly with CSS
    - .left-controls button inherits from global button styles, but overrides for width, aspect ratio, and background color apply.
    - Elements like .big-circle and .small-circle inherit positioning and proportional scaling rules from .radar.

Aggregation Hierarchy
document:
    -  Contains elements like ufoButton, rocketButton, planeButton, modal, radar, startGameButton, and dot.
vehicles (Array):
    - Contains objects representing individual vehicles.
    - relativeX and relativeY for positions relative to the radar.
    - directionX and directionY for movement directions.
    - type represents the vehicle type 

Uses/Collaboration Relationships
createVehicle(vehicleType):
    - Creates vehicle and appends it to radar.
    - Adds the vehicle's properties to the vehicles array.
    - Calls updateVehiclePositions().
startGame():
    - Starts an interval to update vehicle positions and handle collisions.
    - Calls handleCollisions() and updateVehiclePositions() on each tick.
handleCollisions():
    - Checks for overlaps between vehicle positions.
    - Updates directions and adjusts relative positions on collision.
Button interactions (onclick):
    - startGameButton: Starts the game logic.
    - addVehicle: Opens the modal.
        - ufoButton, rocketButton, planeButton create specific vehicle types.
window.addEventListener('resize'):
    - Updates radar dimensions and vehicle positions when the window size changes.

Information Hiding
Vehicles (vehicles array):
    - The internal properties like directions or dimensions are hidden from other parts of the program.
    - Interactions exposed only via createVehicle() and updateVehiclePositions().
Collision Logic:
    - The details of distance calculations and direction reversal are hidden within handleCollisions().
Radar Scaling:
    - The logic for scaling vehicle dimensions and positions based on radar size is hidden within updateVehiclePositions().
Button Event Listeners:
    - The behavior triggered by clicking buttons  is contained within respective event listeners.
    
