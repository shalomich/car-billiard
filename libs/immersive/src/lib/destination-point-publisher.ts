import { GroundMesh, Scene, Vector3 } from '@babylonjs/core';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';

import { DestinationPoint } from './destination-point';

/** Destination point publisher. */
export class DestinationPointPublisher {
  /** Destination points stream. */
  public readonly destinationPoints$: Observable<DestinationPoint>;

  public constructor(scene: Scene, groundMesh: GroundMesh) {
    this.destinationPoints$ = this.getDestinationPointsStream(
      scene,
      groundMesh
    );
  }

  private getDestinationPointsStream(
    scene: Scene,
    groundMesh: GroundMesh
  ): Observable<DestinationPoint> {
    return this.getTappingStream(scene).pipe(
      debounceTime(1000),
      distinctUntilChanged(
        (previous, current) =>
          previous.x === current.x &&
          previous.y === current.y &&
          current.z === previous.z
      ),
      map((coordinates) =>
        DestinationPoint.create(coordinates, scene, groundMesh)
      )
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
