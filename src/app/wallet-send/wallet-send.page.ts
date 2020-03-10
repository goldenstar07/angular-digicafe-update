import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../crypto.service';
import { Storage } from '@ionic/storage';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-wallet-send',
  templateUrl: './wallet-send.page.html',
  styleUrls: ['./wallet-send.page.scss'],
})
export class WalletSendPage implements OnInit {

  public toAddress: string;
  public address: string;
  public amount: number;
  public balance: number;
  public marketRate: any;
  public dollarVal: any = 0;
  public balanceUSD: any;
  public confirmSuccess: any;
  public pk: string;
  public hide: boolean = true;

  constructor(public crypto: CryptoService, public storage: Storage,
    public alertCtrl: AlertController, public navCtrl: NavController,
    private clipboardService: ClipboardService, public toast: ToastController) { 
      this.storage.get('digibyte').then((data) => {
        this.address = !data ? null : data.address;
        this.pk = !data ? null : data.pk;
        this.crypto.getCurrency()
          .subscribe(res => {
            this.marketRate = res.data;
            this.crypto.getBalance(this.address).then(async data =>{
              this.balance = await data.balance;
              console.log(data);
              this.balanceUSD = this.balance * parseFloat(this.marketRate.priceUsd);
              console.log(this.marketRate);
              console.log(this.balance);
          });
        });
      });
  }

  ngOnInit() {
  }

  // createTx(){
  //   this.storage.get('digibyte').then((data) => {
  //     this.pk = !data ? false : data.pk;
  //     let referral = null;
  //     this.crypto.createTransaction(this.toAddress, this.address, referral , this.pk, this.amount, false, 'digibyte').then( (data: any) => {
  //       if(data.success){
  //         this.presentConfirmSuccess();
  //         this.balance -= this.amount;
  //         console.log(data.success);
  //       }else{
  //         this.presentConfirmFail();
  //       }
  //     });
  //   });
  // }

  useAllFunds(){
    this.amount = this.balance;
    let dollar = this.balance * parseFloat(this.marketRate.priceUsd);
    this.dollarVal = parseFloat(dollar.toFixed(4));
  }

  async presentConfirmSuccess() {
    let alert = await this.alertCtrl.create({
      header: 'Transaction Successful!',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            // this.storeTransactionData();
            // this.balance -= this.qtyCoin;
            //this.confirmSuccess = false;
            this.toAddress = null;
            this.amount = null;
          }
        }
      ]
    });
    return await alert.present();
  }

  async presentConfirmFail() {
    let alert = await this.alertCtrl.create({
      header: 'Transaction Failed',
      message: `Check the Blockexplorer.`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    return await alert.present();
  }

  ifCoinAmount(){
    let dollar = this.amount * parseFloat(this.marketRate.priceUsd);
    this.dollarVal = dollar.toFixed(4);
    if(this.amount <= 0){
      this.dollarVal = 0;
    }
    if(this.amount > this.balance){
      this.promptBalance();
    }
  }

  async promptBalance() {
    let alert = await this.alertCtrl.create({
      header: 'Not Enough Funds',
      message: `Your balance is Ɗ${this.balance}.`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            this.confirmSuccess = false;
          }
        }
      ]
    });
    return await alert.present();
  }

  toWalletReceive() {
    this.navCtrl.navigateForward('wallet-receive');
  }

  toWalletSend() {
    this.navCtrl.navigateForward('wallet-send');
  }

  toWalletBalance() {
    this.navCtrl.navigateBack('tabs/tab3');
  }

  reload(){
    this.storage.get('digibyte').then((data) => {
      this.address = !data ? null : data.address;
      this.crypto.getCurrency()
        .subscribe(res => {
          this.marketRate = res.data;
          this.crypto.getBalance(this.address).then(async data =>{
            this.balance = await data.balance;
            console.log(data);
            this.balanceUSD = this.balance * parseFloat(this.marketRate.priceUsd);
            console.log(this.marketRate);
            console.log(this.balance);
        });
      });
    });
  }

  async promptDelete() {
    let alert = await this.alertCtrl.create({
      header: 'Delete Wallet & Create New',
      message: `This wallet will be deleted and a new one will be generated. Current funds will be lost forever unless you copy the private key or send all funds out.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete and Generate',
          handler: () => {
            //this.crypto.setAddress();
            setTimeout(()=>{
              this.reload();
            }, 3000);
          }
        }
      ]
    });
    return await alert.present();
  }

  hidePk(){
    this.hide = true; 
  }

  showPk(){
    this.hide = false; 
  }

  copyPk(){
    this.clipboardService.copyFromContent(this.pk);
    this.presentToast();
  }

  copyAddress(){
    this.clipboardService.copyFromContent(this.address);
    this.presentToast();
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: 'Copied to clipboard!',
      position: 'middle',
      color: 'light',
      duration: 1000
    });
    toast.present();
  }
}
