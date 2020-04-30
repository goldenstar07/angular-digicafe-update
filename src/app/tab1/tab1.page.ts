import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { AuthService } from '../auth.service';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public userProfile: any = null;
  //public loggedin: boolean = false;
  public in: boolean = false;
  public language: string = null;
  constructor(public navCtrl: NavController, 
    public authService: AuthService,
    public translate: TranslateService,
    private storage: Storage) {
      //this.initTranslate();
      this.storage.get('language').then((data) => {
        this.language = !data ? null : data;
        this.translate.use(this.language);
      });
      if(!this.language){
        this.translate.setDefaultLang('en');
        this.translate.use('en');
      }
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

//   initTranslate() {
//     this.translate.addLangs(['en', 'es']);
//     this.translate.setDefaultLang('en');
//     // if (this.translate.getBrowserLang() !== undefined) {
//     //     this.translate.use(this.translate.getBrowserLang());
//     // } else {
//     //     this.translate.use('en'); // Set your language here
//     // }

// }

  useLanguage(language: string) {
    this.translate.use(language);
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
