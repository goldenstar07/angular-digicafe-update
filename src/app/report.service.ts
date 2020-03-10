import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Transaction } from '../app/interfaces/transaction';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  public transactions: any = [];
  public loaded: boolean = false;
  public transactionList: firebase.firestore.CollectionReference;
  public currentUser: firebase.User = null;
 
  constructor(private storage: Storage){
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.transactionList = firebase.firestore().collection(`/userProfile/${user.uid}/txList`);
      }
    });
  }

  getTxList(): firebase.firestore.CollectionReference {
    return this.transactionList; 
  }

  filterItems(searchTerm){
    return this.transactions.filter((transaction) => {
        return transaction.date.indexOf(searchTerm) > -1;
    });    

  }
 
  // load(): Promise<boolean> {
  //   return new Promise((resolve) => {
  //     this.storage.get('txRecords').then((transactions) => {
  //       if(transactions != null){
  //       this.transactions = transactions;
  //       }
  //       this.loaded = true;
  //       resolve(true);
  //     });
  //   });
  // }

  async createTx(pass: any, id: any): Promise<any> {
    const newTxRef: firebase.firestore.DocumentReference = await this.transactionList.add({});
    return newTxRef.update({
      cafeId: id.toString(),
      date: pass.date,
      coin: pass.coin,
      txId: pass.txId,
      usdTotal: pass.usdTotal,
      dgbPrice: pass.dgbPrice,
      dgbAmount: pass.dgbAmount,
      items: pass.items,
      id: newTxRef.id,
    }); 
  }
 
  save(): void {
    this.storage.set('txRecords', this.transactions);
  }
 
  getTransaction(id): Transaction {
    return this.transactions.find(transaction => transaction.id === id);
  }
 
  createTransaction(pass: Transaction): void {
    this.storage.get('txRecords').then((transactions) => {
      this.transactions = !transactions ? [] : transactions;
      let id = Math.max(...this.transactions.map((transaction: any) => parseInt(transaction.id)), 0) + 1;
      this.transactions.push({
        id: id.toString(),
        date: pass.date,
        coin: pass.coin,
        txId: pass.txId,
        usdTotal: pass.usdTotal,
        dgbPrice: pass.dgbPrice,
        dgbAmount: pass.dgbAmount,
        items: pass.items
      });
      this.save();
      if(this.currentUser.uid){
        console.log(pass);
        this.createTx(pass, id);
      }
    });  
  }
 
  deleteReports() {
    this.storage.remove('txRecords');
    this.transactions = [];
    this.save();

  } 
}
