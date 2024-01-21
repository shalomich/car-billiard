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

  private constructor(public readonly mesh: Mesh) {
  }

  public static isDestinationPoint(node: TransformNode): node is Mesh {
    return node.id === DestinationPoint.id;
  }

  /**
   * Create destination point.
   * @param position - Position.
   * @param scene - Scene.
   */
  public static create(
    position: Vector3,
    scene: Scene,
  ): DestinationPoint {
    const destinationPointMesh = MeshBuilder.CreateCylinder(
      DestinationPoint.id,
      { diameter: 0.5,  height: 0.03 },
      scene
    );

    destinationPointMesh.position = position;

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
  }
}
