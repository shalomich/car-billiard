import {
  IDisposable,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { Subscription, distinctUntilChanged, filter, tap } from 'rxjs';

import { Car } from './car';
import { TouchedGroundPointPublisher } from './touched-ground-point-publisher';
import { Ground } from './ground';
import { DestinationPoint } from './destination-point';

/** Class for car management. */
export class CarManager implements IDisposable {

  private readonly touchedGroundPointPublisher: TouchedGroundPointPublisher;

  private car: Car | null = null;

  private carMovementSubscription: Subscription | null = null;

  public constructor(
    private readonly ground: Ground,
    private readonly scene: Scene,
    ) {
      this.touchedGroundPointPublisher = new TouchedGroundPointPublisher(ground, scene);
  }
  
  public async initCar(): Promise<Car> {
    this.car = await Car.create(this.scene);
  
    this.setCarPosition(this.car);

    this.carMovementSubscription = this.subscribeToCarMovement(this.car);

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
    return this.touchedGroundPointPublisher.points$.pipe(
      filter(() => !car.isMoving()),
      distinctUntilChanged(
        (previous, current) =>
          previous.x === current.x &&
          previous.y === current.y &&
          current.z === previous.z
      ),
      tap(point => car.move(DestinationPoint.create(point, this.scene)))
    ).subscribe();
  }

  /** @inheritdoc */
  public dispose(): void {
    this.car?.dispose();
    this.carMovementSubscription?.unsubscribe();
  }
}
