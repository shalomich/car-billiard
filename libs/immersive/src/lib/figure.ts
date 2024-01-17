import { IDisposable, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Car } from "./car";
import { Ground } from "./ground";

export class Figure implements IDisposable {
    
    public static readonly figureSize = 1 as const;

    private static readonly idPreffix = 'figure' as const;

    public constructor(
        private readonly figureMesh: Mesh, 
        private readonly ground: Ground,
    ) {
        if (!Figure.isFigure(figureMesh)) {
            throw new Error('Wrong mesh for destination point.');
        }

        this.addFellOffGroundObservable();
    }

    public onFellOfGround: (figure: Figure) => void = () => undefined;

    private addFellOffGroundObservable() {
        const figureBody = this.figureMesh.physicsBody;

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
                // Figure is on ground.
                if (this.ground.hasPoint(this.figureMesh.position)) {
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

    public get id() {
        return this.figureMesh.id;
    }

    public set position(position: Vector3) {
        if (!this.ground.hasPoint(position)) {
            throw new Error('Ground does not have this point.');
        }

        this.figureMesh.position = position;
    }

    public get position() {
        return this.figureMesh.position;
    }

    public static isFigure(node: TransformNode): node is Mesh {
        return node.id.startsWith(this.idPreffix);
    }

    public push(velocity: Vector3) {
        this.figureMesh.physicsBody?.applyImpulse(velocity, this.figureMesh.position);
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

    /** @inheritdoc */
    public dispose(): void {
        this.figureMesh.dispose();
    }
}