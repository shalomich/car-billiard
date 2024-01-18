import { AbstractMesh, Mesh, Vector3 } from "@babylonjs/core";

export namespace MeshUtils {

    export function hasIntersection(mesh: Mesh, meshToIntersect: AbstractMesh) {
        return mesh.getBoundingInfo().boundingBox.intersectsSphere(
            meshToIntersect.getBoundingInfo().boundingSphere
        );
    }
}