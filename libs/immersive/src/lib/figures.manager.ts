import { IDisposable, Scene } from '@babylonjs/core';
import { GameConfiguration } from './game-configuration';
import { Figure } from './figure';
import { Ground } from './ground';
import { Car } from './car';
import { MeshUtils } from './mesh.utils';

type FigureFactory = (idNumber: number, ground: Ground, scene: Scene) => Figure;

export class FiguresManager implements IDisposable {

    public static readonly minFigureCount = 1 as const;
    public static readonly maxFigureCount = 5 as const;

    private readonly figures = new Map<string, Figure>();

    public constructor(
        private readonly ground: Ground,
        private readonly car: Car,
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

            this.figures.set(figure.mesh.id, figure);
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
            
            if (!this.hasIntersection(figure)) {
                break;
            }        
        }
    }

    private hasIntersection(newFigure: Figure): boolean {
        if (MeshUtils.hasIntersection(newFigure.mesh, this.car.mesh)) {
            return true;
        }
        
        for (const [, figure] of this.figures) {
            if (MeshUtils.hasIntersection(newFigure.mesh, figure.mesh)) {
                return true;
            }
        }
    
        return false;
    }

    private observeFigureFellOffGround(figure: Figure): void {
        figure.dispose();
        this.figures.delete(figure.mesh.id);

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
