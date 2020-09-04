import { Component, NgZone } from '@angular/core';
//import * as firebase from 'firebase/app';
import { Platform, AlertController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
//import {environment} from '../environments/environment';
//import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private router: Router, 
    private zone: NgZone,
    public platform: Platform,
    private alertCtrl: AlertController,
    private network: Network,
    private authService: AuthService
  ) {
    //firebase.initializeApp(environment.firebaseConfig);
    this.initializeApp();
  }

  initializeApp(){
    this.platform.ready().then(() => {
      this.listenDisconnect();
      //this.listenConnect();
      App.addListener('appUrlOpen', (data: any) => {
        this.zone.run(() => {
            const slug = data.url.split(".us").pop();
            if (slug) {
                this.router.navigateByUrl(slug);
            }
        });
    });
    });
  }

  private listenDisconnect() {
    this.network.onDisconnect()
      .subscribe(async () => {
        await this.showAlert1();
      });
  }

  // private listenConnect(){
  //   this.network.onConnect()
  //     .subscribe(async () => {
  //       await this.showAlert2();
  //     });
  // }

  async showAlert1() {
    const alert1 = await this.alertCtrl.create({
      header: 'Network Error',
      subHeader: 'You are not connected to the internet.',
      buttons: ['Check Settings']
    });
    return await alert1.present();
  }

  // async showAlert2() {
  //   const alert2 = await this.alertCtrl.create({
  //     header: 'Network Connected',
  //     subHeader: 'Successfully connected to the internet!',
  //     buttons: ['OK']
  //   });
  //   return await alert2.present();
  // }

  logOut(){
    this.authService.logoutUser();
  }
}
