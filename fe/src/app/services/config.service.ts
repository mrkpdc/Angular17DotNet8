import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Configs {
  backendUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: Configs;

  constructor(private http: HttpClient) { }

  loadConfigs() {
    this.http
      .get('/assets/config.json')
      .subscribe((data => {
        this.config =
        {
          backendUrl: data['backendUrl']
        }
      }));
  }

  getConfig() {
    return this.config;
  }

  getBackendUrl() {
    return this.config.backendUrl;
  }
}
