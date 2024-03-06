import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StateService } from './state.service';

export interface Configs {
  backendUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: Configs;

  constructor(private http: HttpClient,
    private stateService: StateService) { }

  loadConfigs() {
    this.http
      .get('/assets/config.json')
      .subscribe((data => {
        this.config =
        {
          backendUrl: data['backendUrl']
        }
        this.stateService.setConfig(data);
      }));
  }

  getConfig() {
    return this.config;
  }

  getBackendUrl() {
    return this.config.backendUrl;
  }
}
