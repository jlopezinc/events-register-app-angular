import { Component } from '@angular/core';
import { Counters, EventsRegisterApiService } from '../events-register-api.service';

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

  constructor(private eventsRegisterApiService: EventsRegisterApiService) {

  }

  counters: Counters = new Counters();
  checkedInPercentage: number = 0;
  checkedInCarPercentage: number = 0;
  checkedInMotorcyclePercentage: number = 0;
  checkedInQuadPercentage: number = 0;

  ngAfterViewInit(): void {
    this.eventsRegisterApiService.getCounters('ttamigosnatal2023')
      .subscribe({
        next: (data) => {
          this.counters = { ...data };
          this.checkedInPercentage = (this.counters.checkedInCar + this.counters.checkedInMotorcycle + this.counters.checkedInQuad) / this.counters.total * 100;
          if (Number.isNaN(this.checkedInPercentage)) {
            this.checkedInPercentage = 0;
          }
          this.checkedInCarPercentage = (this.counters.checkedInCar / this.counters.totalCar);
          if (Number.isNaN(this.checkedInCarPercentage)) {
            this.checkedInCarPercentage = 0;
          }
          this.checkedInMotorcyclePercentage = (this.counters.checkedInMotorcycle / this.counters.totalMotorcycle);
          if (Number.isNaN(this.checkedInMotorcyclePercentage)) {
            this.checkedInMotorcyclePercentage = 0;
          }
          this.checkedInQuadPercentage = (this.counters.checkedInQuad / this.counters.totalQuad);
          if (Number.isNaN(this.checkedInQuadPercentage)) {
            this.checkedInQuadPercentage = 0;
          }
        }
      })
  }
}
