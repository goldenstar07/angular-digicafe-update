import { Component } from '@angular/core';
import { ModalController, NavController, AlertController, LoadingController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DataPassService } from '../data-pass.service';
import { AddItemsComponent } from '../add-items/add-items.component';
import { SettingsService } from '../settings.service';
import { ChangeDetectorRef } from '@angular/core';
import { MethodComponent } from '../../app/method/method.component'; 
import {TranslateService} from '@ngx-translate/core';
import {WyreService} from '../wyre.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public items = [];
  public sum: number = 0.00;
  params: Object;
  externalAddress: any;
  currency: any;
  businessEmail: any;
  userProfile: any;
  business: any;
  key: any;
  // stripeId: string = null;
  public coin: string = null; 
  public dgbBittrexAddress: string = null;
  public btcBittrexAddress: string = null;
  public ltcBittrexAddress: string = null;
  public ethBittrexAddress: string = null;
  public digibyteAddress: string = null;
  public bitcoinAddress: string = null;
  public litecoinAddress: string = null;
  public ethereumAddress: string = null;
  public language: string = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, 
    public loadingCtrl: LoadingController, public storage: Storage,
    public alertCtrl: AlertController, private dataPass: DataPassService,
    private settingsService: SettingsService,
    public wyre: WyreService,  
    private changeRef: ChangeDetectorRef,
    public translate: TranslateService) {
      this.storage.get('language').then((data) => {
        this.language = !data ? null : data;
        this.translate.use(this.language);
      });
      if(!this.language){
        this.translate.setDefaultLang('en');
        this.translate.use('en');
      }
  }

  ionViewWillEnter() {
    this.reset();
    this.changeRef.detectChanges();
    if(this.settingsService.currentUser){
      this.settingsService
      .getUserProfile()
      .get()
      .then( userProfileSnapshot => {
        this.userProfile = userProfileSnapshot.data();
        this.digibyteAddress = this.userProfile.digibyteAddress;
        this.bitcoinAddress = this.userProfile.btcAddress;
        this.litecoinAddress = this.userProfile.ltcAddress;
        this.ethereumAddress = this.userProfile.ethAddress;
        this.businessEmail = this.userProfile.businessEmail;
        this.btcBittrexAddress = this.userProfile.btcBittrexAddress;
        this.ltcBittrexAddress = this.userProfile.ltcBittrexAddress;
        this.dgbBittrexAddress = this.userProfile.dgbBittrexAddress;
        this.ethBittrexAddress = this.userProfile.ethBittrexAddress;
        this.key = this.userProfile.encoded;
      });   
    }
    this.storage.get('myCurrency').then((data) => {
        this.currency = !data ? 'USD' : data;
      });
    
    //this.wyre.createAccount();
  }

  async addItem() {
    const addModal = await this.modalCtrl.create({
      component: AddItemsComponent,
      componentProps: { }
    });
    addModal.onDidDismiss().then((item: any) => {
      if (item.data) {
        this.saveItem(item.data);
      }
    });
    return await addModal.present();
  }

  saveItem(item) {
    this.items.push(item);
    this.calculatePrice();
  }

  deleteItem(item) {
    this.items.splice(this.items.indexOf(item), 1);
    this.calculatePrice();
  }

  calculatePrice() {
    this.sum = this.items.reduce((total, item) => {
    return total + item.price;
    }, 0);
  }

  toTx() {
    let subtotal = {
      usd: this.sum,
      list: this.items
    };
    this.dataPass.passedItems = subtotal;
    this.navCtrl.navigateForward('transact');
    this.reset();
  }

  toCardTx() {
    let subtotal = {
      usd: this.sum,
      list: this.items
    };
    this.dataPass.passedItems = subtotal;
    this.navCtrl.navigateForward('card');
    this.reset();
  }

  reset() {
    this.items = [];
    this.calculatePrice();
  }

  // async confirmAddress() {
  //   const alert = await this.alertCtrl.create({
  //     header: 'No DigiByte or Bitcoin Address Saved.',
  //     message: 'Enter a DGB/LTC/BTC Addresses in Settings',
  //     buttons: [
  //       {
  //         text: 'Settings',
  //         handler: () => {
  //           this.navCtrl.navigateForward('/tabs/tab3');
  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

  // async confirmStripe() {
  //   const alert = await this.alertCtrl.create({
  //     header: 'Stripe is not set up.',
  //     message: 'You must be logged in and have connected Stripe in the web dashboard.',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Confirm Cancel');
  //         }
  //       },
  //       {
  //         text: 'Dashboard',
  //         handler: () => {
  //           location.href = 'https://dash.digibytecafe.com';
  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

  async selectCoin() {
    let addModal = await this.modalCtrl.create({
      component: MethodComponent,
      componentProps: { }
    });
    addModal.onDidDismiss().then((coin: any) => {
      switch(coin.data){
        case "bitcoin":
          if(!this.bitcoinAddress){
            this.coin = coin.data;
            this.confirmAddressExists();
          }else{
            console.log(coin.data)
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toTx();
          }
          break;
        case "litecoin":
          if(!this.litecoinAddress){
            this.coin = coin.data;
            this.confirmAddressExists();
          }else{
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toTx();
          }
          break;            
        case "digibyte":
          if(!this.digibyteAddress){
            this.coin = coin.data;
            this.confirmAddressExists();
          } else{
            this.coin = 'digibyte';
            this.storage.set('coin', this.coin);
            this.toTx();
          }
          break;
        case "ethereum": case "tether":
          if(!this.ethereumAddress){
            this.coin = coin.data;
            this.confirmAddressExists();
          } else{
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toTx();
          }
          break; 
        case "usdc":
          if(!this.ethereumAddress){
            this.coin = 'usd-coin';
            this.confirmAddressExists();
          } else{
            this.coin = 'usd-coin';
            this.storage.set('coin', this.coin);
            this.toTx();
          }
          break;    
        default:
          this.coin = 'digibyte';
          this.storage.set('coin', this.coin);
          break;
      }
    });
    addModal.present();
  }

  async confirmAddressExists() {
    const alert = await this.alertCtrl.create({
      header: `You need a ${this.coin} Address.`,
      message: `Enter ${this.coin} Address in Settings`,
      buttons: [
        {
          text: 'Settings',
          handler: () => {
            this.navCtrl.navigateForward('tabs/tab3');
          }
        }
      ]
    });
    alert.present();
  }
}
