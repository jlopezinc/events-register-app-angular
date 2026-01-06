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
  @Output() editUserEvent = new EventEmitter<void>();

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

  public editUser() {
    this.editUserEvent.emit();
  }

  /**
   * Checks if the user has any change history entries
   * @returns true if changeHistory exists and has at least one entry
   */
  public hasChangeHistory(): boolean {
    return !!(this.user?.metadata?.changeHistory && 
           this.user.metadata.changeHistory.length > 0);
  }

  /**
   * Gets a friendly display label for an action type
   * @param action The action string from the change history
   * @returns A friendly display label for the action
   */
  public getActionLabel(action: string): string {
    const actionMap: { [key: string]: string } = {
      'created': 'Criado',
      'updated': 'Atualizado',
      'checked-in': 'Check-in',
      'checked-out': 'Check-out',
      'payment-confirmed': 'Pagamento Confirmado',
      'payment-pending': 'Pagamento Pendente',
      'cancelled': 'Cancelado'
    };
    return actionMap[action] || action;
  }

  /**
   * Gets a color class for action chips based on action type
   * @param action The action string from the change history
   * @returns A CSS class name for styling the action chip
   */
  public getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'created': 'primary',
      'updated': 'accent',
      'checked-in': 'primary',
      'checked-out': 'warn',
      'payment-confirmed': 'primary',
      'payment-pending': 'warn',
      'cancelled': 'warn'
    };
    return colorMap[action] || '';
  }

}
