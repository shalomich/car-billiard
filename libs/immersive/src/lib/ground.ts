import { Color3, GroundMesh, IDisposable, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export class Ground implements IDisposable {

    public constructor(public readonly mesh: GroundMesh) {

    }
    
    public static create(scene: Scene) {
        const mesh = MeshBuilder.CreateGround(
            'ground',
            { width: 20, height: 20 },
            scene
          );
          const material = new StandardMaterial('groundMaterial', scene);
          material.diffuseColor = Color3.Green();
          mesh.material = material;
          const groundAggregate = new PhysicsAggregate(
            mesh,
            PhysicsShapeType.BOX,
            { mass: 0, friction: 1 },
            scene
          );
      
        return new Ground(mesh);
    }

    public getRandomPoint(shift?: number) {
        let { minimum: { x: minX, z: minZ}, maximum: { x: maxX, z: maxZ} } = this.mesh.getBoundingInfo();
        
        if (shift !== undefined) {
            minX += shift;
            minZ += shift;
            maxX -= shift;
            maxZ -= shift;  
        }
        
        return new Vector3(
            this.generateRandomFloat(minX, maxX), 
            this.mesh.position.y + 1, 
            this.generateRandomFloat(minZ, maxZ)
        );
    }

    private generateRandomFloat(min: number, max: number): number {
        const randomNumberAsString = (Math.random() * (max - min) + min).toFixed(3);

        return parseFloat(randomNumberAsString);
    }

    /** @inheritdoc */
    public dispose(): void {
        this.mesh.dispose();
    }
}