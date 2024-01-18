import { AbstractMesh, Animation, IDisposable, Scene, TransformNode, Vector3 } from '@babylonjs/core';

import { VectorUtils } from './vector.utils';
import { DestinationPoint } from './destination-point';
import { Figure } from './figure';
import { Ground } from './ground';

/** Card. */
export class Car implements IDisposable {
  private readonly mass = 5 as const;

  private readonly acceleration = 50 as const;

  public static readonly id = 'car' as const;

  public constructor(
    public readonly mesh: AbstractMesh,
    private readonly ground: Ground,
    private readonly scene: Scene
  ) {
    this.addCollisions();
  }
  
  /**
   * Move to destination.
   * @param destinationPoint - Destination point.
   */
  public move(destinationPoint: DestinationPoint): void {
    this.scene.beginDirectAnimation(
      this.mesh,
      [this.getTurnAnimation(destinationPoint)],
      0, 30, false, 1,
      () => this.transferTo(destinationPoint)
    );
  }

  public static isCar(node: TransformNode): node is AbstractMesh {
    return node.id === Car.id;
  }

  private getTurnAnimation(destinationPoint: DestinationPoint): Animation {
    const { position } = this.mesh;

    const axisBeginning = new Vector3(position.x, position.y, position.z + 1);

    const angle = VectorUtils.calculateAngleInRadians(
      axisBeginning,
      destinationPoint.mesh.position,
      this.mesh.position
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
        value: this.mesh.rotation.y,
      },
      {
        frame: 30,
        value: position.x < destinationPoint.mesh.position.x ? angle : -angle,
      },
    ]);

    return turnAnimation;
  }

  private transferTo(destinationPoint: DestinationPoint): void {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }
  
    const force = this.mass * this.acceleration;
    const forceVector = VectorUtils.getDirectionalVector(
      this.mesh.position,
      destinationPoint.mesh.position
    ).scale(force);
    
    carBody.applyForce(forceVector, this.mesh.position);
  }

  private addCollisions(): void {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    carBody.setCollisionCallbackEnabled(true);
    
    const collisionObserver = carBody.getCollisionObservable().add((event) => {
      const collidedNode = event.collidedAgainst.transformNode;
      
      if (Figure.isFigure(collidedNode)) {
        this.collideFigure(new Figure(collidedNode, this.ground));
      }

      if (DestinationPoint.isDestinationPoint(collidedNode)) {
        this.collideDestinationPoint();
      }
    });
  }

  private collideDestinationPoint() {
    DestinationPoint.instance?.cancel();
    this.stop();
  }

  private collideFigure(figure: Figure) {
    DestinationPoint.instance?.cancel();
  
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    const impulse = carBody.getLinearVelocity()
      .scale(carBody.getMassProperties().mass ?? 0);

    this.stop();
    
    figure.push(impulse);
  }

  private stop(): void {
    this.mesh.physicsBody?.setLinearVelocity(Vector3.Zero());
    this.mesh.physicsBody?.setAngularVelocity(Vector3.Zero());
  }

  /** @inheritdoc */
  public dispose(): void {
    this.mesh.dispose();
  }
}
