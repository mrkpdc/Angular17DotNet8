import { Injectable } from '@angular/core';
import { StateService } from '@services/state.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private stateService: StateService,
    private http: HttpClient,
    private router: Router) {
  }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  logIn(username: string, password: string) {
    let body = {
      username: username,
      password: password
    };
    return lastValueFrom(this.http.post<any>('Auth/Login',
      body,
      this.httpOptions)).then(result => {
        //console.log(result);
        let User = {
          username: username,
          claims: result.claims
        }
        this.stateService.setUser(User);
        this.stateService.setClaims(User.claims);
      });
  }

  logOut() {
    return lastValueFrom(this.http.post<any>('Auth/Logout',
      this.httpOptions)).then(result => {
        this.stateService.setUser(null);
        this.stateService.setClaims([]);
        this.router.navigate(['home']);
      });
  }

  checkClaim(claim: string) {
    var claims = this.stateService.getClaims();
    if (claims)
      for (var i = 0; i < claims.length; i++) {
        if ((claims[i]['claimType'] == claim || claims[i]['claimType'] == "CANDOANYTHING") && claims[i]['claimValue'] == "True") {
          return true;
        }
      }
    return false;
  }
}
