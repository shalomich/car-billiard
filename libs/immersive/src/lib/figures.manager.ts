import { IDisposable, Scene, Vector3 } from '@babylonjs/core';
import { GameConfiguration } from './game-configuration';
import { Figure } from './figure';
import { Ground } from './ground';
import { Car } from './car';
import { MeshUtils } from './mesh.utils';
import { Subscription, delay, filter, from, map, mergeMap, takeWhile, tap } from 'rxjs';

type FigureFactory = (scene: Scene) => Figure;

export class FiguresManager implements IDisposable {

    public static readonly minFigureCount = 0 as const;
    public static readonly maxFigureCount = 5 as const;

    private readonly figures = new Set<Figure>();
    private readonly figuresRemovingSubscription: Subscription;

    public constructor(
        configuration: GameConfiguration,
        private readonly ground: Ground,
        private readonly car: Car,
        private readonly scene: Scene) {
            this.initFigures(configuration.cubeCount, Figure.createCube);
            this.initFigures(configuration.cylinderCount, Figure.createCylinder);
            this.initFigures(configuration.sphereCount, Figure.createSphere);
            this.figuresRemovingSubscription = this.subscribeToFiguresRemoving();
    }

    public onFiguresEnd: () => void = () => undefined;

    private initFigures(
        figureCount: number, 
        figureFactory: FigureFactory) {
        if (figureCount < FiguresManager.minFigureCount) {
            figureCount = FiguresManager.minFigureCount;
        }

        if (figureCount > FiguresManager.maxFigureCount) {
            figureCount = FiguresManager.maxFigureCount;
        }

        for (let i = 0; i < figureCount; i++) {
            const figure = figureFactory(this.scene);
            this.setFigurePosition(figure);
            this.figures.add(figure);
        }
    }

    private async setFigurePosition(figure: Figure) {
        const { mesh: figureMesh } = figure;
        const figureShift = Figure.figureSize / 2;
        
        while (true) {
            const figurePosition = this.ground.getRandomPoint(figureShift);
            
            figureMesh.position = figurePosition;
            // To update bounding info.
            figureMesh.computeWorldMatrix(true);
            
            if (!this.hasFigureIntersection(figure)) {
                break;
            }        
        }
    }

    private hasFigureIntersection(newFigure: Figure): boolean {
        if (MeshUtils.hasIntersection(newFigure.mesh, this.car.mesh)) {
            return true;
        }
        
        for (const figure of this.figures) {
            if (MeshUtils.hasIntersection(newFigure.mesh, figure.mesh)) {
                return true;
            }
        }
    
        return false;
    }

    private subscribeToFiguresRemoving(): Subscription {
        const fallTimeInMilliseconds = 1000;

        return from(this.figures).pipe(
            mergeMap(figure => figure.positionChanges$.pipe(
                map(figurePosition => ({ figure, figurePosition }))
            )),
            filter(({ figure }) => this.figures.has(figure)),
            filter(({ figurePosition }) => !this.isFigureOnGround(figurePosition)),
            delay(fallTimeInMilliseconds),
            tap( ({ figure }) => this.removeFigure(figure)),
        ).subscribe();
    }

    private isFigureOnGround(figurePosition: Vector3) {
        const {x, z} = figurePosition;
        const figurePositionOnGround = new Vector3(x, this.ground.mesh.position.y, z);
        return MeshUtils.hasIntersectionWithPoint(this.ground.mesh, figurePositionOnGround);
    }

    private removeFigure(figure: Figure): void {
        figure.dispose();
        this.figures.delete(figure);

        if (this.figures.size === 0) {
            this.onFiguresEnd();
        }
    }

    /** @inheritdoc */
    public dispose(): void {
        for (const figure of this.figures) {
            figure.dispose();
        }

        this.figures.clear();

        this.figuresRemovingSubscription.unsubscribe();
    }
}
