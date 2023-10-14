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

  ngAfterViewInit(): void {
    this.eventsRegisterApiService.getCounters('ttamigosnatal2023')
      .subscribe({
        next: (data) => {
          this.counters = { ...data };
          this.checkedInPercentage = (this.counters.checkedInCar + this.counters.checkedInMotorcycle) / this.counters.total * 100;
          if (Number.isNaN(this.checkedInPercentage)) {
            this.checkedInPercentage = 0;
          }
        }
      })
  }
}
