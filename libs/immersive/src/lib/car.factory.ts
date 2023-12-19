import {
  Geometry,
  GroundMesh,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  SceneLoader,
  Vector3,
} from '@babylonjs/core';
import { Subscription } from 'rxjs';

import { Car } from './car';
import { DestinationPointPublisher } from './destination-point-publisher';

/** Car creating result. */
export interface CarCreatingResult {
  /** Car. */
  readonly car: Car;

  /** Dispose car. */
  readonly disposeCar: () => void;
}

/** Car import result. */
interface CarImportResult {
  /** Car mesh. */
  readonly mesh: Mesh;

  /** Car geomentry. */
  readonly geometry: Geometry;
}

/** Class for creation car. */
export namespace CarFactory {
  /**
   * Create car.
   * @param scene - Scene.
   * @param groundMesh - Ground mesh.
   */
  export async function create(
    scene: Scene,
    groundMesh: GroundMesh
  ): Promise<CarCreatingResult> {
    const { mesh: carMesh, geometry: carGeometry } = await importCarMesh(scene);

    addPhysics(carMesh, carGeometry, scene);
    addRotation(carMesh);
    addPosition(carMesh, groundMesh);

    const car = new Car(carMesh, scene);

    const movementSubscription = addMovementSubscription(
      car,
      scene,
      groundMesh
    );

    const disposeCar = (): void => movementSubscription.unsubscribe();

    return { car, disposeCar };
  }

  /**
   * Import car mesh.
   * @param scene - Scene.
   */
  async function importCarMesh(scene: Scene): Promise<CarImportResult> {
    const importResult = await SceneLoader.ImportMeshAsync(
      null,
      'assets/',
      'car.glb',
      scene
    );

    const mesh = importResult.meshes[0] as Mesh;
    mesh.id = 'car';
    const geometry = importResult.geometries[0];

    return {
      mesh,
      geometry,
    };
  }

  /**
   * Add physics to car mesh.
   * @param carMesh - Car mesh.
   * @param carMeshGeometry - Car mesh geometry.
   * @param scene - Scene.
   */
  function addPhysics(
    carMesh: Mesh,
    carMeshGeometry: Geometry,
    scene: Scene
  ): void {
    carMeshGeometry.applyToMesh(carMesh);

    const carAggregate = new PhysicsAggregate(
      carMesh,
      PhysicsShapeType.MESH,
      { mass: 5, friction: 0 },
      scene
    );

    /** To have possibility to change position and rotation. */
    carAggregate.body.disablePreStep = false;
  }

  /**
   * Add car position.
   * @param carMesh - Car mesh.
   * @param groundMesh - Ground mesh.
   */
  function addPosition(carMesh: Mesh, groundMesh: GroundMesh): void {
    carMesh.position = new Vector3(
      groundMesh.position.x,
      groundMesh.position.y + carMesh.scaling.y / 2,
      groundMesh.position.z
    );
  }

  /**
   * Add car rotation.
   * @param carMesh - Car mesh.
   */
  function addRotation(carMesh: Mesh): void {
    carMesh.rotationQuaternion = null;
    carMesh.rotation = new Vector3(0, 0, 0);
  }

  /**
   * Add movement subscription.
   * @param scene - Scene.
   * @param car - Car.
   * @param groundMesh - Ground mesh.
   */
  function addMovementSubscription(
    car: Car,
    scene: Scene,
    groundMesh: GroundMesh
  ): Subscription {
    const destinationPointPublisher = new DestinationPointPublisher(
      scene,
      groundMesh
    );

    return destinationPointPublisher.destinationPoints$.subscribe(
      (destinationPoint) => car.move(destinationPoint)
    );
  }
}
