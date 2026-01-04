import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/events-register-api.service';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.css'],
    standalone: false
})
export class UserCardComponent {
  @Input() public user!: UserModel;

  // for clear and checkin buttons
  @Output() clearSelectedUserEvent = new EventEmitter<void>();
  @Output() manualCheckInSelectedUserEvent = new EventEmitter<void>();
  @Output() cancelCheckInSelectedUserEvent = new EventEmitter<void>();

  constructor() { }

  public clearSelectedUser() {
    this.clearSelectedUserEvent.emit();
  }

  public manualCheckInUser() {
    this.manualCheckInSelectedUserEvent.emit();
  }

  public cancelCheckInUser() {
    this.cancelCheckInSelectedUserEvent.emit();
  }

}
