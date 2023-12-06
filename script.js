"use strict"

const matterContainer = document.querySelector("#matter-container");
const engine = Matter.Engine.create(),
     world = engine.world;
engine.world.gravity.y = 0;

// Create canvas and renderer
const canvas = document.createElement('canvas'),
render = Matter.Render.create({
    element: matterContainer,
    engine: engine,
    canvas: canvas,
    options: {
        width: 1000,
        height: 600,
        wireframes: false
    }
});
matterContainer.appendChild(canvas);
Matter.Render.run(render);

// Create golf ball
const ball = Matter.Bodies.circle(100, 100, 15, { 
    restitution: 0.8
});
Matter.World.add(world, [ball]);

// Create golf hole
const hole = Matter.Bodies.circle(700, 500, 15, { isStatic: true });
Matter.World.add(world, [hole]);

function wall(x, y, width, height) {
    return Matter.Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        render: {
            fillStyle: '#000'
        },

    });
}

Matter.World.add(engine.world, [
    wall(0, 500, 20, 1000), // left
    wall(500, 0, 1000, 20 ), // top
    wall(1000, 500, 20, 1000 ), // right
    wall(500, 600, 1000, 20 ) // bottom
]);

//Create a constraint to hold the ball until mouse release
var mouse = Matter.Mouse.create(render.canvas),
    mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

Matter.World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// Variable to track mouse release
let isMouseReleased = false, maxForce = 70;

// Mouse up event listener
Matter.Events.on(mouseConstraint, "mouseup", function (event) {
    isMouseReleased = true;
    // Calculate the force based on the mouse movement
    const force = {
        x: event.mouse.position.x - ball.position.x,
        y: event.mouse.position.y - ball.position.y
    };
    x = force.x > maxForce ? force.x = maxForce : force.x = force.x;
    y = force.y > maxForce ? force.y = maxForce : force.y = force.y;
    // Apply the force to the ball
    Matter.Body.applyForce(ball, ball.position, { x: -force.x * 0.0004, y: -force.y * 0.0004 });
});

// Run the engine
Matter.Engine.run(engine);