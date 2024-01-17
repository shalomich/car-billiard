import { IDisposable, Scene } from '@babylonjs/core';
import { GameConfiguration } from './game-configuration';
import { Figure } from './figure';
import { Ground } from './ground';

type FigureFactory = (idNumber: number, ground: Ground, scene: Scene) => Figure;

export class FiguresManager implements IDisposable {

    public static readonly minFigureCount = 1 as const;
    public static readonly maxFigureCount = 5 as const;

    private readonly figures = new Map<string, Figure>();

    public constructor(
        private readonly ground: Ground,
        private readonly scene: Scene) {

    }

    public onFiguresEnd: () => void = () => undefined;
    
    public initFigures(
        configuration: GameConfiguration, 
        ): void {
        this.initFigure(configuration.cubeCount, Figure.createCube);
        this.initFigure(configuration.cylinderCount, Figure.createCylinder);
        this.initFigure(configuration.sphereCount, Figure.createSphere);
    }

    private initFigure(
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
            figure.onFellOfGround = figure => this.observeFigureFellOffGround(figure);

            this.figures.set(figure.id, figure);
        }
    }

    private setFigurePosition(figure: Figure) {
        const figureShift = Figure.figureSize / 2;
        const figurePosition = this.ground.getRandomPoint(figureShift);
        figure.position = figurePosition;
    }

    private observeFigureFellOffGround(figure: Figure): void {
        console.log('delete ' + figure.id);        
        figure.dispose();
        this.figures.delete(figure.id);

        if (this.figures.size === 0) {
            this.onFiguresEnd();
        }
    }

    /** @inheritdoc */
    public dispose(): void {
        for (const [, figure] of this.figures) {
            figure.dispose();
        }

        this.figures.clear();
    }
}
