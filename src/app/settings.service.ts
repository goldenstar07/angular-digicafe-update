import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public userProfile: firebase.firestore.DocumentReference;
  public currentUser: firebase.User;

  constructor() {
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

  updateDgbBittrexAddress(dgbBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ dgbBittrexAddress });
  }

  updateBtcBittrexAddress(btcBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ btcBittrexAddress });
  }

  updateLtcBittrexAddress(ltcBittrexAddress: string): Promise<any> {
    return this.userProfile.update({ ltcBittrexAddress });
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
      .reauthenticateAndRetrieveDataWithCredential(credential)
      .then(() => {
        this.currentUser.updateEmail(newEmail).then(() => {
          this.userProfile.update({ email: newEmail });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );
  
    return this.currentUser
      .reauthenticateAndRetrieveDataWithCredential(credential)
      .then(() => {
        this.currentUser.updatePassword(newPassword).then(() => {
          console.log('Password Changed');
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
}