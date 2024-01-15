import { FormControl } from '@angular/forms';

/** Form controls type. */
export type FormControlsOf<T> = {
	[key in keyof T]: FormControl<T[key]>;
};