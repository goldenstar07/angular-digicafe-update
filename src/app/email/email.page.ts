import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-email',
  templateUrl: './email.page.html',
  styleUrls: ['./email.page.scss'],
})
export class EmailPage implements OnInit {
  public passwordForm: FormGroup;
  public language: string = null;

  constructor(private authService: AuthService,  
    private fb: FormBuilder,
    private route: ActivatedRoute, 
    private router: Router,
    public translate: TranslateService,
    private storage: Storage,
    public alertCtrl: AlertController) {
      this.passwordForm = this.fb.group({
        password: [null, [Validators.required]],
        passwordConfirm: [null, [Validators.required]]
      });

      this.storage.get('language').then((data) => {
        this.language = !data ? null : data;
        this.translate.use(this.language);
      });
      if(!this.language){
        this.translate.setDefaultLang('en');
        this.translate.use('en');
      }
  }

  ngOnInit() {

  }

  handleResetPassword(passwordForm: FormGroup) {
    const auth = firebase.auth();
    const code = this.route.snapshot.queryParams['oobCode'];
    const pw = passwordForm.value.password;
    const pwc = passwordForm.value.passwordConfirm;
    if (pw !== pwc) {
      // react to error
      return;
    } else{
      auth.verifyPasswordResetCode(code).then((email) => {
        console.log(email)
        auth.confirmPasswordReset(code, pw).then(async(resp) =>{
          const alert = await this.alertCtrl.create({
            message: "Log In With New Password",
            buttons: [
              { 
                text: 'Ok',
                handler: () => {
                  this.router.navigateByUrl('/login');
                }
              }
            ],
          });
          await alert.present();
        }).catch(async (error) =>{
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{ text: 'Ok', role: 'cancel' }],
          });
          await alert.present();
        });
      }).catch(async (error) =>{
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }],
        });
        await alert.present();
      });
    }
  }  
}
