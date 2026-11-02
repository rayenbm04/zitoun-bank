import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { LineChart } from '../../shared/line-chart';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink, LineChart],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly data = inject(DataService);
  readonly auth = inject(AuthService);
}
