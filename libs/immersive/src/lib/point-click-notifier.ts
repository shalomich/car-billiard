import { Scene, Vector3 } from '@babylonjs/core';
import { Observable } from 'rxjs';

/** Point click notifier. */
export class PointClickNotifier {
  /** Clicked points stream. */
  public readonly clickedPoints$: Observable<Vector3>;

  public constructor(scene: Scene) {
    this.clickedPoints$ = this.initClickedPointsStream(scene);
  }

  private initClickedPointsStream(scene: Scene): Observable<Vector3> {
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
