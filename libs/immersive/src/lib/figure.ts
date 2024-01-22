import { Color3, IDisposable, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, StandardMaterial, Texture, TransformNode, Vector3, VideoTexture } from "@babylonjs/core";
import { Observable, interval, map } from "rxjs";

export class Figure implements IDisposable {
    
    public static readonly figureSize = 1 as const;

    private static readonly id = 'figure' as const;
    private static readonly mass = 10;
    private static readonly friction = 0.5;

    public readonly positionChanges$: Observable<Vector3>;

    public constructor(
        public readonly mesh: Mesh,
    ) {
        if (!Figure.isFigure(mesh)) {
            throw new Error('Wrong mesh for destination point.');
        }

        this.positionChanges$ = this.getPositionChangeStream();
    }

    public onFellOfGround: (figure: Figure) => void = () => undefined;

    public move(impulse: Vector3) {
        this.mesh.physicsBody?.applyImpulse(impulse, this.mesh.position);
    }

    public static isFigure(node: TransformNode): node is Mesh {
        return node.id === Figure.id;
    }

    public static createCube(scene: Scene): Figure {
        const mesh = MeshBuilder.CreateBox(Figure.id, { size: Figure.figureSize }, scene);
        
        const material = new StandardMaterial('cylinderMaterial', scene);
        material.diffuseTexture = new VideoTexture('video', 'assets/anime-chan-dancing.mp4', scene, true);
        mesh.material = material;

        const aggregate = new PhysicsAggregate(
            mesh,
          PhysicsShapeType.BOX,
          { mass: Figure.mass, friction: Figure.friction },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(mesh);
    }

    public static createCylinder(scene: Scene): Figure {
        const mesh = MeshBuilder.CreateCylinder(Figure.id, { 
            height: Figure.figureSize, 
            diameter: Figure.figureSize 
        }, scene);

        const material = new StandardMaterial('cylinderMaterial', scene);
        material.diffuseColor = Color3.Blue();
        mesh.material = material;

        const aggregate = new PhysicsAggregate(
            mesh,
          PhysicsShapeType.CYLINDER,
          { mass: Figure.mass, friction: Figure.friction },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(mesh);
    }

    public static createSphere(scene: Scene): Figure {
        const mesh = MeshBuilder.CreateSphere(Figure.id, { diameter: Figure.figureSize }, scene);
        
        const material = new StandardMaterial('sphereMaterial', scene);
        material.bumpTexture  = new Texture('assets/bump-texture.png', scene);
        mesh.material = material;

        const aggregate = new PhysicsAggregate(
          mesh,
          PhysicsShapeType.SPHERE,
          { mass: Figure.mass, friction: Figure.friction },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(mesh);
    }

    private getPositionChangeStream(): Observable<Vector3> {
        return interval(2000).pipe(
            map(() => this.mesh.position),
        ); 
    }

    /** @inheritdoc */
    public dispose(): void {
        this.mesh.dispose();
    }
}