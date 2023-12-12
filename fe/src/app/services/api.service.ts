import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {
    this.getUsers("", "");
  }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  //<users>
  getUsers(username: string, email: string) {
    let body = {
      username: username,
      email: email
    };
    return this.http.post<any>('Auth/GetUsers', body, this.httpOptions);
  }
  insertUser(userName: string, email: string, password: string, confirmPassword: string) {
    let body = {
      userName: userName,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };
    return this.http.post<any>('Auth/InsertUser', body, this.httpOptions);
  }
  updateUser(userID: string, userName: string, email: string, password: string) {
    let body = {
      userID: userID,
      userName: userName,
      email: email,
      password: password
    };
    return this.http.post<any>('Auth/UpdateUser', body, this.httpOptions);
  }
  deleteUser(userId: string) {
    let body = {
      userID: userId
    };
    return this.http.post<any>('Auth/DeleteUser', body, this.httpOptions);
  }
  addClaimToUser(userId: string, claimType: string, claimValue: string) {
    let body = {
      userId: userId,
      claimType: claimType,
      claimValue: claimValue
    };
    return this.http.post<any>('Auth/AddClaimToUser', body, this.httpOptions);
  }
  removeClaimFromUser(userId: string, claimType: string, claimValue: string) {
    let body = {
      userId: userId,
      claimType: claimType,
      claimValue: claimValue
    };
    return this.http.post<any>('Auth/RemoveClaimFromUser', body, this.httpOptions);
  }
  getAvailableClaimsForUser(userId: string) {
    let body = {
      userID: userId
    };
    return this.http.post<any>('Auth/GetAvailableClaimsForUser', body, this.httpOptions);
  }
  getAvailableRolesForUser(userId: string) {
    let body = {
      userID: userId
    };
    return this.http.post<any>('Auth/GetAvailableRolesForUser', body, this.httpOptions);
  }
  addRoleToUser(userId: string, roleName: string) {
    let body = {
      userID: userId,
      roleName: roleName
    };
    return this.http.post<any>('Auth/AddRoleToUser', body, this.httpOptions);
  }
  removeRoleFromUser(userId: string, roleName: string) {
    let body = {
      userID: userId,
      roleName: roleName
    };
    return this.http.post<any>('Auth/RemoveRoleFromUser', body, this.httpOptions);
  }
  //</users>
  //<roles>
  getRoles(roleName: string) {
    let body = {
      roleName: roleName
    };
    return this.http.post<any>('Auth/GetRoles', body, this.httpOptions);
  }
  insertRole(roleName: string) {
    let body = {
      roleName: roleName
    };
    return this.http.post<any>('Auth/InsertRole', body, this.httpOptions);
  }
  updateRole(roleId: string, roleName: string) {
    let body = {
      roleId: roleId,
      roleName: roleName
    };
    return this.http.post<any>('Auth/UpdateRole', body, this.httpOptions);
  }
  deleteRole(roleId: string) {
    let body = {
      roleID: roleId
    };
    return this.http.post<any>('Auth/DeleteRole', body, this.httpOptions);
  }
  addClaimToRole(roleId: string, claimType: string, claimValue: string) {
    let body = {
      roleID: roleId,
      claimType: claimType,
      claimValue: claimValue
    };
    return this.http.post<any>('Auth/AddClaimToRole', body, this.httpOptions);
  }
  removeClaimFromRole(roleId: string, claimType: string, claimValue: string) {
    let body = {
      roleID: roleId,
      claimType: claimType,
      claimValue: claimValue
    };
    return this.http.post<any>('Auth/RemoveClaimFromRole', body, this.httpOptions);
  }
  getAvailableClaimsForRole(roleId: string) {
    let body = {
      roleID: roleId
    };
    return this.http.post<any>('Auth/GetAvailableClaimsForRole', body, this.httpOptions);
  }
  //</roles>
}
