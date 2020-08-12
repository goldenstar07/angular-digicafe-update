import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from "@ionic/storage"; 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public signupForm: FormGroup;
  public loading: any;
  public language: string = null;
  public languageShow = null;
  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private router: Router,
    private storage: Storage,
    public translate: TranslateService
  ) {
    this.signupForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        '',
        Validators.compose([Validators.minLength(6), Validators.required]),
      ],
    });
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

  ngOnInit() {}

  async signupUser(signupForm: FormGroup): Promise<void> {
    if (!signupForm.valid) {
      console.log(
        'Need to complete the form, current value: ', signupForm.value
      );
    } else {
      const email: string = signupForm.value.email;
      const password: string = signupForm.value.password;
      this.authService.signupUser(email, password).then(
        () => {
          this.loading.dismiss().then(() => {
            this.router.navigateByUrl('login');
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
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
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

}
