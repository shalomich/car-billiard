import {
  Engine,
  Scene,
  HavokPlugin,
} from '@babylonjs/core';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import '@babylonjs/loaders/glTF';
import { CarFactory } from './car.factory';
import { FiguresManager } from './figures.manager';
import { GameConfiguration } from './game-configuration';
import { Ground } from './ground';
import { Car } from './car';
import { DestinationPoint } from './destination-point';

declare const HavokPhysics: () => Promise<unknown>;

/** Main scene of the app. */
export class MainScene {
  private readonly engine = new Engine(this.canvas);

  private readonly scene = new Scene(this.engine);

  private figureManager: FiguresManager | null = null;
  private ground: Ground | null = null;
  private car: Car | null = null;

  private disposeCar?: () => void;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    public readonly gameConfiguration: GameConfiguration,
    onGameComplete: () => void) {
    this.engine.runRenderLoop(() => this.scene.render());
    this.scene.useRightHandedSystem = true;
    MainCamera.create(this.scene);
    MainLight.create(this.scene);

    this.addPhysics().then(() => {
      this.ground = Ground.create(this.scene);
      this.figureManager = new FiguresManager(this.ground, this.scene);
      this.figureManager.initFigures(gameConfiguration);
      this.figureManager.onFiguresEnd = onGameComplete;
      CarFactory.create(this.ground, this.scene).then(({ car, disposeCar }) => {
        this.car = car;
        this.disposeCar = disposeCar;
      });
    });
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
    this.ground?.dispose();
    this.car?.dispose();
    this.figureManager?.dispose();
    DestinationPoint.instance?.dispose();
    this.disposeCar?.();
  }

  private async addPhysics(): Promise<HavokPlugin> {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(null, havokPlugin);

    return havokPlugin;
  }
}
