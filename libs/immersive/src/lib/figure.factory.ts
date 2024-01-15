import { GroundMesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Vector3 } from '@babylonjs/core';
import { GameConfiguration } from './game-configuration';

export const minFigureCount = 1;
export const maxFigureCount = 5;

export namespace FiguresFactory {

    const figureSize = 1;
    
    export function create(configuration: GameConfiguration, groundMesh: GroundMesh, scene: Scene): void {
        createFigure(configuration.cubeCount, createCube, groundMesh, scene);
        createFigure(configuration.cylinderCount, createCylinder, groundMesh, scene);
        createFigure(configuration.sphereCount, createSphere, groundMesh, scene);
    }

    function createFigure(
        figureCount: number, 
        figureFactoryMethod: (groundMesh: GroundMesh, scene: Scene) => void,
        groundMesh: GroundMesh, 
        scene: Scene) {
        if (figureCount < minFigureCount) {
            figureCount = minFigureCount;
        }

        if (figureCount > maxFigureCount) {
            figureCount = maxFigureCount;
        }

        for (let i = 0; i < figureCount; i++) {
            figureFactoryMethod(groundMesh, scene);
        }
    }

    function createCube(groundMesh: GroundMesh, scene: Scene): void {
        const cube = MeshBuilder.CreateBox('cube', { size: figureSize }, scene);
        cube.position = getRandomGroundPoint(groundMesh);
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.BOX,
          { mass: 1, friction: 0.5, restitution: 0 },
          scene
        );
    }

    function createCylinder(groundMesh: GroundMesh, scene: Scene): void {
        const cube = MeshBuilder.CreateCylinder('сylinder', { 
            height: figureSize, 
            diameter: figureSize 
        }, scene);

        cube.position = getRandomGroundPoint(groundMesh);
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.CYLINDER,
          { mass: 1, friction: 0.5, restitution: 0 },
          scene
        );
    }

    function createSphere(groundMesh: GroundMesh, scene: Scene): void {
        const cube = MeshBuilder.CreateSphere('sphere', { diameter: figureSize }, scene);
        cube.position = getRandomGroundPoint(groundMesh);
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.SPHERE,
          { mass: 1, friction: 0.5, restitution: 0 },
          scene
        );
    }

    function getRandomGroundPoint(groundMesh: GroundMesh) {
        const { x: groundX, z: groundZ } = groundMesh.position;
        const { _width: groundWidth, _height: groundHeight } = groundMesh;

        const minX = groundX - groundWidth / 2 + figureSize;
        const maxX = groundX + groundWidth / 2 - figureSize;
        const minZ = groundZ - groundHeight / 2 + figureSize;
        const maxZ = groundZ + groundHeight / 2 - figureSize;
        
        return new Vector3(
            generateRandomNumber(minX, maxX), 
            groundMesh.position.y + 1, 
            generateRandomNumber(minZ, maxZ)
        );
    }

    function generateRandomNumber(min: number, max: number): number {
        const randomNumberAsString = (Math.random() * (max - min) + min).toFixed(3);

        return parseFloat(randomNumberAsString);
    };
}
