import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingsService } from '../settings.service';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  constructor( public toast: ToastController, private alertCtrl: AlertController,
    public settingsService: SettingsService) { }

  ngOnInit() {
  }

  async updateEmail(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Change Account Email',
      inputs: [
        { type: 'text', name: 'newEmail', placeholder: 'New Account Email' },
        { name: 'password', placeholder: 'Enter Password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.settingsService
              .updateEmail(data.newEmail, data.password)
              .then(() => {
                this.presentToast();
                console.log('Email Changed Successfully');
              })
              .catch(error => {
                console.log('ERROR: ' + error.message);
              });
          },
        },
      ],
    });
    await alert.present();
  }
  
  async updatePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Change Account Password',
      inputs: [
        { name: 'oldPassword', placeholder: 'Old password', type: 'password' },
        { name: 'newPassword', placeholder: 'New password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.settingsService.updatePassword(
              data.newPassword,
              data.oldPassword
            );
            this.presentToast();
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: 'Data Saved',
      position: 'middle',
      duration: 1000,
      color: 'dark',
    });
    toast.present();
  }

}

