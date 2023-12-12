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
  selector: 'signalR-component',
  templateUrl: './signalR.component.html',
  styleUrls: ['./signalR.component.less']
})
export class SignalRComponent {
  pageIsLoading: boolean = false;
  private subscriptions: Subject<any> = new Subject();
  private initialSignalRConnectionInterval: any;
  private signalRConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.configService.getBackendUrl() + "signalRHub"
      //, {
      //  httpClient: new CustomHTTPClient(new CustomLogger()),
      //  //  logMessageContent: true
      //}
    )
    .configureLogging(signalR.LogLevel.Information)
    //.withAutomaticReconnect([0, 2000, 10000, 10000, 10000, 10000, 10000, 10000, 30000, 30000, 30000])
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: context => {
        const retryTimes = [0, 2000, 10000, 10000, 10000, 10000, 10000, 10000, 30000, 30000, 30000];
        const index = context.previousRetryCount < retryTimes.length ? context.previousRetryCount : retryTimes.length - 1;
        this.handleSignalRError(context.retryReason);
        //console.log(context);
        return retryTimes[index];
      }
    })
    .build();

  constructor(
    private readonly configService: ConfigService,
    private apiService: ApiService,
    private authService: AuthService,
    private stateService: StateService,
    private logger: NGXLogger) {

    console.log(this.signalRConnection.state);
    this.startSignalR();
  }

  async startSignalR() {
    console.log("startSignalR..");    
    this.initialSignalRConnectionInterval = setInterval(
      async () => {
        if (this.signalRConnection.state === signalR.HubConnectionState.Disconnected) {
          this.pageIsLoading = true;
          console.log("trying initial connection..");
          await this.signalRConnection.start().then(() => {
            console.log("SignalR connected");

            if (this.stateService.getCachedSignalRConnectionId() == '')
              this.stateService.setCachedSignalRConnectionId(this.signalRConnection.connectionId);

            this.signalRConnection.invoke("RegisterClientConnection", this.stateService.getCachedSignalRConnectionId())
              .then(result => {
                //console.log(result);
                this.stateService.setCachedSignalRConnectionId(this.signalRConnection.connectionId);
              });;

            this.signalRConnection.onclose(async (error) => {
              console.log("onclose", error);
              this.handleSignalRError(error);
            });

            this.signalRConnection.onreconnecting((error) => {
              //console.assert(this.signalRConnection.state === signalR.HubConnectionState.Reconnecting);
              console.log("onreconnecting", error);
              this.handleSignalRError(error);
            });

            this.signalRConnection.onreconnected(connectionId => {
              console.log("new Connection ID:", connectionId);
              this.signalRConnection.invoke("RegisterClientConnection", this.stateService.getCachedSignalRConnectionId())
                .then(result => {
                  //console.log(result);
                  this.stateService.setCachedSignalRConnectionId(this.signalRConnection.connectionId);
                });
            });

            this.signalRConnection.on("ReceiveMessage", async (data) => {
              console.log("Received message from SignalR:", data);
            });

            this.pageIsLoading = false;
          }).catch(error => {
            console.log("start", error);
            this.handleSignalRError(error);
          });
        }
        else {
          clearInterval(this.initialSignalRConnectionInterval);
        }
      }, 5000);
  }

  handleSignalRError(error: Error) {
    if (error) {
      this.pageIsLoading = false;
      console.log(error);
      if (error.message.toLowerCase().includes("unauthorized")
        || error.message.includes("401")) {
        this.signalRConnection.stop();
        clearInterval(this.initialSignalRConnectionInterval);
        this.authService.logOut();
      };
    }
  }
  ngOnDestroy() {
    this.signalRConnection.stop();
    clearInterval(this.initialSignalRConnectionInterval);
  }

  //<send messages>
  selectedConnectionId: string = '';
  selectedClientId: string = '';
  selectedUserId: string = ''; //d93bafb1-a5ff-41ce-93b2-01b3137588f4
  messageToSend: string = '';

  sendMessageToBroadcast() {
    this.pageIsLoading = true;
    this.apiService.sendMessageToBroadcast(this.messageToSend)
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (users => {
          this.pageIsLoading = false;
        }),
        error: (error => {
          this.pageIsLoading = false;
          this.logger.error(error);
          this.handleSignalRError(error);
        })
      });
  }
  sendMessageToClient() {
    this.pageIsLoading = true;
    this.apiService.sendMessageToClient(this.selectedClientId, this.messageToSend)
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (users => {
          this.pageIsLoading = false;
        }),
        error: (error => {
          this.pageIsLoading = false;
          this.logger.error(error);
          this.handleSignalRError(error);
        })
      });
  }
  sendMessageToConnection() {
    this.pageIsLoading = true;
    this.apiService.sendMessageToConnection(this.selectedConnectionId, this.messageToSend)
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (users => {
          this.pageIsLoading = false;
        }),
        error: (error => {
          this.pageIsLoading = false;
          this.logger.error(error);
          this.handleSignalRError(error);
        })
      });
  }
  sendMessageToUser() {
    this.pageIsLoading = true;
    this.apiService.sendMessageToUser(this.selectedUserId, this.messageToSend)
      .pipe(takeUntil(this.subscriptions))
      .subscribe({
        next: (users => {
          this.pageIsLoading = false;
        }),
        error: (error => {
          this.pageIsLoading = false;
          this.logger.error(error);
          this.handleSignalRError(error);
        })
      });
  }
  //</send messages>
}
