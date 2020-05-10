import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public jwt: string = null;
  public loginForm: FormGroup;
  public loading: HTMLIonLoadingElement;
  public language: string = null;
  public languageShow: string = null;

  constructor(private authService: AuthService, 
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private router: Router,
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    private storage: Storage) { 
    //this.jwt = this.authService.digiQR().toString();
    this.loginForm = this.formBuilder.group({
      email: ['',
        Validators.compose([Validators.required, Validators.email])],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });

    // this.storage.get('language').then((data) => {
    //   console.log(data)
    //   this.language = !data ? null : data;
    // });
  }

  ngOnInit() {
    // this.storage.get('language').then((data) => {
    //   console.log(data)
    //   this.language = !data ? null : data;
    //   this.translate.use(this.language);
    // });
    // if(!this.language){
    //   this.translate.setDefaultLang('en');
    //   this.translate.use('en');
    // }
  }

  ionViewWillEnter(){
    this.storage.get('language').then((data) => {
      this.language = !data ? null : data;
      this.translate.use(this.language);
      if(this.language === 'es'){
        this.languageShow = "Español"; 
      } else {
        this.languageShow = "English"
      }
    });
    if(!this.language){
      this.translate.setDefaultLang('en');
      this.translate.use('en');
      this.languageShow = "English"
    }
  }

  saveLanguage(lang){
    this.language = lang.detail.value;
    if(this.language === 'es'){
      this.languageShow = "Español"; 
    }
    this.storage.set('language', this.language);
    this.translate.use(this.language);
  }

  async loginUser(loginForm: FormGroup): Promise<void> {
    if (!loginForm.valid) {
      console.log('Form is not valid yet, current value:', loginForm.value);
    } else {
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
  
      const email = loginForm.value.email;
      const password = loginForm.value.password;
  
      this.authService.loginUser(email, password).then(
        () => {
          this.loading.dismiss().then(() => {
            this.router.navigateByUrl('/tabs/tab3');
          });
        },
        error => {
          this.loading.dismiss().then(async () => {
            const alert = await this.alertCtrl.create({
              message: error.message,
              buttons: [{ text: 'Ok', role: 'cancel' }],
            });
            await alert.present();
          });
        }
      );
    }
  }
}