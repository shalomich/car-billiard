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
import { FiguresFactory } from './figure.factory';
import { GameConfiguration } from './game-configuration';

declare const HavokPhysics: () => Promise<unknown>;

/** Main scene of the app. */
export class MainScene {
  private readonly engine = new Engine(this.canvas);

  private readonly scene = new Scene(this.engine);

  private disposeCar?: () => void;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    gameConfiguration: GameConfiguration) {
    this.engine.runRenderLoop(() => this.scene.render());
    this.scene.useRightHandedSystem = true;
    MainCamera.create(this.scene);
    MainLight.create(this.scene);

    this.addPhysics().then((plugin) => {
      plugin.onTriggerCollisionObservable.add((event) =>
        console.log(event.collidedAgainst.transformNode.id)
      );
      const groundMesh = this.createGround();
      FiguresFactory.create(gameConfiguration, groundMesh, this.scene);
      CarFactory.create(groundMesh, this.scene).then(({ disposeCar }) => {
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
      { width: 20, height: 20 },
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

  private async addPhysics(): Promise<HavokPlugin> {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(null, havokPlugin);

    return havokPlugin;
  }
}
