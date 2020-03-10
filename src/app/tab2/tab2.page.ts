import { Component } from '@angular/core';
import { ModalController, NavController, AlertController, LoadingController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DataPassService } from '../data-pass.service';
import { AddItemsComponent } from '../add-items/add-items.component';
import { SettingsService } from '../settings.service';
import { ChangeDetectorRef } from '@angular/core';
import { MethodComponent } from '../../app/method/method.component'; 

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
  stripeId: string = null;
  public coin: string = null; 
  public dgbBittrexAddress: string;
  public btcBittrexAddress: string;
  public ltcBittrexAddress: string;
  public digibyteAddress: string;
  public bitcoinAddress: string;
  public litecoinAddress: string;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, 
    public loadingCtrl: LoadingController, public storage: Storage,
    public alertCtrl: AlertController, private dataPass: DataPassService,
    private settingsService: SettingsService,  private changeRef: ChangeDetectorRef) {
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
        this.businessEmail = this.userProfile.businessEmail;
        this.btcBittrexAddress = this.userProfile.btcBittrexAddress;
        this.ltcBittrexAddress = this.userProfile.ltcBittrexAddress;
        this.dgbBittrexAddress = this.userProfile.dgbBittrexAddress;
        this.stripeId = this.userProfile.stripeId;
        this.key = this.userProfile.encoded;
          if(!this.digibyteAddress || !this.dgbBittrexAddress){
            this.confirmAddress();
          } 
        });   
    }
    this.storage.get('myCurrency').then((data) => {
        this.currency = !data ? 'USD' : data;
      });
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

  async confirmAddress() {
    const alert = await this.alertCtrl.create({
      header: 'No DigiByte or Bitcoin Address Saved.',
      message: 'Enter DGB/BTC Addresses and Email in Settings',
      buttons: [
        {
          text: 'Settings',
          handler: () => {
            this.navCtrl.navigateForward('/tabs/tab3');
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmStripe() {
    const alert = await this.alertCtrl.create({
      header: 'Stripe is not set up.',
      message: 'You must be logged in and have connected Stripe in the web dashboard.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Dashboard',
          handler: () => {
            location.href = 'https://dash.digibytecafe.com';
          }
        }
      ]
    });
    await alert.present();
  }

  async selectCoin() {
    let addModal = await this.modalCtrl.create({
      component: MethodComponent,
      componentProps: { }
    });
    addModal.onDidDismiss().then((coin: any) => {
      switch(coin.data){
        case "bitcoin":
          if(this.bitcoinAddress || this.btcBittrexAddress){
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toTx();
          }else{
            this.coin = coin.data;
            this.confirmAddressExists();
          }
          break;
        case "litecoin":
          if(this.litecoinAddress || this.ltcBittrexAddress){
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toTx();
          }else{
            this.coin = coin.data;
            this.confirmAddressExists();
          }
          break;  
        case "card":
          if(!this.stripeId){
            this.confirmStripe();
          }else{
            this.coin = coin.data;
            this.storage.set('coin', this.coin);
            this.toCardTx();
          }
          break;             
        case "digibyte":
          if(this.digibyteAddress || this.dgbBittrexAddress){
            this.coin = 'digibyte';
            this.storage.set('coin', this.coin);
            this.toTx();
          } else{
            this.coin = coin.data;
            this.confirmAddressExists();
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
