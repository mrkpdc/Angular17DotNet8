import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '@services/config.service';
import { AuthService } from '@services/auth.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private readonly configService: ConfigService,
    private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var updatedRequest = request;
    if (!/^(http|https):/i.test(request.url) && !request.url.startsWith('/assets/')) {
      updatedRequest = request.clone({
        //setHeaders: { 'Content-Type': 'application/json' },
        withCredentials: true,
        url: this.configService.getBackendUrl() + request.url
      });
      //request = request.clone({
      //    withCredentials: true,
      //    url: this._AppConfigService.getServerUrl() + request.url
      //})
    }
    return next.handle(updatedRequest).pipe(catchError(error => {
      if (error.status === 401) {
        this.authService.logOut();
      }
      return throwError(() => error);
    }))
  }
}
