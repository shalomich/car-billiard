import { IDisposable, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Car } from "./car";
import { Ground } from "./ground";
import { MeshUtils } from "./mesh.utils";

export class Figure implements IDisposable {
    
    public static readonly figureSize = 1 as const;

    private static readonly idPreffix = 'figure' as const;

    public constructor(
        public readonly mesh: Mesh, 
        private readonly ground: Ground,
    ) {
        if (!Figure.isFigure(mesh)) {
            throw new Error('Wrong mesh for destination point.');
        }

        this.addFellOffGroundObservable();
    }

    public onFellOfGround: (figure: Figure) => void = () => undefined;

    public isOnGround() {
        return MeshUtils.hasIntersection(this.ground.mesh, this.mesh);
    }

    public push(velocity: Vector3) {
        this.mesh.physicsBody?.applyImpulse(velocity, this.mesh.position);
    }

    public static isFigure(node: TransformNode): node is Mesh {
        return node.id.startsWith(this.idPreffix);
    }

    public static createCube(idNumber: number, ground: Ground, scene: Scene): Figure {
        const cube = MeshBuilder.CreateBox(Figure.getFullId(idNumber), { size: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          cube,
          PhysicsShapeType.BOX,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(cube, ground);
    }

    public static createCylinder(idNumber: number, ground: Ground, scene: Scene): Figure {
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

        return new Figure(cylinder, ground);
    }

    public static createSphere(idNumber: number, ground: Ground, scene: Scene): Figure {
        const sphere = MeshBuilder.CreateSphere(Figure.getFullId(idNumber), { diameter: Figure.figureSize }, scene);
        
        const aggregate = new PhysicsAggregate(
          sphere,
          PhysicsShapeType.SPHERE,
          { mass: 5, friction: 1 },
          scene
        );

        aggregate.body.disablePreStep = false;

        return new Figure(sphere, ground);
    }

    
    private static getFullId(idNumber: number): string {
        return this.idPreffix + idNumber.toString();
    }

    private addFellOffGroundObservable() {
        const figureBody = this.mesh.physicsBody;

        if (figureBody === null) {
            throw new Error('There is no figure physics body.');
        }

        let checkFigureOnGroundIntervalId: number | null = null;

        const collisionEndObservable = figureBody.getCollisionEndedObservable();
        
        const collisionEndObserver = collisionEndObservable.add(event => {
            const collidedNode = event.collidedAgainst.transformNode;
            
            if (!Figure.isFigure(collidedNode) && !Car.isCar(collidedNode)) {
                return;
            }

            if (checkFigureOnGroundIntervalId !== null) {
                clearInterval(checkFigureOnGroundIntervalId);
            }

            checkFigureOnGroundIntervalId = setInterval(() => {
                if (this.isOnGround()) {
                    return;
                }
            
                this.onFellOfGround(this);

                collisionEndObservable.remove(collisionEndObserver);

                if (checkFigureOnGroundIntervalId !== null) {
                    clearInterval(checkFigureOnGroundIntervalId);
                }
            }, 2000);
        });
    }

    /** @inheritdoc */
    public dispose(): void {
        this.mesh.dispose();
    }
}