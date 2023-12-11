"use strict";

const matterContainer = document.querySelector("#matter-container"),
{ Engine, Render, World, Bodies, Constraint, Mouse, MouseConstraint, Events, Body } = Matter;
const engine = Engine.create(),
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
        wireframes: false,
        fillStyle: 'green'
    }
});

matterContainer.appendChild(canvas);
Engine.run(engine);
Render.run(render);

// Create golf ball
const ball = Bodies.circle(100, 100, 10, { 
    restitution: 0.8,
    fillStyle: "#578453"
}), // Create golf hole
hole = Matter.Bodies.circle(700, 500, 11, { isStatic: true });

Matter.World.add(world, [ball, hole]);

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

// Create a constraint to hold the ball until mouse release
var mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

let counter = -1;

// Mouse up event listener
Events.on(mouseConstraint, "mouseup", (event) => {
    if (Body.getSpeed(ball) == 0) {
        // Calculate the force based on the mouse movement
        const force = {
            x: event.mouse.position.x - ball.position.x,
            y: event.mouse.position.y - ball.position.y
        };

        World.add(engine.world, ball);

        // Apply the force to the ball
        Body.applyForce(ball, ball.position, { x: -force.x * 0.000018, y: -force.y * 0.000018 });
    }
});

Matter.World.add(world, mouseConstraint);
render.mouse = mouse;

Events.on(engine, 'afterUpdate', function() {
    if (Body.getSpeed(ball) <= 0.01) {
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
    }
    // Block anything from leaving the canvas by changing velocity direction
    const existingForce = Body.getVelocity(ball);

    if ((ball.position.x < 0 && existingForce.x <= 0) || (ball.position.x > 1000 && existingForce.x >= 0)) {
        Matter.Body.setVelocity(ball, { x: -existingForce.x, y: existingForce.y });
    } else if ((ball.position.y < 0 && existingForce.y <= 0) || (ball.position.y > 600 && existingForce.y >= 0)) {
        Matter.Body.setVelocity(ball, { x: existingForce.x, y: -existingForce.y });
    } else if (ball.position.y < -40 || ball.position.y > 640 || ball.position.x < -40 || ball.position.x > 1040) {
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        ball.position.x = 100;
        ball.position.y = 100;
    }
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        const bodyA = collision.bodyA;
        const bodyB = collision.bodyB;

        // Check if one of the bodies is the ball and the other is the hole
        if ((bodyA === ball && bodyB === hole) || (bodyA === hole && bodyB === ball)) {
            // Remove the ball from the world
            World.remove(engine.world, ball);
            hole.render.fillStyle = "#FFF"
            // You may also add other logic here, such as updating the score or resetting the level.
        }
    });
});
