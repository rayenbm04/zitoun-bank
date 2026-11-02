import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';

@Component({
  selector: 'app-profil',
  imports: [DatePipe],
  templateUrl: './profil.html',
})
export class Profil {
  readonly auth = inject(AuthService);
  readonly prefs = inject(PrefsService);
}
