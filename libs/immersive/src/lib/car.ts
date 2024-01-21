import { AbstractMesh, Animation, IDisposable, IPhysicsCollisionEvent, Mesh, Observable, Observer, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, TransformNode, Vector3 } from '@babylonjs/core';

import { VectorUtils } from './vector.utils';
import { DestinationPoint } from './destination-point';
import { Figure } from './figure';

/** Card. */
export class Car implements IDisposable {
  private readonly mass = 5 as const;
  private readonly acceleration = 50 as const;

  private readonly collisionsObserver: Observer<IPhysicsCollisionEvent>;

  private destinationPoint: DestinationPoint | null = null;

  private static readonly id = 'car' as const;

  public constructor(
    public readonly mesh: AbstractMesh,
    private readonly scene: Scene
  ) {
    this.collisionsObserver = this.observeCollisions();
  }

  /**
   * Move to destination.
   * @param destinationPoint - Destination point.
   */
  public move(destinationPoint: DestinationPoint): void {
    if (this.isMoving()) {
      throw new Error('The car is still moving.');
    }

    this.destinationPoint = destinationPoint;

    this.scene.beginDirectAnimation(
      this.mesh,
      [this.getTurnAnimation(destinationPoint)],
      0, 30, false, 1,
      () => this.transferTo(destinationPoint)
    );
  }

  public isMoving(): boolean {
    return this.destinationPoint !== null;
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

  private stop(): void {
    this.mesh.physicsBody?.setLinearVelocity(Vector3.Zero());
    this.mesh.physicsBody?.setAngularVelocity(Vector3.Zero());
  }

  private pushFigure(figure: Figure) {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    const impulse = carBody.getLinearVelocity()
      .scale(carBody.getMassProperties().mass ?? 0);

    figure.move(impulse);
  }

  private cancelDestinationPoint(): void {
    this.destinationPoint?.dispose();
    this.destinationPoint = null;
  }

  private observeCollisions(): Observer<IPhysicsCollisionEvent> {
    const collisionObservable = this.getCollisionObservable();
    
    return collisionObservable.add((event) => {
        const collidedNode = event.collidedAgainst.transformNode;
        
        const isFigure = Figure.isFigure(collidedNode);
        const isDestinationPoint = DestinationPoint.isDestinationPoint(collidedNode);

        if (!isFigure && !isDestinationPoint) {
          return;
        }

        if (isFigure) {
          this.pushFigure(new Figure(collidedNode));
        }
      
        this.stop();
        this.cancelDestinationPoint();
    });
  }

  private getCollisionObservable(): Observable<IPhysicsCollisionEvent> {
    const carBody = this.mesh.physicsBody;

    if (carBody === null) {
      throw new Error('There is no car physics body.');
    }

    carBody.setCollisionCallbackEnabled(true);

    return carBody.getCollisionObservable();
  }

  /** @inheritdoc */
  public dispose(): void {
    this.mesh.dispose();
    this.cancelDestinationPoint();

    const collisionObservable = this.getCollisionObservable();
    collisionObservable.remove(this.collisionsObserver);
  }
}
