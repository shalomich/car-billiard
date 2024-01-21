import { IDisposable, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Observable, distinctUntilChanged, interval, map } from "rxjs";

export class Figure implements IDisposable {
    
    public static readonly figureSize = 1 as const;

    private static readonly id = 'figure' as const;

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
        const cube = MeshBuilder.CreateBox(Figure.id, { size: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.BOX,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(cube);
    }

    public static createCylinder(scene: Scene): Figure {
        const cylinder = MeshBuilder.CreateCylinder(Figure.id, { 
            height: Figure.figureSize, 
            diameter: Figure.figureSize 
        }, scene);

        const aggregate = new PhysicsAggregate(
          cylinder,
          PhysicsShapeType.CYLINDER,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(cylinder);
    }

    public static createSphere(scene: Scene): Figure {
        const sphere = MeshBuilder.CreateSphere(Figure.id, { diameter: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          sphere,
          PhysicsShapeType.SPHERE,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(sphere);
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