import { Component } from '@angular/core';
import { DataPassService } from '../data-pass.service';
import { Platform, NavController, LoadingController, AlertController } from '@ionic/angular';
import { CryptoService } from '../crypto.service';
import { Storage } from '@ionic/storage';
import { Md5 } from "md5-typescript";
import { ReportService } from '../report.service';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { SettingsService } from '../settings.service';
import * as firebase from 'firebase/app';
import * as io from 'socket.io-client';
import {environment} from '../../environments/environment';
import * as aes256 from 'aes256';
import * as Web3Data from 'web3data-js';

@Component({
  selector: 'app-transact',
  templateUrl: './transact.page.html',
  styleUrls: ['./transact.page.scss'],
})
export class TransactPage {

  business: string = null;
  subtotal: number;
  dgb: any;
  fiat: string;
  altRate: number;
  exgRate: number;
  tx: any;
  order: any;
  searching: boolean = true;
  searching2: boolean = true;
  amount: number;
  address: string;
  owed: number;
  items: any = [];
  output: any;
  email: any;
  businessEmail: string;
  hash: any;
  logo: any;
  taxRate: number;
  finalTax: number;
  optionalTax: boolean;
  uri: string = null;
  counter: number = 1;
  revealButton: boolean = false;
  key: any = 'No funds received yet!';
  public coinData: any; 
  public time: any;
  public price: any;
  public name: any;
  public symbol: any;
  public timeOut: boolean;
  public confirmSuccess: boolean;
  public userProfile: any = null;
  public subtotal2: number = 0;
  public total: number = 0;
  public autoSell: boolean = false;
  public txAddress: string;
  public pk: string;
  public referral: string;
  public coin: string;
  public passData: any;
  public user: any;
  public url: string = 'https://explorer.digibyteapi.com';
  public code: string = null;
  public bittrexKey: any;
  public bittrexSecret: any;
  public w3Key: string = 'UAKcccc4c043fbc857a15efbc5f1319ba98';
  public bID = '';
  public socket: any = null;
  public w3d: any = null;

