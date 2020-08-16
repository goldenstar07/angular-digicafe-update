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
import {TranslateService} from '@ngx-translate/core';

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
  public currency: string;
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
  public ethAddress: string = null;
  public dgbBittrexAddress: string;
  public ltcBittrexAddress: string;
  public btcBittrexAddress: string;
  public ethBittrexAddress: string;
  public bittrexKey: any;
  public bittrexSecret: any;
  public partnerAddress: string;
  public uid: any;
  public stripeId: string = null;
  public time: string = null;
  public code: string = null;
  public language: string = null;
  public languageShow: string = null;
  public wyreId: string = null;
  public ethWyreAddress: string;
  public btcWyreAddress: string;
  public ethWyreLiquidAddress: string;
  public btcWyreLiquidAddress: string;
  public wyreActive: boolean = false;
  public autoSellWyre: boolean = false;
  public subscription: string;
  public active: string;
  
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public storage: Storage, public toast: ToastController, 
    private authService: AuthService, public loadingCtrl: LoadingController,
    private settingsService: SettingsService, private router: Router, 
    private changeRef: ChangeDetectorRef, public crypto: CryptoService,
    private clipboardService: ClipboardService,
    public translate: TranslateService) {
        
    this.storage.get('myTax').then((data) => {
          this.taxRate = !data ? null : data;
      });

    this.storage.get('myOptionalTax').then((data) => {
        this.optionalTax = !data ? false : data;
      });
      
    this.storage.get('auto-sell').then((data) => {
        this.autoSell= !data ? false : data;
      });

    this.storage.get('wyre-active').then((data) => {
      this.wyreActive= !data ? false : data;
    });
    
    this.storage.get('wyre-liquidate').then((data) => {
      this.autoSellWyre= !data ? false : data;
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
    }      
  }

 ionViewWillEnter() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log(user.emailVerified)
      this.uid = user.uid;
      this.loggedin = true;
    }
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
          this.ethAddress = this.userProfile.ethAddress;
          this.ethWyreAddress = this.userProfile.ethWyreAddress;
          this.btcWyreAddress = this.userProfile.btcWyreAddress;
          this.ethWyreLiquidAddress = this.userProfile.liquidEth;
          this.btcWyreLiquidAddress = this.userProfile.liquidBtc;
          this.dgbBittrexAddress = this.userProfile.dgbBittrexAddress;
          this.ltcBittrexAddress = this.userProfile.ltcBittrexAddress;
          this.btcBittrexAddress = this.userProfile.btcBittrexAddress;
          this.ethBittrexAddress = this.userProfile.ethBittrexAddress;
          this.subscription = this.userProfile.stripeSubscription;
          //this.stripeId = this.userProfile.stripeId;
          this.currency = this.userProfile.currency;
          if(!this.currency){
            this.currency = 'USD';
            this.saveCurrency();
          }
          this.time = environment.key;
          this.code = `${this.time}${this.uid}`;
          let decrypt: any = this.userProfile.encoded;
          if(decrypt && decrypt.k && decrypt.s){
            this.bittrexKey = aes256.decrypt(this.code, decrypt.k);
            this.bittrexSecret = aes256.decrypt(this.code, decrypt.s);
          } else {
            this.bittrexKey = '';
            this.bittrexSecret = '';
            this.autoSell = false;
            this.storage.set('auto-sell', false);
          }
          if(this.subscription){
            this.getSubscriptionStatus(this.subscription);
          }
        }); 
      }
    });
  }

  getSubscriptionStatus(subscription: string){
    this.crypto.checkSubscription(subscription).subscribe((res: any) =>{
      console.log(res)
      if(res.status){
        this.active = res.status;
        if(this.active !== 'active'){
          this.wyreActive = false;
          this.autoSellWyre = false;
          this.storage.set('wyre-active', false);
          this.storage.set('wyre-liquidate', false);
        }
      }
    });
  }

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

  saveLanguage(lang){
    this.language = lang.detail.value;
    if(this.language === 'es'){
      this.languageShow = "Español"; 
    }
    this.storage.set('language', this.language);
    this.translate.use(this.language);
  }

  editOptionalTax(){
    this.storage.set('myOptionalTax', this.optionalTax);
  }

  autoSellActive(){
    this.storage.set('auto-sell', this.autoSell);
    this.wyreActive = false;
    this.autoSellWyre = false;
    this.storage.set('wyre-active', false);
    this.storage.set('wyre-liquidate', false);
  }

  wyreActivate(){
    this.storage.set('wyre-active', this.wyreActive);
    this.autoSell = false;
    this.storage.set('auto-sell', false);
  }

  wyreLiquidate(){
    this.storage.set('wyre-liquidate', this.autoSellWyre);
    this.autoSell = false;
    this.storage.set('auto-sell', false);
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

  async saveEthereum(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Ethereum Address',
      inputs: [
        {
          type: 'text',
          name: 'ethereumAddress',
          placeholder: 'Your Ethereum Address',
          value: this.ethAddress,
        }
      ],
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel'
        }, {
          text: 'Save',
          handler: (data) => {
            this.ethAddress = data.ethereumAddress.trim();
              if(this.ethAddress.charAt(0) === '0') {
                if(this.uid){
                  this.settingsService.updateEthAddress(this.ethAddress);
                  this.presentToast();
                }
              } else if (this.ethAddress === null || this.ethAddress === ''){
                this.ethAddress = '';
                if(this.uid){
                  this.settingsService.updateEthAddress(this.ethAddress);
                }  
              } else {
                this.ethAddress = '';
                this.addressWarning(data.ethereumAddress);
              }
          },
        },
      ]
    });
    await alert.present();
  }

  async saveLitecoin(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your Litecoin Address',
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
                this.ltcAddress.charAt(0) === 'M' ||
                this.ltcAddress.substring(0,4) === 'ltc1') {
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
      subHeader: 'Your Bitcoin Address',
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
                this.btcAddress.charAt(0) === '3' ||
                this.btcAddress.substring(0,3) === 'bc1') {
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

  async makeEthereumBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Requesting Ethereum Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexProvisionAddress('eth', data).then((res: any) =>{
      console.log(res);
      if (res){
        setTimeout(()=>{
          this.saveEthereumBittrex();
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

  async saveEthereumBittrex(): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Accessing Ethereum Address'
    });
    loading.present();
    let data ={
      k: this.bittrexKey,
      s: this.bittrexSecret
    }
    this.crypto.bittrexGetAddress('eth', data).then((data: any) =>{
      console.log(data);
      if (data.status === 'PROVISIONED'){
        if(this.uid){
          this.ethBittrexAddress = data.cryptoAddress;
          this.settingsService.updateEthBittrexAddress(this.ethBittrexAddress);
        }else{
          this.ethBittrexAddress = data.cryptoAddress;
        }
        this.presentToast();
        loading.dismiss();
      } else {
        this.makeEthereumBittrex();
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
            this.bittrexKey = data.bittrexKey ? data.bittrexKey.trim() : null;
            this.bittrexSecret = data.bittrexSecret ? data.bittrexSecret.trim() : null;
            console.log(this.bittrexSecret)
            console.log(this.bittrexKey)
            console.log(this.bittrexKey !== null && this.bittrexSecret !== null);
              if(this.bittrexKey !== null && this.bittrexSecret !== null) {
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
                  this.saveEthereumBittrex();
                  setTimeout(()=>{
                    this.presentToast();
                  },5000);
              } 
            }  else {
              let data = {
                k: this.bittrexKey,
                s: this.bittrexSecret
              };
              this.autoSell = false;
              this.storage.set('auto-sell', this.autoSell);
              this.settingsService.updateBit(data);
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
      location.href = `mailto:support@digitide.us`;  
  }

  // connectUphold(){
  //   location.href = 'https://sandbox.uphold.com/authorize/fe9cf62a23785a443b6915b4007a0eb10364b4f7?scope=accounts:read%20cards:read%20transactions:deposit%20transactions:read%20transactions:transfer:self%20transactions:withdraw';
  // }
  
}
