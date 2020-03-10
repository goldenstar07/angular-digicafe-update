import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthService } from '../auth.service';
import { SettingsService } from '../settings.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CryptoService } from '../crypto.service';
import { ClipboardService } from 'ngx-clipboard';
import * as firebase from 'firebase/app';
import {environment} from '../../environments/environment';
import * as aes256 from 'aes256';

//import 'firebase/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page{

  public business: string = null;
  public businessEmail: string = null;
  public externalAddress: any = null;
  public taxRate: number = null;
  public optionalTax: boolean;
  public currency: string = 'USD';
  public userProfile: any = null;
  public birthDate: Date;
  public businessName: string;
  public digibyteAddress: string;
  public accountEmail: string;
  public loggedin: boolean = false;
  public dgbAddress: string = null;
  public autoSell: boolean = false;
  public btcAddress: string = null;
  public ltcAddress: string = null;
  public dgbBittrexAddress: string;
  public ltcBittrexAddress: string;
  public btcBittrexAddress: string;
  public bittrexKey: any;
  public bittrexSecret: any;
  public partnerAddress: string;
  public uid: any;
  public stripeId: string = null;
  public time: string = null;
  public code: string = null;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public storage: Storage, public toast: ToastController, 
    private authService: AuthService, public loadingCtrl: LoadingController,
    private settingsService: SettingsService, private router: Router, 
    private changeRef: ChangeDetectorRef, public crypto: CryptoService,
    private clipboardService: ClipboardService) {
        
    this.storage.get('myCurrency').then((data) => {
          this.currency = !data ? 'USD' : data;
      });
        
    this.storage.get('myTax').then((data) => {
          this.taxRate = !data ? null : data;
      });

    this.storage.get('myOptionalTax').then((data) => {
        this.optionalTax = !data ? false : data;
      });
      
    this.storage.get('auto-sell').then((data) => {
        this.autoSell= !data ? false : data;
      }); 

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.uid = user.uid;
        this.loggedin = true;
      }
    });       
  }

 ionViewWillEnter() {
    this.changeRef.detectChanges();
    if(this.uid){
      this.settingsService
      .getUserProfile()
      .get()
      .then( userProfileSnapshot => {
        this.userProfile = userProfileSnapshot.data();
        this.loggedin = true;
        this.externalAddress = this.userProfile.digibyteAddress;
        this.business = this.userProfile.businessName;
        this.businessEmail = this.userProfile.businessEmail;
        this.btcAddress = this.userProfile.btcAddress;
        this.ltcAddress = this.userProfile.ltcAddress;
        this.dgbBittrexAddress = this.userProfile.dgbBittrexAddress;
        this.ltcBittrexAddress = this.userProfile.ltcBittrexAddress;
        this.btcBittrexAddress = this.userProfile.btcBittrexAddress;
        this.stripeId = this.userProfile.stripeId;
        this.time = environment.key;
        this.code = `${this.time}${this.uid}`;
        let decrypt: any = this.userProfile.encoded;
        if(decrypt){
          this.bittrexKey = aes256.decrypt(this.code, decrypt.k);
          this.bittrexSecret = aes256.decrypt(this.code, decrypt.s);
        }
      });
    }
  }

  // async setDGB(){
  //   let loading = await this.loadingCtrl.create({
  //     message: 'Creating Wallet...'
  //   });
  //   loading.present();
  //   setTimeout(()=>{
  //     this.crypto.setAddress();
  //     //createLtcBtcDgb(coin, data.Password.trim());
  //     setTimeout(()=>{
  //       this.loadNewWallet();
  //       loading.dismiss();
  //     }, 3000);
  //   },2000);
  // }

  // loadNewWallet(){
  //   this.storage.get('digibyte').then(res =>{
  //     this.dgbAddress = res.address;
  //   })
  // }

  logOut(): void {
    this.authService.logoutUser().then( () => {
      this.loggedin = false;
      this.logoutToast();
      this.router.navigateByUrl('/tabs/tab1');
    });
  }

  // Save BUsiness Info: Email, Name, Currency
  saveCurrency(){
    if(this.uid){
      this.settingsService.updateCurrency(this.currency);
    }
  }

  editOptionalTax(){
    this.storage.set('myOptionalTax', this.optionalTax);
  }

  autoSellActive(){
    this.storage.set('auto-sell', this.autoSell);
  }

  editTaxRate(){
    this.storage.set('myTax', this.taxRate);
  }

  async saveBusiness(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Business Name',
      inputs: [
        {
          type: 'text',
          name: 'businessName',
          placeholder: 'Your Business Name',
          value: this.business,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.business = data.businessName.trim();
            this.storage.set('myBusiness', this.business);
            if(this.uid){
              this.settingsService.updateName(this.business);
            }
            this.presentToast();
          },
        },
      ]
    });
    await alert.present();
  }

  async saveEmail(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Business Email',
      inputs: [
        {
          type: 'text',
          name: 'businessEmail',
          placeholder: 'Your Business Email',
          value: this.businessEmail,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.businessEmail = data.businessEmail.toLowerCase().trim();
            this.storage.set('myBusinessEmail', this.businessEmail);
            if(this.uid){
              this.settingsService.updateBusinessEmail(this.businessEmail);
            }  
            this.presentToast();
          },
        },
      ]
    });
    await alert.present();
  }

  async saveDigiByte(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your DigiByte "D" or "S" Prefix Address',
      inputs: [
        {
          type: 'text',
          name: 'digibyteAddress',
          placeholder: 'Your DigiByte Address',
          value: this.externalAddress,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.externalAddress = data.digibyteAddress.trim();
              if(this.externalAddress.charAt(0) === 'D' ||
                this.externalAddress.charAt(0) === 'S') {
                if(this.uid){
                  this.settingsService.updateDigiByteAddress(this.externalAddress);
                  this.presentToast();
                }
              } else if (this.externalAddress === null || this.externalAddress === ''){
                this.externalAddress = '';
                if(this.uid){
                  this.settingsService.updateDigiByteAddress(this.externalAddress);
                }  
              } else {
                this.externalAddress = '';
                this.addressWarning(data.digibyteAddress);
              }
          },
        },
      ]
    });
    await alert.present();
  }
  async saveLitecoin(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Litecoin "L" or "M" Address',
      inputs: [
        {
          type: 'text',
          name: 'litecoinAddress',
          placeholder: 'Your Litecoin Address',
          value: this.ltcAddress,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.ltcAddress = data.litecoinAddress.trim();
              if(this.ltcAddress.charAt(0) === 'L'||
                this.ltcAddress.charAt(0) === 'M') {
                if(this.uid){
                  this.settingsService.updateLtcAddress(this.ltcAddress);
                }
                this.presentToast();
              } else if (this.ltcAddress === null || this.ltcAddress === ''){
                this.ltcAddress = '';
                if(this.uid){
                  this.settingsService.updateLtcAddress(this.ltcAddress);
                }  
              } else {
                this.ltcAddress = '';
                this.addressWarning(data.litecoinAddress);
              }
          },
        },
      ]
    });
    await alert.present();
  }

  async saveBitcoin(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Bitcoin "1" or "3" Address',
      inputs: [
        {
          type: 'text',
          name: 'bitcoinAddress',
          placeholder: 'Your Bitcoin Address',
          value: this.btcAddress,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.btcAddress = data.bitcoinAddress.trim();
              if(this.btcAddress.charAt(0) === '1'||
                this.btcAddress.charAt(0) === '3') {
                if(this.uid){
                  this.settingsService.updateBtcAddress(this.btcAddress);
                }
                this.presentToast();
              } else if (this.btcAddress === null || this.btcAddress === ''){
                this.btcAddress = '';
                if(this.uid){
                  this.settingsService.updateBtcAddress(this.btcAddress);
                }  
              } else {
                this.btcAddress = '';
                this.addressWarning(data.bitcoinAddress);
              }
          },
        },
      ]
    });
    await alert.present();
  }

  async makeDigiByteBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Requesting DigiByte Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexProvisionAddress('dgb', data).then((res: any) =>{
      console.log(res);
      if (res){
        setTimeout(()=>{
          this.saveDigiByteBittrex();
          loading.dismiss();
        }, 5000);
      } else {
        loading.dismiss();
      }
    }).catch(error => {
      this.addressWarning(error);
      loading.dismiss();
    });
  }

  async saveDigiByteBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Accessing DigiByte Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexGetAddress('dgb', data).then((data: any) =>{
      console.log(data);
      if (data.status === 'PROVISIONED'){
        if(this.uid){
          this.dgbBittrexAddress = data.cryptoAddress;
          this.settingsService.updateDgbBittrexAddress(this.dgbBittrexAddress);
        }else{
          this.dgbBittrexAddress = data.cryptoAddress;
        }
        this.presentToast();
        loading.dismiss();
      } else {
        this.makeDigiByteBittrex();
        loading.dismiss();
      } 
    }).catch(e =>{
      this.addressWarning(e);
      loading.dismiss();
    })
  }

  async makeBitcoinBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Accessing Bitcoin Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexProvisionAddress('btc', data).then((res: any) =>{
      console.log(res, "Hello BTC");
      if (res){
        setTimeout(()=>{
          this.saveBitcoinBittrex();
          loading.dismiss();
        }, 5000);
      } else{
        loading.dismiss();
      }
    }).catch(error => {
      this.addressWarning(error);
      loading.dismiss();
    });
  }

  async saveBitcoinBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Requesting Bitcoin Address'
    });
    loading.present();
    let data = {
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexGetAddress('btc', data).then((data: any) =>{
      if (data.status === 'PROVISIONED'){
        if(this.uid){
          this.btcBittrexAddress = data.cryptoAddress;
          this.settingsService.updateBtcBittrexAddress(this.btcBittrexAddress);
        }else{
          this.btcBittrexAddress = data.cryptoAddress;
        }
        this.presentToast();
        loading.dismiss();
      } else{
        this.makeBitcoinBittrex();
        loading.dismiss();
      }  
    }).catch((e: any) =>{
      this.addressWarning(e);
      loading.dismiss();
    })
  }

  async makeLitecoinBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Accessing Litecoin Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexProvisionAddress('ltc', data).then((res: any) =>{
      console.log(res, "Hello LTC");
      if (res){
        setTimeout(()=>{
          this.saveLitecoinBittrex();
          loading.dismiss();
        }, 5000);
      } else{
        loading.dismiss();
      }
    }).catch(error => {
      this.addressWarning(error);
      loading.dismiss();
    });
  }

  async saveLitecoinBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Requesting Litecoin Address'
    });
    loading.present();
    let data = {
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexGetAddress('ltc', data).then((data: any) =>{
      if (data.status === 'PROVISIONED'){
        if(this.uid){
          this.ltcBittrexAddress = data.cryptoAddress;
          this.settingsService.updateLtcBittrexAddress(this.ltcBittrexAddress);
        }else{
          this.ltcBittrexAddress = data.cryptoAddress;
        }
        this.presentToast();
        loading.dismiss();
      } else{
        this.makeLitecoinBittrex();
        loading.dismiss();
      }  
    }).catch((e: any) =>{
      this.addressWarning(e);
      loading.dismiss();
    })
  }

  // async saveReferral(): Promise<void> {
  //   const alert = await this.alertCtrl.create({
  //     subHeader: 'Your Referral DigiByte "D" or "S" Address',
  //     inputs: [
  //       {
  //         type: 'text',
  //         name: 'partnerAddress',
  //         placeholder: 'Your Referral DigiByte Address',
  //         value: this.partnerAddress,
  //       }
  //     ],
  //     buttons: [
  //       { 
  //         text: 'Cancel', 
  //         role: 'cancel'
  //       }, {
  //         text: 'Save',
  //         handler: (data) => {
  //           this.partnerAddress = data.partnerAddress.trim();
  //             if(this.partnerAddress.charAt(0) === 'D' ||
  //               this.partnerAddress.charAt(0) === 'S') {
  //               this.storage.set('partner', this.partnerAddress);
  //               this.presentToast();
  //             } else if (this.partnerAddress === null || this.partnerAddress === ''){
  //               this.externalAddress = '';
  //               this.storage.set('partner', this.partnerAddress);
  //             } else {
  //               this.partnerAddress = '';
  //               this.addressWarning(data.partnerAddress);
  //             }
  //         },
  //       },
  //     ]
  //   });
  //   await alert.present();
  // }

  async saveBittrexKey(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Bittrex API Key & Secret',
      inputs: [
        {
          type: 'password',
          name: 'bittrexKey',
          placeholder: 'Bittrex Key',
          value: this.bittrexKey,
        },
        {
          type: 'password',
          name: 'bittrexSecret',
          placeholder: 'Bittrex Secret',
          value: this.bittrexSecret,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.bittrexKey = data.bittrexKey.trim();
            this.bittrexSecret = data.bittrexSecret.trim();
              if(this.bittrexKey && this.bittrexSecret && (this.bittrexKey.trim() != this.bittrexSecret.trim())) {
                let key = aes256.encrypt(this.code, this.bittrexKey);
                let secret = aes256.encrypt(this.code, this.bittrexSecret);         
                if(key && secret) {
                  let data = {
                    k: key,
                    s: secret
                  };
                  this.settingsService.updateBit(data);
                  this.saveDigiByteBittrex();
                  this.saveLitecoinBittrex();
                  this.saveBitcoinBittrex();
                  setTimeout(()=>{
                    this.presentToast();
                  },5000);
              } else if (this.bittrexKey === null || this.bittrexKey === ''){
                let data = {
                  key: this.bittrexKey = '',
                  secret: this.bittrexSecret = ''
                };
                this.addressWarning(data);
              }
            }  
          }
        },
      ]
    });
    await alert.present();
  }

  // Present Notifications
  async addressWarning(e) {
    const alert = await this.alertCtrl.create({
      header: 'Incorrect Format',
      subHeader: `${e}: Make sure your address is copied correctly.`,
      message: 'Check and try again.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async bittrexWarning() {
    const alert = await this.alertCtrl.create({
      header: 'Bittrex API Key',
      subHeader: "Activate 'TRADE', 'READ' & 'WITHDRAWAL' on your API key within Bittrex.",
      message: 'Make sure your API key & secret are saved.',
      buttons: ['OK']
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

  async logoutToast() {
    const toast = await this.toast.create({
      message: 'You Are Logged Out',
      position: 'middle',
      duration: 1000,
      color: 'dark',
    });
    toast.present();
  }

  toWallet(){
    this.navCtrl.navigateForward('wallet-send');
  }

  toListMasterPage() {
    this.navCtrl.navigateForward('/tabs/tab2');
  }

  goToHelp() {
      location.href = `http://www.digibytecafe.com/faq/`;  
  }
  
}
