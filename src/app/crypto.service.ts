import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as DigiByte from 'digibyte';
import * as explorers from 'digibyte-explorers';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  public coinPrice: string;
  public explorer: string;
  public explorer2: string;
  public currency: string;
  public explorerURL: string;
  public digiAddress: string;
  public address: any;
  public privateKey: any;
  public publicKey: any;
  public dgbAddress: any;
  public feeAddress: any;
  public insight: any = new explorers.Insight();
  public fee: number;
  public satoshis: number;
  public tx: any;
  public exportPrivate: any;
  public exportAddress: any;
  public confirmSuccess: boolean = false;
  public transactionId: any = null;
  public get1: any;
  public status1: any;
  public marketCloud: any;
  public btcCloud: any;
  public minerFee: number;
  public platformFee: number;
  public bittrexUrl: string;

  constructor(private http: HttpClient, public storage: Storage) {
    this.bittrexUrl = 'https://api.bittrex.com/v3/orders';
    this.feeAddress = 'D81DVbT5W7Gsom2764a7ByEwzTSe1vXrod'; 
    this.explorer = 'https://explorer.digibyteapi.com/api/addr/'; 
    this.marketCloud = 'https://us-central1-bittide-1b80d.cloudfunctions.net/api';
    this.coinPrice = 'https://api.coincap.io/v2/assets/digibyte';
    this.currency = 'https://api.exchangeratesapi.io/latest?base=USD';
    this.explorer2 = 'https://digiexplorer.info/api/tx/'              
  }

  getURI(data: any): Observable<Object> {
    return this.http.post(`${this.marketCloud}/uri`, {
      fiat: data.fiat,
      amount: data.amount,
      address: data.address,
      coin: data.coin
    });
  }

  // setAddress(){
  //   this.privateKey = new DigiByte.PrivateKey();
  //   this.dgbAddress = this.privateKey.toAddress();

  //   this.exportPrivate = this.privateKey.toWIF();
  //   this.exportAddress = this.dgbAddress.toString();
  //   let wallet = {
  //     address: this.exportAddress,
  //     pk: this.exportPrivate
  //   };
  //   this.storage.set('digibyte', wallet);
  // }

  public getUtxos(address): Promise<any> {
    return this.http.get(`${this.explorer}${address}/utxo`).toPromise();
  }

  public sellOrder(coin, amount, keys){
    return new Promise((resolve)=>{
        let timestamp = new Date().getTime().toString();
        switch(coin){
          case 'bitcoin':
            coin = 'BTC-USD';
            break;
          case 'litecoin':
            coin = 'LTC-USD';
            break;
          case 'ethereum':
            coin = 'ETH-USD';
            break;    
          default:
            coin = 'DGB-USD';
            break;
        }
        let info = {
          key: keys.k,
          secret: keys.s,
          timestamp: timestamp,
          amount: amount,
          coin: coin
        }
        this.bittrexPost(info).then(res=>{
          resolve(res);
        });
      });
  }

  
  bittrexPost(data): Promise<any>{
    try{
      return this.http.post('https://us-central1-bittrex-auth.cloudfunctions.net/bittrex/trade',data).toPromise();
    }catch(e){
      console.log(e);
    }  
  }

  public getBittrexBalance(coin, keys){
    switch(coin){
      case 'bitcoin':
        coin = 'btc';
        break;
      case 'litecoin':
        coin = 'ltc';
        break;
      case 'ethereum':
        coin = 'eth';
        break;  
      default:
        coin = 'dgb';
        break;      
    }
    return new Promise((resolve)=>{
        let info = {
          key: keys.k,
          secret: keys.s,
          coin: coin
        }
        this.bittrexGet(info).then(res=>{
          resolve(res);
        });
      });
  }

  bittrexGet(data): Promise<any>{
    try{
      return this.http.post('https://us-central1-bittrex-auth.cloudfunctions.net/bittrex/balance',data).toPromise();
    }catch(e){
      console.log(e);
    }  
  }

  public bittrexGetAddress(coin, keys){
    return new Promise((resolve)=>{
        let info = {
          key: keys.k,
          secret: keys.s,
          coin: coin
        }
        this.bittrexAddressRequest(info).then(res=>{
          resolve(res);
        });
      });
  }

  bittrexAddressRequest(data): Promise<any>{
    try{
      return this.http.post('https://us-central1-bittrex-auth.cloudfunctions.net/bittrex/getaddress',data).toPromise();
    }catch(e){
      console.log(e);
    }  
  }

  public bittrexProvisionAddress(coin, keys){
    return new Promise((resolve)=>{
      // this.storage.get('bittrex-key').then((data: any) => {
      //   let key: string = !data ? null : data.key;
      //   let apiSecret: string = !data ? null : data.secret;
        let info = {
          key: keys.k,
          secret: keys.s,
          coin: coin
        }
        this.bittrexAddress(info).then(res=>{
          resolve(res);
        });
    });  
  }

  bittrexAddress(data): Promise<any>{
    try{
      return this.http.post('https://us-central1-bittrex-auth.cloudfunctions.net/bittrex/address',data).toPromise();
    }catch(e){
      console.log(e);
    }  
  }
  

  // async createTransaction(endAddress: string, txWallet: string, referral: string, privateKey: any, amount: number, autoSell: boolean, coin: string) {
  //   return new Promise((resolve)=>{
  //     let Unit = DigiByte.Unit;
  //     this.satoshis = Unit.fromDGB(amount).toSatoshis();
  //     this.getUtxos(txWallet).then(async data => {
  //       let utxos = await data;
  //       if(utxos.length == 0) {
  //         resolve(data);
  //       } else {
  //         let x = 0;
  //         this.tx = new DigiByte.Transaction();
  //         for(var i = 0; i < utxos.length; i++) {
  //           this.tx.from(utxos[i]);
  //           x = x + Unit.fromDGB(utxos[i].amount).toSatoshis(); //(utxos[i].amount * 100000000);
  //           console.log(x);
  //         }
  //         let rate = 10000;
  //         this.minerFee = Math.ceil(utxos.length/6)*rate;
  //         this.platformFee = Math.trunc(this.satoshis * 0.01);
  //         console.log(this.minerFee);
  //         console.log(this.platformFee);
  //         console.log(this.satoshis);
  //         if(x > this.satoshis) {
  //           console.log("X>satoshis");
  //           let amt = this.satoshis - (this.minerFee + this.platformFee);
  //           this.tx.to(endAddress, amt);
  //           if (referral != null){
  //             this.tx.to(this.feeAddress, this.platformFee/2);
  //             this.tx.to(referral, this.platformFee/2);
  //           } else{
  //             this.tx.to(this.feeAddress, this.platformFee);
  //           }
  //           this.tx.fee(this.minerFee);
  //           this.tx.change(txWallet);
  //         } else if(x === this.satoshis){
  //           console.log("X===satoshis");
  //           if (referral != null){
  //             this.tx.to(this.feeAddress, this.platformFee/2);
  //             this.tx.to(referral, this.platformFee/2);
  //           } else{
  //             this.tx.to(this.feeAddress, this.platformFee);
  //           }
  //           //this.tx.to(this.feeAddress, this.platformFee);
  //           this.tx.fee(this.minerFee);
  //           this.tx.change(endAddress);
  //         } else {
  //           let txDetails = {
  //             success: false,
  //             txId: null,
  //           };
  //           resolve(txDetails);
  //         }
  //         this.tx.sign(privateKey);
  //         this.tx.serialize();
  //         this.insight.broadcast(this.tx, (err: any, txId: any) => {
  //           if (txId) {
  //             let txDetails = {
  //               date: Date.now(),
  //               success: true,
  //               txId: txId,
  //               paid: amount
  //             };
  //             if(autoSell === true){
  //               let sat = this.satoshis - (this.minerFee + this.platformFee);
  //               console.log(sat);
  //               let amt = Unit.fromSatoshis(sat).toDGB();
  //               console.log(amt);
  //               console.log(coin);
  //               this.getBittrexBalance(coin).then((res: any) =>{
  //                 console.log(res.available);
  //                 if(amt < parseFloat(res.available)){
  //                   this.sellOrder(coin, amt).then((data: any) =>{
  //                     let order = data.id;
  //                     console.log(order);
  //                   });
  //                 }
  //               });
  //             }
  //             resolve(txDetails);
  //           } else {
  //             const txDetails = {
  //               success: false,
  //               error: err
  //             };
  //             resolve(txDetails);
  //           }
  //         });
  //       }
  //     });
  //   });
  // }

  sellBitcoin(coin, amt, keys){
    return new Promise((resolve)=>{
      this.getBittrexBalance(coin, keys).then((res: any) =>{
        console.log(parseFloat(res.available) >= amt);
        if(parseFloat(res.available) >= amt){
          this.sellOrder(coin, amt, keys).then((data: any) =>{
            let order = data.id;
            console.log(order);
            resolve(order);
          });
        } else {
          resolve(false);
        }
      });
    }); 
  } 

  public getCurrency(): Observable<any> {
    return this.http.get(this.coinPrice);
  }

  async getBalance(address): Promise<any>{
    return this.http.get(`${this.explorer}${address}`).toPromise();
  } 
}
