import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { GameConfigurationModalComponent } from "../features/game-configuration/game-configuration-modal.component";
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from "@angular/router";
import { MatDialogModule } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

/** App module. */
@NgModule({
	declarations: [GameConfigurationModalComponent],
	imports: [
        MatFormFieldModule, 
        ReactiveFormsModule, 
        MatInputModule, 
        CommonModule,
        MatButtonModule,
        RouterModule,
        MatDialogModule,
        BrowserAnimationsModule,
	],
	providers: [
		{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
	],
})
export class AppModule { }
