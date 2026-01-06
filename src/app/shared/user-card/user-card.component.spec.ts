import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { UserModel, Metadata, ChangeHistoryEntry } from 'src/app/events-register-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCardComponent],
      imports: [
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatExpansionModule,
        MatChipsModule,
        BrowserAnimationsModule
      ]
    });
    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    
    // Initialize with a basic user model
    component.user = new UserModel();
    component.user.metadata = new Metadata();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasChangeHistory', () => {
    it('should return false when changeHistory is empty', () => {
      component.user.metadata.changeHistory = [];
      expect(component.hasChangeHistory()).toBe(false);
    });

    it('should return false when changeHistory is undefined', () => {
      component.user.metadata.changeHistory = undefined as any;
      expect(component.hasChangeHistory()).toBe(false);
    });

    it('should return true when changeHistory has entries', () => {
      const entry = new ChangeHistoryEntry();
      entry.timestamp = new Date();
      entry.action = 'created';
      entry.description = 'User registered for event';
      component.user.metadata.changeHistory = [entry];
      expect(component.hasChangeHistory()).toBe(true);
    });
  });

  describe('getActionLabel', () => {
    it('should return Portuguese label for known actions', () => {
      expect(component.getActionLabel('created')).toBe('Criado');
      expect(component.getActionLabel('updated')).toBe('Atualizado');
      expect(component.getActionLabel('checked-in')).toBe('Check-in');
      expect(component.getActionLabel('payment-confirmed')).toBe('Pagamento Confirmado');
    });

    it('should return original action for unknown actions', () => {
      expect(component.getActionLabel('unknown-action')).toBe('unknown-action');
    });
  });

  describe('getActionColor', () => {
    it('should return correct color for known actions', () => {
      expect(component.getActionColor('created')).toBe('primary');
      expect(component.getActionColor('updated')).toBe('accent');
      expect(component.getActionColor('cancelled')).toBe('warn');
    });

    it('should return empty string for unknown actions', () => {
      expect(component.getActionColor('unknown-action')).toBe('');
    });
  });

  describe('audit trail UI', () => {
    it('should not display audit trail when changeHistory is empty', () => {
      component.user.metadata.changeHistory = [];
      fixture.detectChanges();
      
      const accordion = fixture.nativeElement.querySelector('mat-accordion');
      expect(accordion).toBeNull();
    });

    it('should display audit trail when changeHistory has entries', () => {
      const entry = new ChangeHistoryEntry();
      entry.timestamp = new Date('2024-01-01T12:00:00');
      entry.action = 'created';
      entry.description = 'User registered for event';
      component.user.metadata.changeHistory = [entry];
      fixture.detectChanges();
      
      const accordion = fixture.nativeElement.querySelector('mat-accordion');
      expect(accordion).toBeTruthy();
    });
  });
});
