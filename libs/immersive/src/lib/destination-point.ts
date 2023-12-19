import {
  Color3,
  GroundMesh,
  IDisposable,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

/** Destination point. */
export class DestinationPoint implements IDisposable {
  /** Mesh id. */
  public static readonly meshId = 'destination' as const;

  /** Destination point position. */
  public get position(): Vector3 {
    return this.mesh.position;
  }

  public constructor(private readonly mesh: Mesh) {}

  /**
   * Create destination point.
   * @param coordinates - Coordinates.
   * @param scene - Scene.
   * @param groundMesh - Ground mesh.
   */
  public static create(
    coordinates: Vector3,
    scene: Scene,
    groundMesh: GroundMesh
  ): DestinationPoint {
    const destinationPointMesh = MeshBuilder.CreateCylinder(
      this.meshId,
      { diameter: 1.5, height: 0.5 },
      scene
    );
    destinationPointMesh.position = coordinates;
    destinationPointMesh.position.y = groundMesh.position.y;

    const material = new StandardMaterial('destinationPointMaterial', scene);
    material.diffuseColor = Color3.Red();
    destinationPointMesh.material = material;

    const destinationPointAggregate = new PhysicsAggregate(
      destinationPointMesh,
      PhysicsShapeType.CYLINDER,
      { mass: 0 },
      scene
    );

    return new DestinationPoint(destinationPointMesh);
  }

  /** @inheritdoc */
  public dispose(): void {
    this.mesh.dispose();
  }
}
