import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MainScene } from '@babylonjs-boilerplate/immersive';
import { GameConfiguration } from 'libs/immersive/src/lib/game-configuration';
import { GameConfigurationModalComponent } from '../features/game-configuration/game-configuration-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, tap } from 'rxjs';

/** App component. */
@Component({
  selector: 'babylonjs-boilerplate-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy, OnInit {

  private readonly ngZone = inject(NgZone);

  private readonly dialog = inject(MatDialog);

  /** Canvas reference. */
  @ViewChild('canvas')
  protected canvasRef?: ElementRef<HTMLCanvasElement>;

  protected scene: MainScene | null = null;

  /** @inheritdoc */
  public ngOnInit(): void {
    this.openGameConfigurationModal();
  }
  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.scene?.erase();
  }

  private openGameConfigurationModal(): void {
    this.dialog.open<GameConfigurationModalComponent, null, GameConfiguration>(GameConfigurationModalComponent, {
      disableClose: true,
    })
      .afterClosed()
      .pipe(
        filter((gameConfiguration): gameConfiguration is GameConfiguration => gameConfiguration !== undefined),
        tap(gameConfiguration => this.startGame(gameConfiguration)),
      )
      .subscribe();
  }

  private startGame(gameConfiguration: GameConfiguration): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.canvasRef != null) {
        this.scene = new MainScene(this.canvasRef.nativeElement, gameConfiguration);
      }
    });
  }
}
