import {
  Engine,
  Scene,
  HavokPlugin,
} from '@babylonjs/core';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import '@babylonjs/loaders/glTF';
import { CarManager } from './car.manager';
import { FiguresManager } from './figures.manager';
import { GameConfiguration } from './game-configuration';
import { Ground } from './ground';
import { DestinationPoint } from './destination-point';

declare const HavokPhysics: () => Promise<unknown>;

/** Main scene of the app. */
export class MainScene {
  private readonly engine = new Engine(this.canvas);

  private readonly scene = new Scene(this.engine);

  private figureManager: FiguresManager | null = null;
  private carManager: CarManager | null = null;
  private ground: Ground | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    public readonly gameConfiguration: GameConfiguration,
    onGameComplete: () => void) {
      this.engine.runRenderLoop(() => this.scene.render());
      this.scene.useRightHandedSystem = true;
      
      MainCamera.create(this.scene);
      MainLight.create(this.scene);

      this.addPhysics().then(() => {
        const ground = Ground.create(this.scene);
        this.ground = ground;
        this.carManager = new CarManager(ground, this.scene);
        this.carManager.initCar()
          .then(car => {
            this.figureManager = new FiguresManager(
              gameConfiguration, 
              ground, 
              car, 
              this.scene
            );
            this.figureManager.onFiguresEnd = onGameComplete;
        });
      });
  }

  private async addPhysics(): Promise<HavokPlugin> {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(null, havokPlugin);

    return havokPlugin;
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
    this.ground?.dispose();
    this.carManager?.dispose();
    this.figureManager?.dispose();
    DestinationPoint.instance?.dispose();
  }
}
