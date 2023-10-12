import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import awsconfig from '../aws-exports';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
LOAD_WASM().subscribe((res: any) => console.log('LOAD_WASM', res));

import { QrReaderComponent } from './qr-reader/qr-reader.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';


// material
import { MatIconModule} from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatListModule} from '@angular/material/list';
import { UserlistDirective } from './userlist.directive';
import { UserDirective } from './user.directive';

Amplify.configure(awsconfig);
@NgModule({
  declarations: [
    AppComponent,
    QrReaderComponent,
    UserlistDirective,
    UserDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AmplifyAuthenticatorModule,
    BrowserAnimationsModule,
    NgxScannerQrcodeModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatCardModule,
    MatGridListModule,
    HttpClientModule,
    MatListModule
  ],
  providers: [
    AuthInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
     }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
