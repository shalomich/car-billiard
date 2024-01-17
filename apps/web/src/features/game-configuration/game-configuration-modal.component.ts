import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { GameConfigurationFormControls } from './game-configuration-form';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FiguresManager } from 'libs/immersive/src/lib/figures.manager';
import { MatDialogRef } from '@angular/material/dialog';
import { GameConfiguration } from 'libs/immersive/src/lib/game-configuration';

/** App component. */
@Component({
    selector: 'game-configuration-modal',
    templateUrl: './game-configuration-modal.component.html',
    styleUrls: [ './game-configuration-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class GameConfigurationModalComponent {

    private readonly formBuilder = inject(NonNullableFormBuilder);

    private readonly dialogRef = inject(MatDialogRef<GameConfigurationModalComponent>);

    protected readonly minFigureCount = FiguresManager.minFigureCount;

    protected readonly maxFigureCount = FiguresManager.maxFigureCount;

    /** Game configuration form group. */
	protected readonly formGroup: FormGroup<GameConfigurationFormControls>;

    public constructor() {
        this.formGroup = this.initForm();
    }

    /** Handle game start. */
	protected handleGameStart(): void {
		this.formGroup.markAllAsTouched();

        if (this.formGroup.invalid) {
			return;
		}

		const gameConfiguration: GameConfiguration = this.formGroup.getRawValue();

        this.dialogRef.close(gameConfiguration);
    }


    private initForm(): FormGroup<GameConfigurationFormControls> {
        const figureCountControlBuilder = () => this.formBuilder.control(this.minFigureCount, 
            [
                Validators.required,
                Validators.min(this.minFigureCount),
                Validators.max(this.maxFigureCount)
            ]
        );

        return this.formBuilder.group<GameConfigurationFormControls>({
			cubeCount: figureCountControlBuilder(),
			cylinderCount: figureCountControlBuilder(),
		    sphereCount: figureCountControlBuilder(),
        })
    }
  }