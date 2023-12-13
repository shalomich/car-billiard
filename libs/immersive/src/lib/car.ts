import {
  AbstractMesh,
  Animation,
  IDisposable,
  Scene,
  Vector3,
} from '@babylonjs/core';
import {
  Observable,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs';

import { VectorUtils } from './vector.utils';

/** Card. */
export class Car implements IDisposable {
  private readonly movementSubscription: Subscription;

  public constructor(
    private readonly carMesh: AbstractMesh,
    private readonly scene: Scene,
    private movement$: Observable<Vector3>
  ) {
    this.initCarRotation();
    this.movementSubscription = this.subscribeToMovement();
  }

  private move(destination: Vector3): void {
    this.scene.beginDirectAnimation(
      this.carMesh,
      [this.getTurnAnimation(destination)],
      0,
      30,
      false,
      1,
      () => {
        this.scene.beginDirectAnimation(
          this.carMesh,
          [this.getTransferAnimation(destination)],
          0,
          30,
          false
        );
      }
    );
  }

  private getTurnAnimation(destination: Vector3): Animation {
    const { position } = this.carMesh;

    const axisBeginning = new Vector3(position.x, position.y, position.z - 1);

    const angle = VectorUtils.calculateAngleInRadians(
      axisBeginning,
      destination,
      this.carMesh.position
    );

    const turnAnimation = new Animation(
      'turnAnimation',
      'rotation.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    turnAnimation.setKeys([
      {
        frame: 0,
        value: this.carMesh.rotation.y,
      },
      {
        frame: 30,
        value: position.x > destination.x ? angle : -angle,
      },
    ]);

    return turnAnimation;
  }

  private getTransferAnimation(destination: Vector3): Animation {
    const adaptivedDestination = new Vector3(
      destination.x,
      this.carMesh.position.y,
      destination.z
    );

    const transferAnimation = new Animation(
      'transferAnimation',
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    transferAnimation.setKeys([
      {
        frame: 0,
        value: this.carMesh.position,
      },
      {
        frame: 30,
        value: adaptivedDestination,
      },
    ]);

    return transferAnimation;
  }

  private subscribeToMovement(): Subscription {
    return this.movement$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(
          (previous, current) =>
            previous.x === current.x &&
            previous.y === current.y &&
            current.z === previous.z
        ),
        tap((point) => (point.y = this.carMesh.position.y))
      )
      .subscribe((destination) => this.move(destination));
  }

  private initCarRotation(): void {
    this.carMesh.rotationQuaternion = null;
    this.carMesh.rotation = new Vector3(0, 0, 0);
  }

  /** @inheritdoc */
  public dispose(): void {
    this.movementSubscription.unsubscribe();
  }
}
