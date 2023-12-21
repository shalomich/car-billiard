import {
  Color3,
  Engine,
  GroundMesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
} from '@babylonjs/core';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import '@babylonjs/loaders/glTF';
import { CarFactory } from './car.factory';

declare const HavokPhysics: () => Promise<unknown>;

/** Main scene of the app. */
export class MainScene {
  private readonly engine = new Engine(this.canvas);

  private readonly scene = new Scene(this.engine);

  private disposeCar?: () => void;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine.runRenderLoop(() => this.scene.render());
    this.scene.useRightHandedSystem = true;
    MainCamera.create(this.scene);
    MainLight.create(this.scene);

    this.addPhysics().then((plugin) => {
      plugin.onTriggerCollisionObservable.add((event) =>
        console.log(event.collidedAgainst.transformNode.id)
      );
      const ground = this.createGround();
      this.createCube(ground);
      CarFactory.create(this.scene, ground).then(({ disposeCar }) => {
        this.disposeCar = disposeCar;
      });
    });
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
    this.disposeCar?.();
  }

  // Dumb ground. Just to show something at scene
  private createGround(): GroundMesh {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 30, height: 30 },
      this.scene
    );
    const material = new StandardMaterial('groundMaterial', this.scene);
    material.diffuseColor = Color3.Green();
    ground.material = material;

    const groundAggregate = new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0 },
      this.scene
    );

    return ground;
  }

  private createCube(ground: GroundMesh): void {
    const cube = MeshBuilder.CreateBox('cube', undefined, this.scene);
    cube.position = new Vector3(5, ground.position.y + cube.scaling.y / 2, 5);
    const cubeAggregate = new PhysicsAggregate(
      cube,
      PhysicsShapeType.BOX,
      { mass: 1, friction: 0.5 },
      this.scene
    );
  }

  private async addPhysics(): Promise<HavokPlugin> {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(null, havokPlugin);

    return havokPlugin;
  }
}
