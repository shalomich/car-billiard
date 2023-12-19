import { AbstractMesh, Animation, Scene, Vector3 } from '@babylonjs/core';

import { VectorUtils } from './vector.utils';
import { DestinationPoint } from './destination-point';

/** Card. */
export class Car {
  private readonly mass = 5 as const;

  private readonly acceleration = 50 as const;

  public constructor(
    private readonly carMesh: AbstractMesh,
    private readonly scene: Scene
  ) {}

  /**
   * Move to destination.
   * @param destinationPoint - Destination point.
   */
  public move(destinationPoint: DestinationPoint): void {
    this.scene.beginDirectAnimation(
      this.carMesh,
      [this.getTurnAnimation(destinationPoint)],
      0,
      30,
      false,
      1,
      () => this.transferTo(destinationPoint)
    );
  }

  private getTurnAnimation(destinationPoint: DestinationPoint): Animation {
    const { position } = this.carMesh;

    const axisBeginning = new Vector3(position.x, position.y, position.z + 1);

    const angle = VectorUtils.calculateAngleInRadians(
      axisBeginning,
      destinationPoint.position,
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
        value: position.x < destinationPoint.position.x ? angle : -angle,
      },
    ]);

    return turnAnimation;
  }

  private transferTo(destinationPoint: DestinationPoint): void {
    const force = this.mass * this.acceleration;
    const forceVector = VectorUtils.getDirectionalVector(
      this.carMesh.position,
      destinationPoint.position
    ).scale(force);
    const carBody = this.carMesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    carBody.setCollisionCallbackEnabled(true);
    carBody.applyForce(forceVector, this.carMesh.position);

    const collisionObserver = carBody.getCollisionObservable().add((event) => {
      if (event.collidedAgainst.transformNode.id !== DestinationPoint.meshId) {
        return;
      }

      this.stop(destinationPoint);
      carBody.getCollisionObservable().remove(collisionObserver);
    });
  }

  private stop(destinationPoint: DestinationPoint): void {
    this.carMesh.physicsBody?.setLinearVelocity(Vector3.Zero());
    this.carMesh.physicsBody?.setAngularVelocity(Vector3.Zero());
    destinationPoint.dispose();
  }
}
