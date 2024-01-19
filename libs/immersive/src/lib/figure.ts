import { IBasePhysicsCollisionEvent, IDisposable, Mesh, MeshBuilder, Observer, PhysicsAggregate, PhysicsShapeType, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Car } from "./car";
import { Ground } from "./ground";
import { Observable } from "rxjs";

export class Figure implements IDisposable {
    
    public static readonly figureSize = 1 as const;

    private static readonly idPreffix = 'figure' as const;

    private checkPositionIntervalId: number | null = null;

    private collisionEndObserver: Observer<IBasePhysicsCollisionEvent> | null = null;

    public readonly positionChanges$: Observable<Figure>;

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
        return node.id.startsWith(this.idPreffix);
    }

    public static createCube(idNumber: number, scene: Scene): Figure {
        const cube = MeshBuilder.CreateBox(Figure.getFullId(idNumber), { size: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.BOX,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(cube);
    }

    public static createCylinder(idNumber: number, scene: Scene): Figure {
        const cylinder = MeshBuilder.CreateCylinder(Figure.getFullId(idNumber), { 
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

    public static createSphere(idNumber: number, scene: Scene): Figure {
        const sphere = MeshBuilder.CreateSphere(Figure.getFullId(idNumber), { diameter: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          sphere,
          PhysicsShapeType.SPHERE,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(sphere);
    }

    
    private static getFullId(idNumber: number): string {
        return this.idPreffix + idNumber.toString();
    }

    private getPositionChangeStream(): Observable<Figure> {
        const figureBody = this.mesh.physicsBody;

        if (figureBody === null) {
            throw new Error('There is no figure physics body.');
        }

        const collisionEndObservable = figureBody.getCollisionEndedObservable();
        
        return new Observable<Figure>((subscriber) => {
            this.collisionEndObserver = collisionEndObservable.add(event => {
                const collidedNode = event.collidedAgainst.transformNode;
                
                if (!Figure.isFigure(collidedNode) && !Car.isCar(collidedNode)) {
                    return;
                }
    
                if (this.checkPositionIntervalId !== null) {
                    clearInterval(this.checkPositionIntervalId);
                }
    
                this.checkPositionIntervalId = setInterval(() => {
                    subscriber.next(this);
                }, 2000);

                return () => this.eraseObservers();
            });
        });
    }

    private eraseObservers() {
        if (this.checkPositionIntervalId !== null) {
            clearInterval(this.checkPositionIntervalId);
            this.checkPositionIntervalId = null;
        }

        if (this.collisionEndObserver === null) {
            return;
        }

        const figureBody = this.mesh.physicsBody;

        if (figureBody === null) {
            throw new Error('There is no figure physics body.');
        }

        const collisionEndObservable = figureBody.getCollisionEndedObservable();

        collisionEndObservable.remove(this.collisionEndObserver);
        this.collisionEndObserver = null;    
    }

    /** @inheritdoc */
    public dispose(): void {
        this.eraseObservers();
        this.mesh.dispose();
    }
}