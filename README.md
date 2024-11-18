# radarPanelGame

JS1:

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

JS2:

For this iteration of my simulation, I actually turned it into a working game. 
Before, you were just able to add vehicles to the screen and begin their animation
and move the yellow dot. Now, there are actually rules to the game and the player 
can play. Users can start by adding however many vehicles they want to the screen. 
They can choose from 3 vehicle options: the ufo, rocket, and plane. They are 
differentiated by their color of the circle. Once they are ready, they can press 
the start game button which begins the animation of the vehicles. The player 
must dodge the vehicles by using their arrow keys. Additionally, every 3-5 seconds, 
a red bomb will randomly appear on the radar and the user has to click the bomb 
within 2 seconds before it explodes and ends the game. The player’s score is 
calculated by multiplying the time in seconds they were alive for and the number
of vehicles on the screen. The game ends if any bomb explodes, or they collide 
with a vehicle. They can restart the game and the vehicles they chose stay there. 
However, they can also clear the vehicles from the radar with the button on the 
left panel. The instructions of the game are also in the pop up from the How To 
Play button at the bottom. With it being a modified version of the Java game I 
made, I turned the vehicle icons into minimal circles with their colors differentiating 
their types instead of the more realistic graphics. The movement of all the vehicles 
are now diagonal. However, they are also differentiated by the direction they start 
moving in. Their movement and collisions are now more realistic with mirrored collisions. 
The zoom feature was taken out due to it not making too much sense in the context 
of the game. The arrow buttons were also taken out and movement is only made from 
arrow key inputs. Other unnecessary panel buttons were taken out, putting focus 
on the purpose of the game. The addition of the ticking bombs feature was made 
that adds an extra challenge to the game. The game state panel now has both the 
time and the number of vehicles, and the score calculation was changed from just 
being the time alive to the time alive times the number of vehicles on the screen, 
encouraging different types of play styles to achieve the highest score possible. 
The visuals were also made much cleaner.

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
panel
    - Contains the left controls, radar, right controls, and game state panel
    as well as respective modals
left-controls
    - Contains the addVehicle and resetVehicles buttons and their
    functionalities
right-controls
    - Contains the start game button
modalWindow
    - Contains all the buttons for adding respective vehicles
radar
    - Houses all the vehicles and the player dot
    - Also contains the bombs 
gameOverModal
    - Contains the reset button and score calculation

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
checkDotCollition():
    - Checks whether there is collision between dot and any vehicle and 
    calls endGame()
modal, endGameModal
    - there are checks for mouse picking to check whether mouse click is outside
    of it and closes it
startGame()
    - creates interval for animations and timer
    - calls checkDotCollision for game end 
    - calls handleCollisions() 
    - updates all vehicle positions at the end
startGameButton
    - calls startGame() and startBombs() to start the bomb creations 
restartButton
    - resets the score and timer on game panels and bomb timers
endGame()
    - clears intervals
    - stop vehicle movement

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
Bombs
    - The bomb creation position is hidden in the addBomb() function
    - The bomb timers are also hidden within the startBombs() function
    
