import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponentComponent } from './page-not-found-component/page-not-found-component.component';
import { QrReaderComponent } from './qr-reader/qr-reader.component';

const routes: Routes = [
  {
    path: 'camera',
    loadChildren: () => import('./qr-reader/qr-reader.module').then(m => m.QrReaderModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
  },
  { path: '', redirectTo: '/camera', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    { enableTracing: true } // debug only,
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
