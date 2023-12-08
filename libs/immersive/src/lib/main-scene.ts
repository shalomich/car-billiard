import { Color3, Engine, MeshBuilder, Scene, StandardMaterial } from '@babylonjs/core';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';

/** Main scene of the app. */
export class MainScene {

  private readonly engine = new Engine(this.canvas);

  private readonly scene = new Scene(this.engine);

  public constructor(
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.engine.runRenderLoop(() => this.scene.render());

    MainCamera.create(this.scene);
    MainLight.create(this.scene);
    this.createGround();
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
  }

  // Dumb ground. Just to show something at scene
  private createGround(): void {
    const ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 }, this.scene);
    const material = new StandardMaterial('groundMaterial', this.scene);
    material.diffuseColor = Color3.Random();
    ground.material = material;
  }
}
