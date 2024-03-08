import { Injectable } from '@angular/core';
import { ConfigService } from '@services/config.service';
import * as signalR from '@microsoft/signalr';
import { StateService } from '@services/state.service';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '@services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private backendUrl: string;
  private initialSignalRConnectionInterval: any;
  private signalRConnection: any;
  private subscriptions: Subject<any> = new Subject();

  constructor(private readonly configService: ConfigService,
    private authService: AuthService,
    private stateService: StateService,
    private logger: NGXLogger) {
  }

  startSignalR() {
    //console.log("signalrconnection", this.signalRConnection);
    if (!this.signalRConnection) {
      this.stateService.getConfig()
        .pipe(takeUntil(this.subscriptions))
        .subscribe({
          next: (config => {
            //console.log("config", config);
            if (config && config.backendUrl) {
              this.backendUrl = config.backendUrl;
              this.buildSignalRConnection();
            }
          }),
          error: (error => {
            this.logger.error(error);
          })
        });
    }
    else
      this.connectSignalR();
  }

  private buildSignalRConnection() {
    //console.log("building signalr connection..");
    if (!this.signalRConnection) {
      this.signalRConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.backendUrl + "signalRHub"
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
        this.stateService.setHasNotifications(true);
      });
    }
    if (this.signalRConnection)
      this.connectSignalR();
  }

  private connectSignalR() {
    //console.log("connect signalr !");
    //console.log(this.initialSignalRConnectionInterval);
    if (this.signalRConnection && this.signalRConnection.state === signalR.HubConnectionState.Disconnected) {
      //console.log("connection already exists !");
      //console.log(this.initialSignalRConnectionInterval);
      if (this.initialSignalRConnectionInterval) {
        //console.log("clearing interval");
        clearInterval(this.initialSignalRConnectionInterval);
        this.initialSignalRConnectionInterval = null;
      }
      if (!this.initialSignalRConnectionInterval) {
        //console.log("creating new interval");

        let signalRConnectionFunction = async () => {
          console.log("signalr function");
          //console.log("connection", this.signalRConnection);
          //if (this.signalRConnection)
          //  console.log("connection state", this.signalRConnection.state);
          if (this.signalRConnection && this.signalRConnection.state === signalR.HubConnectionState.Disconnected) {
            //console.log("trying initial connection..");
            await this.signalRConnection.start().then(() => {
              //console.log("SignalR connected");
              if (this.stateService.getCachedSignalRConnectionId() == '')
                this.stateService.setCachedSignalRConnectionId(this.signalRConnection.connectionId);

              this.signalRConnection.invoke("RegisterClientConnection", this.stateService.getCachedSignalRConnectionId())
                .then(result => {
                  //console.log(result);
                  this.stateService.setCachedSignalRConnectionId(this.signalRConnection.connectionId);
                });
            }).catch(error => {
              console.log("start", error);
              this.handleSignalRError(error);
            });
          }
          else {
            //console.log("clear interval !");
            clearInterval(this.initialSignalRConnectionInterval);
            this.initialSignalRConnectionInterval = null;
          }
        };
        signalRConnectionFunction();
        this.initialSignalRConnectionInterval = setInterval(signalRConnectionFunction, 5000);
      }
    }
  }

  handleSignalRError(error: Error) {
    if (error) {
      console.log(error);
      if (error.message.toLowerCase().includes("unauthorized")
        || error.message.includes("401")) {
        //console.log("stop and logout signalr !");
        //if (!this.getIsSignalRDisconnected()) {
        //  console.log("connection", this.signalRConnection);
        //  console.log("connection state", this.signalRConnection.state);
        this.stopSignalR();
        this.authService.logOut();
        //}
      }
      else
        this.logger.error(error);
    }
  }

  stopSignalR() {
    if (this.signalRConnection) {
      //console.log("stopping connection !");
      this.signalRConnection.stop();
    }
    //if (this.initialSignalRConnectionInterval) {
    //console.log("clearing interval !");
    clearInterval(this.initialSignalRConnectionInterval);
    this.initialSignalRConnectionInterval = null;
    //}
  }

  //getIsSignalRDisconnected() {
  //  let isDisconnected = false;
  //  if (!this.signalRConnection ||
  //    (this.signalRConnection && this.signalRConnection.state === signalR.HubConnectionState.Disconnected))
  //    isDisconnected = true;
  //  return isDisconnected;
  //}

  ngOnDestroy(): void {
    //console.log("destroy signalr service");
    this.stopSignalR();
    this.subscriptions.next({});
    this.subscriptions.complete();
  }
}
