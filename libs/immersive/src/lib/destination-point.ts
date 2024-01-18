import {
  Color3,
  IDisposable,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

/** Destination point. */
export class DestinationPoint implements IDisposable {
  
  private static readonly id = 'destination' as const;

  private static _instance: DestinationPoint | null = null;

  public static get instance(): DestinationPoint | null {
    return DestinationPoint._instance;
  }

  private constructor(public readonly mesh: Mesh) {
  }

  public isCancelled(): boolean {
    return !this.mesh.isEnabled();
  }

  public cancel(): void {
    this.mesh.setEnabled(false);
  }

  public static changePosition(position: Vector3, scene: Scene): DestinationPoint {
    if (DestinationPoint._instance === null) {
      DestinationPoint._instance = DestinationPoint.create(scene);
    }

    DestinationPoint._instance.mesh.position = position;
    DestinationPoint._instance.mesh.setEnabled(true);

    return DestinationPoint._instance;
  }

  public static isDestinationPoint(node: TransformNode): node is Mesh {
    return node.id === DestinationPoint.id;
  }

  /**
   * Create destination point.
   * @param position - Position.
   * @param scene - Scene.
   */
  private static create(
    scene: Scene,
  ): DestinationPoint {
    const destinationPointMesh = MeshBuilder.CreateCylinder(
      DestinationPoint.id,
      { diameter: 0.5,  height: 0.03 },
      scene
    );

    const material = new StandardMaterial('destinationPointMaterial', scene);
    material.diffuseColor = Color3.Red();
    destinationPointMesh.material = material;

    const destinationPointAggregate = new PhysicsAggregate(
      destinationPointMesh,
      PhysicsShapeType.CYLINDER,
      { mass: 0 },
      scene
    );

    destinationPointAggregate.body.disablePreStep = false;

    return new DestinationPoint(destinationPointMesh);
  }
  
  /** @inheritdoc */
  public dispose(): void {
    this.mesh.dispose();
    DestinationPoint._instance = null;
  }
}
