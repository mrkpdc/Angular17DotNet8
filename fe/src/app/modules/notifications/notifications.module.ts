import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '@services/auth.guard';
import { NgZorroImportsModule } from '../../ngZorroImports.module';
import { NotificationsComponent } from './pages/notifications/notifications.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
    data: {
      claim: 'CanUseNotifications'
    }
  }
];

@NgModule({
  declarations: [
    NotificationsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    TranslateModule,
    CommonModule,
    FormsModule,
    NgZorroImportsModule
  ],
  providers: [],
  exports: []
})
export class NotificationsModule { }
