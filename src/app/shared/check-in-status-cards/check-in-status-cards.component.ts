import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserModel } from '../../events-register-api.service';

@Component({
    selector: 'app-check-in-status-cards',
    templateUrl: './check-in-status-cards.component.html',
    styleUrls: ['./check-in-status-cards.component.css'],
    standalone: false
})
export class CheckInStatusCardsComponent {
  @Input() liveMode: boolean = false;
  @Input() userNotFound: boolean = false;
  @Input() alreadyCheckedIn: boolean = false;
  @Input() userHasComment: boolean = false;
  @Input() currentUser!: UserModel;
  @Input() isLoading: boolean = false;
  @Input() searchPerformed: boolean = false; // Only used by search component

  @Output() clearSelectedUserEvent = new EventEmitter<void>();
  @Output() manualCheckInUserEvent = new EventEmitter<void>();

  public clearSelectedUser(): void {
    this.clearSelectedUserEvent.emit();
  }

  public manualCheckInUser(): void {
    this.manualCheckInUserEvent.emit();
  }
}
