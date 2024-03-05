import { Component } from '@angular/core';
import { StateService } from '@services/state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import * as signalR from '@microsoft/signalr';
import { ConfigService } from '@services/config.service';
//import { HttpClient } from '@angular/common/http';
//import { ILogger, LogLevel } from '@microsoft/signalr';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';

//export class CustomLogger implements ILogger {
//  log(logLevel: LogLevel, message: string) {
//    console.log(message);
//  }
//}
//export class CustomHTTPClient extends signalR.DefaultHttpClient {
//  override send(request: signalR.HttpRequest): Promise<signalR.HttpResponse> {
//    console.log(request);
//    //.then(response => { console.log(response); })
//    super.send(request).then(response => {
//      console.log(1111);
//      console.log(response);
//    }).catch(error => {
//      console.log(2222222);
//      console.log(error);
//      console.log((error as Error).message);
//      console.log(JSON.stringify(error));
//    });
//    return super.send(request);
//  }
//}

@Component({
  selector: 'notifications-component',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less']
})
export class NotificationsComponent {
  pageIsLoading: boolean = false;
  
}
