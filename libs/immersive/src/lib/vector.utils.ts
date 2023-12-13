import { Vector3 } from '@babylonjs/core';

/** Vector utils. */
export namespace VectorUtils {
  /**
   * Get directional vector.
   * @param beginning - Beggining point.
   * @param end - End point.
   */
  export function getDirectionalVector(beginning: Vector3, end: Vector3) {
    return new Vector3(
      end.x - beginning.x,
      end.y - beginning.y,
      end.z - beginning.z
    );
  }

  /**
   * Calculate angle in radians.
   * @param beginning - Beginning point.
   * @param end - End point.
   * @param center - Center.
   */
  export function calculateAngleInRadians(
    beginning: Vector3,
    end: Vector3,
    center: Vector3 = new Vector3(0, 0, 0)
  ): number {
    const beginningVector = getDirectionalVector(beginning, center);
    const endVector = getDirectionalVector(end, center);

    const scalar =
      beginningVector.x * endVector.x +
      beginningVector.y * endVector.y +
      beginningVector.z * endVector.z;

    const cos = scalar / (beginningVector.length() * endVector.length());

    return Math.acos(cos);
  }
}
