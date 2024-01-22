import { ArcRotateCamera, Scene, UniversalCamera, Vector3 } from '@babylonjs/core';
import { Ground } from './ground';

/** Main camera of the scene. */
export class MainCamera {

  public constructor(private readonly camera: ArcRotateCamera) {

  }

  /**
   * Creates main camera of the scene.
   * @param scene Scene.
   */
  public static create(scene: Scene): MainCamera {
    const camera = new ArcRotateCamera('mainCamera', 0, 0, 0, Vector3.Zero(), scene);

    camera.attachControl();

    return new MainCamera(camera);
  }

  public locate(ground: Ground) {
    this.camera.setTarget(ground.mesh.position);

    const {x: cameraX, z: cameraZ } = ground.mesh.position;
    const cameraY = ground.mesh._width * 1.5; 
    this.camera.setPosition(new Vector3(cameraX, cameraY, cameraZ));
  }
}
