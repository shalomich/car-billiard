import { Scene, Vector3 } from '@babylonjs/core';
import { Observable, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';

import { DestinationPoint } from './destination-point';
import { Ground } from './ground';

/** Destination point publisher. */
export class DestinationPointPublisher {
  /** Destination points stream. */
  public readonly destinationPoints$: Observable<DestinationPoint>;

  public constructor(scene: Scene, ground: Ground) {
    this.destinationPoints$ = this.getDestinationPointsStream(
      scene,
      ground
    );
  }

  private getDestinationPointsStream(
    scene: Scene,
    ground: Ground,
  ): Observable<DestinationPoint> {
    return this.getTappingStream(scene).pipe(
      debounceTime(1000),
      distinctUntilChanged(
        (previous, current) =>
          previous.x === current.x &&
          previous.y === current.y &&
          current.z === previous.z
      ),
      filter(() => DestinationPoint.instance?.isCancelled() ?? true),
      map(point => new Vector3(point.x, ground.mesh.position.y, point.z)),
      map(position => DestinationPoint.changePosition(position, scene))
    );
  }

  private getTappingStream(scene: Scene): Observable<Vector3> {
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
