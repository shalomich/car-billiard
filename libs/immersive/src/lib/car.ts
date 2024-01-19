import { AbstractMesh, Animation, IDisposable, IPhysicsCollisionEvent, Mesh, Observer, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, TransformNode, Vector3 } from '@babylonjs/core';

import { VectorUtils } from './vector.utils';
import { DestinationPoint } from './destination-point';
import { Figure } from './figure';
import { Observable } from 'rxjs';

/** Card. */
export class Car implements IDisposable {
  private readonly mass = 5 as const;
  private readonly acceleration = 50 as const;

  private static readonly id = 'car' as const;

  public readonly collisions$: Observable<Figure | DestinationPoint>;

  public constructor(
    public readonly mesh: AbstractMesh,
    private readonly scene: Scene
  ) {
    this.collisions$ = this.getCollisionsStream();
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

  public stop(): void {
    this.mesh.physicsBody?.setLinearVelocity(Vector3.Zero());
    this.mesh.physicsBody?.setAngularVelocity(Vector3.Zero());
  }

  public pushFigure(figure: Figure) {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    const impulse = carBody.getLinearVelocity()
      .scale(carBody.getMassProperties().mass ?? 0);

    figure.move(impulse);
  }

  public static isCar(node: TransformNode): node is AbstractMesh {
    return node.id === Car.id;
  }

  public static async create(scene: Scene) {
    const importResult = await SceneLoader.ImportMeshAsync(
      null,
      'assets/',
      'car.glb',
      scene
    );

    const mesh = importResult.meshes[0] as Mesh;
    mesh.id = Car.id;
    const geometry = importResult.geometries[0];  
    geometry.applyToMesh(mesh);

    const carAggregate = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.MESH,
      { mass: 5, friction: 0.2 },
      scene
    );

    /** To have possibility to change position and rotation. */
    carAggregate.body.disablePreStep = false;

    /** To use rotation animation. */
    mesh.rotationQuaternion = null;
    mesh.rotation = new Vector3(0, 0, 0);

    return new Car(mesh, scene);
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

  private getCollisionsStream(): Observable<Figure | DestinationPoint> {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    carBody.setCollisionCallbackEnabled(true);
    const collisionObservable = carBody.getCollisionObservable();
    
    return new Observable<Figure | DestinationPoint>(subscriber => {
      const collisionObserver = collisionObservable.add((event) => {
        const collidedNode = event.collidedAgainst.transformNode;
        
        if (Figure.isFigure(collidedNode)) {
          subscriber.next(new Figure(collidedNode));
        }
  
        if (DestinationPoint.isDestinationPoint(collidedNode)) {
          subscriber.next(DestinationPoint.instance!);
        }

        return () => collisionObservable.remove(collisionObserver);
      });
    })
  }

  /** @inheritdoc */
  public dispose(): void {
    this.mesh.dispose();
  }
}
