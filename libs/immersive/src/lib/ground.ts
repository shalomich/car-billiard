import { Color3, GroundMesh, IDisposable, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export class Ground implements IDisposable {

    public constructor(private readonly groundMesh: GroundMesh) {

    }
    
    public get position() {
        return this.groundMesh.position;
    }

    public static create(scene: Scene) {
        const groundMesh = MeshBuilder.CreateGround(
            'ground',
            { width: 20, height: 20 },
            scene
          );
          const material = new StandardMaterial('groundMaterial', scene);
          material.diffuseColor = Color3.Green();
          groundMesh.material = material;
          
          const groundAggregate = new PhysicsAggregate(
            groundMesh,
            PhysicsShapeType.BOX,
            { mass: 0 },
            scene
          );
      
        return new Ground(groundMesh);
    }

    public hasPoint(point: Vector3) {
        const { minimum, maximum} = this.groundMesh.getBoundingInfo();
        
        return point.x >= minimum.x && point.x <= maximum.x &&
            point.z >= minimum.z && point.z <= maximum.z;
    }

    public getRandomPoint(shift: number | null) {
        let { minimum: { x: minX, z: minZ}, maximum: { x: maxX, z: maxZ} } = this.groundMesh.getBoundingInfo();
        
        if (shift !== null) {
            minX += shift;
            minZ += shift;
            maxX -= shift;
            maxZ -= shift;  
        }
        
        return new Vector3(
            this.generateRandomFloat(minX, maxX), 
            this.groundMesh.position.y + 1, 
            this.generateRandomFloat(minZ, maxZ)
        );
    }

    private generateRandomFloat(min: number, max: number): number {
        const randomNumberAsString = (Math.random() * (max - min) + min).toFixed(3);

        return parseFloat(randomNumberAsString);
    }

    /** @inheritdoc */
    public dispose(): void {
        this.groundMesh.dispose();
    }
}