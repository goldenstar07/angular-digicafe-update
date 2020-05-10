import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { DataPassService } from '../data-pass.service';
import { SettingsService } from '../settings.service';
import { Md5 } from "md5-typescript";
import { environment } from '../../environments/environment';
import { AlertController, NavController, LoadingController, Platform } from '@ionic/angular';
import { ReportService } from '../report.service';
import * as firebase from 'firebase/app';
//import { Email } from '@teamhive/capacitor-email';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit {
  myToken: any = null;
  card: any;
  cardDetails: any;
  amount: number = 0;
  currency: any;
  decoded1: any;
  subtotal: number = 0;
  items: any = {};
  coin: string = 'card';
  output: any = 'Card Purchase';
  optionalTax: boolean;
  taxRate: number = 0;
  tax: number = 0;
  userProfile: any;
  business: any;
  businessEmail: string;
  hash: any;
  logo: any;
  stripeId: any = null;
  tx: string;
  receipt: string;
  email: string;
  success: boolean = null;
  loading: any;
  uid: any;
  // paymentAmount: string = '3.33';
  // curr: string = 'USD';
  // currencyIcon: string = '$';

  constructor(//private cardIO: CardIO,
    // private stripe: Stripe,
    // private payPal: PayPal,
    //private barcodeScanner: BarcodeScanner,
    private http: HttpClient,
    public storage: Storage,
    private dataPass: DataPassService,
    private settingsService: SettingsService,
    private alertCtrl: AlertController,
    public reportService: ReportService,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public platform: Platform) { 
      if(this.dataPass.passedItems.usd !== null || 
        this.dataPass.passedItems.usd !== undefined){
        this.subtotal = parseFloat(this.dataPass.passedItems.usd);
      }
      if(this.dataPass.passedItems.list !== null || 
        this.dataPass.passedItems.list !== undefined){
        this.items = this.dataPass.passedItems.list;
        this.output = this.items.map((i: any) => {
          return `Item: ${i.description} Price: ${i.price}` || '';
        });
      }
      if(this.dataPass.passedItems.coin !== null || 
        this.dataPass.passedItems.coin !== undefined){
        this.coin = this.dataPass.passedItems.coin;
      }
        
      this.storage.get('myOptionalTax').then((data) => {
          this.optionalTax = !data ? false : data;
        });   
      
      this.storage.get('myTax').then((data) => {
          if(this.optionalTax === false){
            this.taxRate = 0.00;
            this.tax = this.taxRate * this.subtotal;
            this.amount = this.subtotal + this.tax;
          } else {
            this.taxRate = !data ? 0.00 : data;
            this.tax = this.taxRate * this.subtotal;
            this.amount = this.subtotal + this.tax;
          }
        });

      this.storage.get('myCurrency').then((data) => {
          this.currency = !data ? 'USD' : data;
        });    
  }

  ngOnInit() {

  }

  ionViewWillEnter(){
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.uid = user.uid;
      }
    });       
    this.settingsService
      .getUserProfile()
      .get()
      .then( async userProfileSnapshot => {
        this.userProfile = userProfileSnapshot.data();
        this.stripeId = await this.userProfile.stripeId;
        this.business = await this.userProfile.businessName;
        this.businessEmail = await this.userProfile.businessEmail.toLowerCase();
        this.hash = await this.getLogoHash();
        this.logo = await `https://www.gravatar.com/avatar/${this.hash}.jpg`; 
      }); 
  }

  scanCardStripe(){
    // this.cardIO.canScan()
    //   .then(
    //     (res: boolean) => {
    //       if(res){
    //         let options = {
    //           requireExpiry: true,
    //           requireCVV: true,
    //           requirePostalCode: false,
    //           hideCardIOLogo: true
    //         };
    //         this.cardIO.scan(options)
    //           .then(res => {
    //             console.log(res);
    //             this.stripe.setPublishableKey(environment.stripe_pub);
    //             let cardDetails = {
    //               number: res.cardNumber,
    //               expMonth: res.expiryMonth,
    //               expYear: res.expiryYear,
    //               cvc: res.cvv
    //             }
    //             this.card = res.redactedCardNumber;
    //             this.stripe.createCardToken(cardDetails)
    //               .then(token => {
    //                 console.log(token);
    //                 this.makePayment(token.id);
    //               })
    //               .catch(error => console.error(error));
    //           });
    //       }
    //     }
    //   );
  }

  async getLogoHash(){
    let hash = await Md5.init(this.businessEmail);
    return hash;
  }

  makePayment(token) {
    try{
      this.presentProcessing();
      this.storage.get('myCurrency').then((data) => {
        this.currency = !data ? 'USD' : data;
        console.log(token, this.currency.toLowerCase(), this.amount*100, this.stripeId);
        this.http.post('https://us-central1-stripe-test-api.cloudfunctions.net/payWithStripe/charge', {
            token: token,
            amount: Math.round(this.amount * 100),
            currency: this.currency.toLowerCase(),
            account: this.stripeId
          }).subscribe(async (data: any) => {
            console.log(data);
            if(await data.status === 'succeeded'){
              this.loading.dismiss();
              this.receipt = data.receipt_url;
              this.tx = data.id;
              //this.presentConfirmSuccess();
            } else {
              console.log(data.status);
              this.loading.dismiss();
              this.presentConfirmFail(data.status);
            }
          });
      });  
    } catch(e){
      this.presentConfirmFail(e);
    }
  }

  // async emailSend(details){
  //   const email = new Email();
  //   const hasPermission = await email.hasPermission();
  //   if(!hasPermission){
  //       await email.requestPermission();
  //   }
  //   const available = await email.isAvailable({});
  //   if(available.hasAccount){
  //       email.open({
  //       to: details.to,
  //       subject: details.subject,
  //       body: details.body,
  //       isHtml: true
  //       })
  //   }
  // }


  // payWithPaypal() {
  //   console.log("Pay ????");
  //   this.payPal.init({
  //     PayPalEnvironmentProduction: 'AfAnS-NtHbiSgU_v4vDJrUac_mMkrc8cWhYqzRe7TdINuKs5gMtP_4970rJdDhYuMAi7ipGrmULTdl00',
  //     PayPalEnvironmentSandbox: 'ASXVpcVFJEjOgCi1AGIU8U3QWkJbJA6K-8Z8bTnnZxCaGY6lWyddwv28btk8Vupk7jpTVkTGaE6LA7EU'
  //   }).then(() => {
  //     // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
  //     this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
  //       // Only needed if you get an "Internal Service Error" after PayPal login!
  //       //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
  //     })).then(() => {
  //       let payment = new PayPalPayment(this.paymentAmount, this.curr, 'Description', 'sale');
  //       this.payPal.renderSinglePaymentUI(payment).then((res) => {
  //         console.log(res);
  //         // Successfully paid

  //         // Example sandbox response
  //         //
  //         // {
  //         //   "client": {
  //         //     "environment": "sandbox",
  //         //     "product_name": "PayPal iOS SDK",
  //         //     "paypal_sdk_version": "2.16.0",
  //         //     "platform": "iOS"
  //         //   },
  //         //   "response_type": "payment",
  //         //   "response": {
  //         //     "id": "PAY-1AB23456CD789012EF34GHIJ",
  //         //     "state": "approved",
  //         //     "create_time": "2016-10-03T13:33:33Z",
  //         //     "intent": "sale"
  //         //   }
  //         // }
  //       }, () => {
  //         // Error or render dialog closed without being successful
  //       });
  //     }, () => {
  //       // Error in configuration
  //     });
  //   }, () => {
  //     // Error in initialization, maybe PayPal isn't supported or something else
  //   });
  // }

  // decodeJWT(token){
  //   const secret = environment.jwt_secret;
  //   let decoded = jwt.decode(token, secret);
  //   console.log(decoded, "174");
  //   this.decoded1 = decoded;
  // }

  // scanCardBlock30(){
  //   this.barcodeScanner.scan({
  //     // preferFrontCamera : true, // iOS and Android
  //     showFlipCameraButton : true, // iOS and Android
  //     //showTorchButton : true, // iOS and Android
  //     //torchOn: true, // Android, launch with the torch switched on (if available)
  //     prompt : "Place a barcode inside the scan area", // Android
  //     resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
  //     formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
  //     //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
  //     //disableAnimations : true, // iOS
  //     disableSuccessBeep: true // iOS and Android
  //   }).then(barcodeData => {
  //     console.log('Barcode data', barcodeData);
  //     this.decodeJWT(barcodeData.text);
  //     this.stripe.setPublishableKey(environment.stripe_pub);
  //     let cardDetails = {
  //       number: this.decoded1.cardNumber,
  //       expMonth: this.decoded1.expiryMonth,
  //       expYear: this.decoded1.expiryYear,
  //       cvc: this.decoded1.cvv
  //     }
  //     console.log(cardDetails);
  //     this.card = this.decoded1.redactedCardNumber;
  //     this.stripe.createCardToken(cardDetails)
  //       .then(token => {
  //         console.log(token);
  //         this.makePayment(token.id);
  //       })
  //       .catch(error => console.error(error));
  //   }).catch(err => {
  //       console.log('Error', err);
  //   });
  // }

  // async presentConfirmSuccess() {
  //   let alert = await this.alertCtrl.create({
  //     header: 'Transaction Successful!',
  //     message: 'Would you like a receipt?',
  //     inputs: [
  //       {
  //         name: 'email',
  //         placeholder: 'Customer Email',
  //         type: 'email'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Dismiss',
  //         role: 'cancel',
  //         handler: () => {
  //           this.storeTransactionData();
  //           this.navCtrl.navigateBack('tab2');
  //         }
  //       },
  //       {
  //         text: 'Receipt',
  //         handler: data => {
  //           this.storeTransactionData();
  //           this.email = data.email;
  //           this.emailReceipt(this.email);
  //           this.navCtrl.navigateBack('tab2');
  //         } 
  //       }
  //     ]
  //   });
  //   return await alert.present();
  // }

  async presentConfirmFail(e) {
    let alert = await this.alertCtrl.create({
      header: 'Transaction Error',
      message: `${e}`,
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

  // emailReceipt(data){
  //   let email = {
  //     to: data,
  //     subject: `Your Receipt from ${this.business}`,
  //     body: `Total: ${this.amount} Purchased: ${this.output} TxID: ${this.tx}. Check your receipt here ${this.receipt}. We appreciate your business, ${this.business}.`,
  //     isHtml: true
  //   }
  //   this.emailSend(email);
  // }

  storeTransactionData() {
    let pass = {
      date: Date.now(),
      txId: this.tx,
      usdTotal: this.amount,
      coin: 'card',
      dgbPrice: 0,
      dgbAmount: 0,
      items: this.output
    }; 
    this.reportService.createTransaction(pass);
  }

  async presentProcessing() {
    this.loading = await this.loadingCtrl.create({
      message: 'Processing Transaction...'
    });
    return await this.loading.present();
  }

}


