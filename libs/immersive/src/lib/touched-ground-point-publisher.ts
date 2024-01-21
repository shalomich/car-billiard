import { Scene, Vector3 } from '@babylonjs/core';
import { Observable, filter, map} from 'rxjs';

import { Ground } from './ground';
import { MeshUtils } from './mesh.utils';

/** Touched ground point publisher. */
export class TouchedGroundPointPublisher {
  /** Touched ground point stream. */
  public readonly points$: Observable<Vector3>;

  public constructor(ground: Ground, scene: Scene) {
    this.points$ = this.getDestinationPointsStream(
      scene,
      ground
    );
  }

  private getDestinationPointsStream(
    scene: Scene,
    ground: Ground,
  ): Observable<Vector3> {
    return this.getTouchedPointStream(scene).pipe(
      map(point => new Vector3(point.x, ground.mesh.position.y, point.z)),
      filter(point => MeshUtils.hasIntersectionWithPoint(ground.mesh, point)),
    );
  }

  private getTouchedPointStream(scene: Scene): Observable<Vector3> {
    return new Observable<Vector3>((subscriber) => {
      const observer = scene.onPointerObservable.add((info) => {
        const { event, type, pickInfo } = info;

        /** Should be point down type. */
        if (type !== 1) {
          return;
        }

        /** Should be left mouse button. */
        if (event.button !== 0) {
          return;
        }

        if (pickInfo?.pickedPoint === null) {
          return;
        }

        subscriber.next(pickInfo?.pickedPoint);

        return () => scene.onPointerObservable.remove(observer);
      });
    });
  }
}
