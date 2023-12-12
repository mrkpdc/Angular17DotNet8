import { Component } from '@angular/core';
import { Subject } from 'rxjs';
//import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '@services/config.service';
import { StateService } from '@services/state.service';
import { AuthService } from '@services/auth.service';
import { NGXLogger } from "ngx-logger";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  user: any;
  language: any;
  sideNavIsVisible: boolean = false;
  pageIsLoading: boolean = false;
  private subscriptions: Subject<any> = new Subject();

  constructor(public translateService: TranslateService,
    private configService: ConfigService,
    private stateService: StateService,
    private authService: AuthService,
    //private router: Router,
    private logger: NGXLogger) {

    this.translateService.addLangs(['en', 'it']);
    this.translateService.setDefaultLang('en');

    this.stateService.getLanguage()
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (language => {
          this.language = language;
          this.translateService.use(this.language);
        }),
        error: (error => {
          this.logger.error(error);
        })
      });

    this.configService.loadConfigs();

    this.stateService.getUser()
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (user => {
          this.user = user;
        }),
        error: (error => {
          this.logger.error(error);
        })
      });
  }

  openSideNav(): void {
    this.sideNavIsVisible = true;
  }

  closeSideNav(): void {
    this.sideNavIsVisible = false;
  }

  logout() {
    this.authService.logOut();
  }

  checkClaim(claim) {
    return this.authService.checkClaim(claim);
  }

  changeLanguage(lang) {
    this.translateService.use(lang);
    this.stateService.setLanguage(lang);
  }

  ngOnDestroy(): void {
    this.subscriptions.complete();
  }
}
