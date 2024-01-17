import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/** App component. */
@Component({
    selector: 'game-complete-modal',
    templateUrl: './game-complete-modal.component.html',
    styleUrls: [ './game-complete-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class GameCompleteModalComponent {

    private readonly dialogRef = inject(MatDialogRef<GameCompleteModalComponent>);


    public constructor() {
    }

	protected handleStartNewGame(): void {
		const isRestart = false;
        this.dialogRef.close(isRestart);
    }

	protected handleRestartGame(): void {
		const isRestart = true;
        this.dialogRef.close(isRestart);
    }
  }