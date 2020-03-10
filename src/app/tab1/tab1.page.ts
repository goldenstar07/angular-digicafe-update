import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public userProfile: any = null;
  //public loggedin: boolean = false;
  public in: boolean = false;

  constructor(public navCtrl: NavController, public authService: AuthService) {
      this.authCheck();
  }

  ionViewWillEnter(){
    this.authCheck();
  } 

  toSettingsPage() {
    this.navCtrl.navigateForward('/tabs/tab3');
  }

  toLoginPage() {
    this.navCtrl.navigateForward('/login');
  }

  authCheck(){
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user: firebase.User) => {
        if (user) {
          this.in = true;
          console.log(this.in);
          resolve(this.in);
        } else {
          this.in = false;
          console.log(this.in);
          resolve(this.in);
        }
      });
    });
  }

  logOut(): void {
    this.authService.logoutUser().then( () => {
      this.in = false;
    });
  }

}
