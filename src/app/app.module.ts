import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import awsconfig from '../aws-exports';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';

// material
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

import { RouterModule } from '@angular/router';
import { QrReaderComponent } from './qr-reader/qr-reader.component';
import { ReportsComponent } from './reports/reports.component';
import { SearchComponent } from './search/search.component';
import { UserCardComponent } from './shared/user-card/user-card.component';
import { UserEditFormComponent } from './shared/user-edit-form/user-edit-form.component';
import { CheckInStatusCardsComponent } from './shared/check-in-status-cards/check-in-status-cards.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

Amplify.configure(awsconfig);
@NgModule({ declarations: [
        AppComponent,
        QrReaderComponent,
        UserCardComponent,
        UserEditFormComponent,
        CheckInStatusCardsComponent,
        ReportsComponent,
        SearchComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AmplifyAuthenticatorModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatCardModule,
        MatGridListModule,
        MatListModule,
        MatSidenavModule,
        MatProgressBarModule,
        ZXingScannerModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatChipsModule,
        RouterModule.forRoot([
            { path: 'camera', component: QrReaderComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'search', component: SearchComponent },
            { path: '', redirectTo: '/search', pathMatch: 'full' }
        ], { enableTracing: false })], providers: [
        AuthInterceptor,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
