import { Component, inject, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, firstValueFrom } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CheckInModeService } from './shared/check-in-mode.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'events-register-app-angular';
  private breakpointObserver = inject(BreakpointObserver);
  private checkInModeService = inject(CheckInModeService);

  @ViewChild('drawer') drawer!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  /**
   * Observable for the check-in mode state, used in the template
   */
  checkInMode$: Observable<boolean> = this.checkInModeService.getCheckInModeState();

  /**
   * Handle toggle change event from the UI
   * @param event - MatSlideToggleChange event
   */
  onCheckInModeToggle(event: any): void {
    this.checkInModeService.setCheckInMode(event.checked);
  }

  /**
   * Close the sidenav on mobile devices when navigation occurs
   */
  async closeSidenavOnMobile(): Promise<void> {
    // Check if we're on a mobile device before closing
    const isHandset = await firstValueFrom(this.isHandset$);
    if (isHandset && this.drawer) {
      this.drawer.close();
    }
  }
}
