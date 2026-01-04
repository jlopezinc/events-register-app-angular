import { Component } from '@angular/core';
import { Counters, EventsRegisterApiService } from '../events-register-api.service';

@Component({
    selector: 'reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css'],
    standalone: false
})
export class ReportsComponent {

  constructor(private eventsRegisterApiService: EventsRegisterApiService) {

  }

  counters: Counters = new Counters();
  checkedInPercentage: number = 0;
  checkedInCarPercentage: number = 0;
  checkedInMotorcyclePercentage: number = 0;
  checkedInQuadPercentage: number = 0;

  paidPercentage: number = 0;
  paidCarPercentage: number = 0;
  paidMotorcyclePercentage: number = 0;
  paidQuadPercentage: number = 0;

  ngAfterViewInit(): void {
    this.eventsRegisterApiService.getCounters('ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          this.counters = { ...data };
          this.checkedInPercentage = (this.counters.checkedInCar + this.counters.checkedInMotorcycle + this.counters.checkedInQuad) / this.counters.total * 100;
          if (Number.isNaN(this.checkedInPercentage)) {
            this.checkedInPercentage = 0;
          }
          this.checkedInCarPercentage = (this.counters.checkedInCar / this.counters.totalCar) * 100;
          if (Number.isNaN(this.checkedInCarPercentage)) {
            this.checkedInCarPercentage = 0;
          }
          this.checkedInMotorcyclePercentage = (this.counters.checkedInMotorcycle / this.counters.totalMotorcycle) * 100;
          if (Number.isNaN(this.checkedInMotorcyclePercentage)) {
            this.checkedInMotorcyclePercentage = 0;
          }
          this.checkedInQuadPercentage = (this.counters.checkedInQuad / this.counters.totalQuad) * 100;
          if (Number.isNaN(this.checkedInQuadPercentage)) {
            this.checkedInQuadPercentage = 0;
          }

          this.paidPercentage = this.counters.paid / this.counters.total * 100;
          if (Number.isNaN(this.paidPercentage)) {
            this.paidPercentage = 0;
          }
          this.paidCarPercentage = (this.counters.paidCar / this.counters.totalCar) * 100;
          if (Number.isNaN(this.paidCarPercentage)) {
            this.paidCarPercentage = 0;
          }
          this.paidMotorcyclePercentage = (this.counters.paidMotorcycle / this.counters.totalMotorcycle) * 100;
          if (Number.isNaN(this.paidMotorcyclePercentage)) {
            this.paidMotorcyclePercentage = 0;
          }
          this.paidQuadPercentage = (this.counters.paidQuad / this.counters.totalQuad) * 100;
          if (Number.isNaN(this.paidQuadPercentage)) {
            this.paidQuadPercentage = 0;
          }
        }
      })
  }
}