  constructor(public navCtrl: NavController, public cryptoService: CryptoService,
    public storage: Storage, public dataPass: DataPassService, private settingsService: SettingsService,
    public loadingCtrl: LoadingController, private reportService: ReportService,
    private alertCtrl: AlertController, public emailComposer: EmailComposer, 
    public platform: Platform) {
   
    this.tx = {};
    this.dgb = {};
    this.subtotal = this.dataPass.passedItems.usd;
    this.items = this.dataPass.passedItems.list;
    this.output = this.items.map((i: any) => {
      return `${i.description}`;
    });

    this.storage.get('myAddress').then(async (data) => {
      this.address = !data ? null : data;
    });
    
    this.storage.get('partner').then((data) => {
      this.referral = !data ? null : data;
    }); 

    this.storage.get('myBusiness').then((data) => {
      this.business = !data ? null : data;
    });

    this.storage.get('myBusinessEmail').then((data) => {
      this.businessEmail = !data ? null : data;
    }); 

    this.storage.get('myBusinessEmail').then(async (data) => {
      this.businessEmail = await !data ? null : data;
      this.hash = await this.getLogoHash();
      this.logo = await `https://www.gravatar.com/avatar/${this.hash}.jpg`;
    });
        
    this.storage.get('myOptionalTax').then((data) => {
      this.optionalTax = !data ? false : data;
    });
    
    this.storage.get('myTax').then((data) => {
      if(this.optionalTax === false){
        this.taxRate = null;
      } else {
        this.taxRate = !data ? 0.00 : data;
      }
    });
    
    this.storage.get('auto-sell').then((data) => {
      this.autoSell = !data ? false : data;
    });
    
    this.timeOut = false;

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user.uid;
      }  
    });
  }

  ionViewWillEnter() {
    this.storage.get('coin').then((data) =>{
      this.coin = !data ? "digibyte" : data;
      if(this.user){
        this.settingsService
        .getUserProfile()
        .get()
        .then(async userProfileSnapshot => {
          this.userProfile = userProfileSnapshot.data();
          this.time = environment.key;
          this.code = `${this.time}${this.user}`;
          let decrypt: any = this.userProfile.encoded;
          if(decrypt){
            this.bittrexKey = aes256.decrypt(this.code, decrypt.k);
            this.bittrexSecret = aes256.decrypt(this.code, decrypt.s);
          }
          switch(this.coin){
            case 'digibyte':
              this.address = this.userProfile.digibyteAddress;
              if(this.autoSell){
                this.address = this.userProfile.dgbBittrexAddress;
              }
              break;
            case 'bitcoin':
                this.address = this.userProfile.btcAddress;
              if(this.autoSell){
                this.address = this.userProfile.btcBittrexAddress;
              }
              break;
            case 'litecoin':
              this.address = this.userProfile.ltcAddress;
              this.bID = 'f94be61fd9f4fa684f992ddfd4e92272';
            if(this.autoSell){
              this.address = this.userProfile.ltcBittrexAddress;
              this.bID = 'f94be61fd9f4fa684f992ddfd4e92272';
            }
            break;  
          };
          this.business = this.userProfile.businessName;
          this.businessEmail = this.userProfile.businessEmail;
          this.hash = await this.getLogoHash();
          this.logo = `https://www.gravatar.com/avatar/${this.hash}.jpg`;
          this.storage.get('myCurrency').then((data) => {
            this.fiat = !data ? 'USD' : data;
          });  
          if(this.optionalTax){
            this.finalTax = this.subtotal * this.taxRate;
            this.subtotal2 = this.subtotal;
            this.subtotal = this.subtotal + this.finalTax;
            this.total = this.subtotal2 + this.finalTax;
          } else {
            this.total = this.subtotal;
          }
            this.storage.get('myCurrency').then((data) => {
              this.fiat = !data ? 'USD' : data;
              this.passData = {
                fiat: this.fiat,
                amount: this.subtotal,
                address: this.address,
                coin: this.coin
              }
              console.log(this.passData)
              this.cryptoService.getURI(this.passData).subscribe((res) => {
                if(res){
                  console.log(res);
                  this.coinData = res;
                  this.price = this.coinData.price;
                  this.name = this.coinData.name;
                  this.symbol = this.coinData.symbol;
                  this.amount = parseFloat(this.coinData.amount);
                  //this.generatedAddress = await this.testData.generatedAddress;
                  this.uri = this.coinData.uri;
                  console.log(this.uri);
                  if(this.uri){
                    this.searching = false;
                    this.coinConnect(this.address);
                  }
                }
              }); 
            });  
          //}      
        });
      }
    });                  
  }

  // autoSellBTC(){
  //   this.storage.get('btc-bittrex').then((data)=>{
  //     this.txAddress = !data ? null : data;
  //     this.passData = {
  //       fiat: this.fiat,
  //       amount: this.subtotal,
  //       address: this.txAddress,
  //       coin: this.coin
  //     } 
  //     console.log(this.passData)
  //     this.cryptoService.getURI(this.passData).subscribe((res) => {
  //       if(res){
  //         console.log(res);
  //         this.coinData = res;
  //         this.price = this.coinData.price;
  //         this.name = this.coinData.name;
  //         this.symbol = this.coinData.symbol;
  //         this.amount = parseFloat(this.coinData.amount);
  //         this.uri = this.coinData.uri;
  //         console.log(this.uri);
  //         if(this.uri){
  //           this.searching = false;
  //           this.coinConnect(this.address);
  //         }
  //       }
  //     });  
  //   });
  // }

  // holdBTC(){
  //   this.storage.get('btc-address').then((data)=>{
  //     this.txAddress = !data ? null : data;
  //     this.passData = {
  //       fiat: this.fiat,
  //       amount: this.subtotal,
  //       address: this.txAddress,
  //       coin: this.coin
  //     } 
  //     console.log(this.passData)
  //     this.cryptoService.getURI(this.passData).subscribe((res) => {
  //       if(res){
  //         console.log(res);
  //         this.coinData = res;
  //         this.price = this.coinData.price;
  //         this.name = this.coinData.name;
  //         this.symbol = this.coinData.symbol;
  //         this.amount = parseFloat(this.coinData.amount);
  //         this.uri = this.coinData.uri;
  //         console.log(this.uri);
  //         if(this.uri){
  //           this.searching = false;
  //           this.coinConnect(this.txAddress);
  //         }
  //       }
  //     });  
  //   });
  // }

  // holdDGB(){
  //   this.storage.get('btc-address').then((data)=>{
  //     this.txAddress = !data ? null : data;
  //     this.passData = {
  //       fiat: this.fiat,
  //       amount: this.subtotal,
  //       address: this.txAddress,
  //       coin: this.coin
  //     } 
  //     console.log(this.passData)
  //     this.cryptoService.getURI(this.passData).subscribe((res) => {
  //       if(res){
  //         console.log(res);
  //         this.coinData = res;
  //         this.price = this.coinData.price;
  //         this.name = this.coinData.name;
  //         this.symbol = this.coinData.symbol;
  //         this.amount = parseFloat(this.coinData.amount);
  //         this.uri = this.coinData.uri;
  //         console.log(this.uri);
  //         if(this.uri){
  //           this.searching = false;
  //           this.coinConnect(this.txAddress);
  //         }
  //       }
  //     });  
  //   });
  // }

  ionViewWillLeave(){
    clearInterval(this.time);
    if(this.socket != null){
      this.socket.disconnect();
    }
    if(this.w3d != null){
      this.w3d.disconnect();
    }
  }

  coinConnect(address: string){
    switch(this.coin){
      case 'bitcoin':
        this.socket = new WebSocket("wss://ws.blockchain.info/inv");
        this.socket.onopen = (e) => {
          console.log(e)
          this.socket.send(JSON.stringify({"op":"addr_sub", "addr":`${address}`}))
        };
        this.socket.onmessage =(event) => {
          console.log(`Bitcoin Received: ${event.data}`);
          let data = JSON.parse(event.data);
          data.x.out.find(element =>{
            console.log(element)
            if(element.addr === address){
              let sentAmt = parseFloat(element.value) / 100000000;
              this.tx = data.x.hash;
              console.log(this.tx);
              console.log(sentAmt, this.amount);
              if(sentAmt === this.amount){
                this.searching2 = false;
                this.presentConfirmSuccess(this.tx);
                this.storeTransactionData();
                if(this.autoSell){
                  let data = {
                    k: this.bittrexKey,
                    s: this.bittrexSecret
                  }
                  this.cryptoService.sellBitcoin('bitcoin', this.amount, data).then((res: any)=>{
                    console.log(res);
                  });
                }
              }
            }
          });
          this.socket.close();
        };
        this.socket.onclose = (event) => {
          if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
          } else {
            alert('[close] Connection died');
          }
        };
        break;
        case 'litecoin': case 'ethereum':
        this.w3d = new Web3Data(this.w3Key, { blockchainId: this.bID });
        this.w3d.connect()
        // this.w3d.on({eventName: 'address:transactions', filters: {address: this.address}}, (transaction: any) => {
        //   console.log(transaction);
        // });
        this.w3d.on({eventName: 'address:pending_transactions', filters: {address: this.address}}, (pdtxn: any) => {
          console.log('address:pending_transactions', pdtxn);
          if(this.coin === 'litecoin'){
            pdtxn.outputs.find((element: any)=>{
              console.log(element);
              console.log(element.value / 100000000, this.amount)
              if(element.value / 100000000 === this.amount){
                this.searching2 = false;
                this.tx = pdtxn.hash.toString();
                this.presentConfirmSuccess(pdtxn.hash);
                this.storeTransactionData();
                this.w3d.disconnect();
                if(this.autoSell){
                  let data = {
                      k: this.bittrexKey,
                      s: this.bittrexSecret
                    }
                  this.cryptoService.sellBitcoin(this.coin, this.amount, data).then((res: any)=>{
                    console.log(res);
                  });
                }
              }
            })
          } else {
            if(pdtxn.value/1000000000000000000 === this.amount){
              this.searching2 = false;
              this.tx = pdtxn.hash.toString();
              this.presentConfirmSuccess(pdtxn.hash);
              this.storeTransactionData();
              this.w3d.disconnect();
              if(this.autoSell){
                let data = {
                  k: this.bittrexKey,
                  s: this.bittrexSecret
                }
                this.cryptoService.sellBitcoin(this.coin, this.amount, data).then((res: any)=>{
                  console.log(res);
                });
              }
            }
          }
        });
        break;
      default:  
        let so = io(this.url, {transports: ['websocket']});
        so.on('connect', () => {
          console.log('Connected');
        //socket.emit('subscribe', 'inv') // this together with socket.on("tx",) does work
        so.emit('subscribe', this.address);
        so.on(this.address, (tx: any) => {
            console.log("New transaction received: " + JSON.stringify(tx))
            if(tx){
              this.searching2 = false;
              this.tx = tx.toString();
              this.presentConfirmSuccess(this.tx);
              this.storeTransactionData();
              if(this.autoSell){
                let data = {
                  k: this.bittrexKey,
                  s: this.bittrexSecret
                }
                this.cryptoService.sellBitcoin('digibyte', this.amount, data).then((res: any)=>{
                  console.log(res);
                });
              }
              so.disconnect();
            }
          });
        });
        break;
    }
  }

  // fetchUTXO(address) {
  //   this.searching2 = true;
  //   let count = 0;
  //   this.time = setInterval(() =>{
  //     this.cryptoService.getUtxos(address) 
  //     .then(async data => { 
  //       let temp = await data[0];
  //       if(parseFloat(temp.amount) === this.amount && temp.txid != this.tx) {
  //         this.tx = await temp.txid;
  //         this.searching2 = false;
  //         clearInterval(this.time); 
  //         this.presentConfirmSuccess();
  //         this.storeTransactionData();
  //       } else {
  //         count++;
  //         if(count === 5) {
  //           this.searching2 = false;
  //           clearInterval(this.time);
  //           this.timeOut = true;
  //           this.presentConfirmFail();
  //         }
  //       }
  //     });  
  //   }, 10000);     
  // }

  // createTx(toAddress, txAddress, pk, amount, sell){
  //   this.searching2 = true;
  //   let count = 0;
  //   this.time = setInterval(() =>{
  //     this.cryptoService.createTransaction(toAddress, txAddress, this.referral, pk, amount, sell, this.coin)
  //     .then(async (data: any) => { 
  //       console.log(data);
  //       if(data.success === true) {
  //         this.tx = await data.txId;
  //         this.order = data.order;
  //         this.searching2 = false;
  //         clearInterval(this.time); 
  //         this.presentConfirmSuccess();
  //         this.storeTransactionData();
  //       } else {
  //         count++;
  //         if(count === 5) {
  //           this.searching2 = false;
  //           clearInterval(this.time);
  //           this.timeOut = true;
  //           this.presentConfirmFail();
  //         }
  //       }
  //     });  
  //   }, 8500);     
  // }

  checkBlockchain(address, coin){
    if(coin === 'bitcoin'){
      window.location.href = `https://insight.bitpay.com/address/${address}`;
    } else{
      window.location.href = `https://digiexplorer.info/address/${address}`;
    }
  }


  async getLogoHash(){
    let hash = await Md5.init(this.businessEmail);
    return hash;
  }

  async presentConfirmSuccess(hash) {
    const alert = await this.alertCtrl.create({
      header: 'Transaction Successful!',
      subHeader: hash,
      message: 'Would you like a receipt?',
      inputs: [
        {
          name: 'email',
          placeholder: 'Customer Email',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            this.confirmSuccess = false;
            this.navCtrl.navigateBack('/tabs/tab2');
          }
        },
        {
          text: 'Receipt',
          handler: (data) => {
            this.confirmSuccess = false;
            if(this.platform.is('ios') || this.platform.is('android')){
              this.email = data.email;
              this.emailReceipt(this.email);
            } else {
              let email = {
                to: data,
                subject: `Your Receipt from ${this.business}`,
                body: `<p>Total: ${this.amount} DGB</p>
                <p>Purchased: ${this.output}</p>
                <p>TxID: ${this.tx}.</p>
                <p>Check your transaction on the blockchain at https://digiexplorer.info/tx/${this.tx}.</p>
                <p>We appreciate your business, ${this.business}.</p>`,
                isHtml: true
              }
              this.sendEmail(email);
            }  
            this.navCtrl.navigateBack('/tabs/tab2');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentConfirmFail() {
    const alert = await this.alertCtrl.create({
      header: 'Transaction Not Ready!',
      message: `Retry a Few Times or Email Recovery Key.`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  sendEmail(email) {
    window.location.href = `mailto:${email.to}?subject=${email.subj}&cc=${email.cc}&body=${email.body}`;
  }

  emailReceipt(data){
    // this.storage.get('coin').then((data) =>{
    //   this.coin = !data ? "digibyte" : data;
      if(this.coin === "digibyte"){
        let email = {
          to: data,
          subject: `Your Receipt from ${this.business}`,
          body: `<p>Total: ${this.amount} DGB</p>
          <p>Purchased: ${this.output}</p>
          <p>TxID: ${this.tx}.</p>
          <p>Check your transaction on the blockchain at https://digiexplorer.info/tx/${this.tx}.</p>
          <p>We appreciate your business, ${this.business}.</p>`,
          isHtml: true
        }
        this.emailComposer.open(email);
      } else{
        let email = {
          to: data,
          subject: `Your Receipt from ${this.business}`,
          body: `<p>Total: ${this.amount} BTC</p>
          <p>Purchased: ${this.output}</p>
          <p>TxID: ${this.tx}.</p>
          <p>Check your transaction on the blockchain at https://insight.bitpay.com/tx/${this.tx}.</p>
          <p>We appreciate your business, ${this.business}.</p>`,
          isHtml: true
        }
        this.emailComposer.open(email);
      }
    //});
  }

  storeTransactionData() {
    let pass = {
      date: Date.now(),
      txId: this.tx,
      coin: this.coin,
      usdTotal: this.total,
      dgbPrice: this.price,
      dgbAmount: this.amount,
      items: this.output
    };
    console.log(pass);
    this.reportService.createTransaction(pass);
  }

  async backWarning(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'If customer has paid, wait for confirmation.',
      buttons: [
        {
          text: 'Leave',
          handler: () => {
            this.navCtrl.navigateBack('/tabs/tab2');
          } 
        },
        { 
          text: 'Stay', 
          role: 'cancel'
        }
      ],
    });
    await alert.present();
  }

}
