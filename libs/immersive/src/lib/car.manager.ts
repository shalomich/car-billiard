import {
  IDisposable,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { Subscription, tap } from 'rxjs';

import { Car } from './car';
import { DestinationPointPublisher } from './destination-point-publisher';
import { Ground } from './ground';
import { Figure } from './figure';
import { DestinationPoint } from './destination-point';

/** Class for car management. */
export class CarManager implements IDisposable {

  private readonly destinationPointPubsliher: DestinationPointPublisher;

  private car: Car | null = null;

  private carMovementSubscription: Subscription | null = null;

  private carCollisionsSubscription: Subscription | null = null;
  
  public constructor(
    private readonly ground: Ground,
    private readonly scene: Scene,
    ) {
      this.destinationPointPubsliher = new DestinationPointPublisher(ground, scene);
  }
  
  public async initCar(): Promise<Car> {
    this.car = await Car.create(this.scene);
  
    this.setCarPosition(this.car);

    this.carMovementSubscription = this.subscribeToCarMovement(this.car);
    this.carCollisionsSubscription = this.subscribeToCarCollisions(this.car);

    return this.car;
  }

  private setCarPosition(car: Car): void {
    const groundMeshPosition = this.ground.mesh.position; 
    
    car.mesh.position = new Vector3(
      groundMeshPosition.x,
      groundMeshPosition.y + car.mesh.scaling.y / 2,
      groundMeshPosition.z
    );
  }

  private subscribeToCarMovement(car: Car): Subscription {
    return this.destinationPointPubsliher.destinationPoints$.pipe(
      tap(destinationPoint => car.move(destinationPoint))
    ).subscribe();
  }

  private subscribeToCarCollisions(car: Car): Subscription {
      return car.collisions$.pipe(
        tap(collidedObject => this.resolveCollisionForCar(car, collidedObject))
      ).subscribe();
  }

  private resolveCollisionForCar(car: Car, collidedObject: Figure | DestinationPoint) {
    DestinationPoint.instance?.cancel();

    if (this.isFigureCollided(collidedObject)) {
      car.pushFigure(collidedObject);
    }

    car.stop();
  }

  private isFigureCollided(collidedObject: Figure | DestinationPoint): collidedObject is Figure {
    return (collidedObject as Figure).move !== undefined;
  }

  /** @inheritdoc */
  public dispose(): void {
    this.car?.dispose();
    this.carMovementSubscription?.unsubscribe();
    this.carCollisionsSubscription?.unsubscribe();
  }
}
