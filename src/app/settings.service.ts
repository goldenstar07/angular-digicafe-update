import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import {AlertController} from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public userProfile: firebase.firestore.DocumentReference;
  public currentUser: firebase.User;

  constructor(public alertCtrl: AlertController) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.firestore().doc(`/userProfile/${user.uid}`);
      } else {
        this.currentUser = null;
      }
    });
  }

  getUserProfile(): firebase.firestore.DocumentReference {
    return this.userProfile;
  }

  updateName(businessName: string): Promise<any> {
    return this.userProfile.update({ businessName });
  }

  updateCurrency(currency: string): Promise<any>{
    return this.userProfile.update({ currency });
  }

  updateBusinessEmail(businessEmail: string): Promise<any> {
    return this.userProfile.update({ businessEmail });
  }

  updateDigiByteAddress(digibyteAddress: string): Promise<any> {
    return this.userProfile.update({ digibyteAddress });
  }

  updateBtcAddress(btcAddress: string): Promise<any> {
    return this.userProfile.update({ btcAddress });
  }

  updateLtcAddress(ltcAddress: string): Promise<any> {
    return this.userProfile.update({ ltcAddress });
  }

  updateEthAddress(ethAddress: string): Promise<any> {
    return this.userProfile.update({ ethAddress });
  }

  updateDgbBittrexAddress(dgbBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ dgbBittrexAddress });
  }

  updateBtcBittrexAddress(btcBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ btcBittrexAddress });
  }

  updateLtcBittrexAddress(ltcBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ ltcBittrexAddress });
  }

  updateEthBittrexAddress(ethBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ ethBittrexAddress });
  }

  updateStripeId(stripeId: string): Promise<any> {
    return this.userProfile.update({ stripeId });
  }

  updateBit(encoded: any): Promise<any> {
    return this.userProfile.update({ encoded });
  }
  
  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      password
    );
  
    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updateEmail(newEmail).then(() => {
          this.userProfile.update({ email: newEmail });
        });
      })
      .catch(async error => {
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }],
        });
        await alert.present();
      });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );
  
    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updatePassword(newPassword).then(() => {
          console.log('Password Changed');
        });
      })
      .catch(async(error) => {
        console.error(error);
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }],
        });
        await alert.present();
      });
  }
}