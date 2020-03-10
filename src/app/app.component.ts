import { Component } from '@angular/core';
import * as firebase from 'firebase/app';
import { Platform, AlertController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    public platform: Platform,
    private alertCtrl: AlertController,
    private network: Network,
    private authService: AuthService
  ) {
    this.initializeApp();
    var config = {
      apiKey: "AIzaSyDsXpRvAqUfGAoN7ArhwdOUKPwJGKlBpLI",
      authDomain: "digicafe-dashboard.firebaseapp.com",
      databaseURL: "https://digicafe-dashboard.firebaseio.com",
      projectId: "digicafe-dashboard",
      storageBucket: "digicafe-dashboard.appspot.com",
      messagingSenderId: "489467683111"
    };
    firebase.initializeApp(config);
  }

  initializeApp(){
    this.platform.ready().then(() => {
      this.listenDisconnect();
      this.listenConnect();
    });
  }

  private listenDisconnect() {
    this.network.onDisconnect()
      .subscribe(async () => {
        await this.showAlert1();
      });
  }

  private listenConnect(){
    this.network.onConnect()
      .subscribe(async () => {
        await this.showAlert2();
      });
  }

  async showAlert1() {
    const alert1 = await this.alertCtrl.create({
      header: 'Network Error',
      subHeader: 'You are not connected to the internet.',
      buttons: ['Check Settings']
    });
    return await alert1.present();
  }

  async showAlert2() {
    const alert2 = await this.alertCtrl.create({
      header: 'Network Connected',
      subHeader: 'Successfully connected to the internet!',
      buttons: ['OK']
    });
    return await alert2.present();
  }

  logOut(){
    this.authService.logoutUser();
  }
}
