import { IDisposable, Scene } from '@babylonjs/core';
import { GameConfiguration } from './game-configuration';
import { Figure } from './figure';
import { Ground } from './ground';
import { Car } from './car';
import { MeshUtils } from './mesh.utils';
import { Subscription, delay, filter, from, mergeMap, tap } from 'rxjs';

type FigureFactory = (idNumber: number, ground: Ground, scene: Scene) => Figure;

export class FiguresManager implements IDisposable {

    public static readonly minFigureCount = 1 as const;
    public static readonly maxFigureCount = 5 as const;

    private readonly figures = new Set<Figure>();
    private readonly figuresPositionChangeSubscription: Subscription;

    public constructor(
        configuration: GameConfiguration,
        private readonly ground: Ground,
        private readonly car: Car,
        private readonly scene: Scene) {
            this.initFigures(configuration.cubeCount, Figure.createCube);
            this.initFigures(configuration.cylinderCount, Figure.createCylinder);
            this.initFigures(configuration.sphereCount, Figure.createSphere);
            this.figuresPositionChangeSubscription = this.subscribeToFiguresPositionChange();
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
            const idNumber = this.figures.size + 1;
            const figure = figureFactory(idNumber, this.ground, this.scene);
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

    private subscribeToFiguresPositionChange(): Subscription {
        const fallTimeInMilliseconds = 1000;

        const positionChangeStreams = [...this.figures]
            .map(figure => figure.positionChange$);
        
        return from(positionChangeStreams).pipe(
            mergeMap(positionChangeStream => positionChangeStream),
            filter(figure => !this.isFigureOnGround(figure)),
            delay(fallTimeInMilliseconds),
            tap(figure => this.removeFigure(figure)),
        ).subscribe();
    }

    private isFigureOnGround(figure: Figure) {
        return MeshUtils.hasIntersection(this.ground.mesh, figure.mesh);
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

        this.figuresPositionChangeSubscription.unsubscribe();
    }
}
