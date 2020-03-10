import { Component } from '@angular/core';
import { Platform, NavController, ModalController, AlertController, ToastController } from '@ionic/angular';
import { ReportService } from '../report.service';
import { Storage } from '@ionic/storage';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
//import { File } from '@ionic-native/file/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '../settings.service';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

const { Filesystem } = Plugins;

@Component({
  selector: 'app-items',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
})
export class Tab4Page {

  public transactions: any = [];
  public searchTerm: any;
  public searching: any = false;
  public sum: number = 0.00;
  public dgbSum: number = 0.00;
  public btcSum: number = 0.00;
  public canEmail: boolean = false;
  public businessEmail: string;
  public userProfile: any;
  public cardSum: number = 0.00;

  constructor(public storage: Storage, public reportService: ReportService, public navCtrl: NavController, 
    public modalCtrl: ModalController, public alertCtrl: AlertController, public toast: ToastController, 
    public emailComposer: EmailComposer, public platform: Platform, 
    private changeRef: ChangeDetectorRef, private settingsService: SettingsService) { 
    
    // this.storage.get('myBusinessEmail').then((data) => {
    //   this.businessEmail = data;
    // }); 
  }

  ionViewWillEnter() {
    this.storage.get('txRecords').then((data) => {
      if(data){
        this.transactions = data;
        this.calculateSales();
        this.calculateDGB();
        this.calculateBTC();
        this.calculateCard();
      } else {
        this.transactions = [];
      }
    });
  }

  onSearchInput(){
    this.searching = true;
  }

  // setFilteredItems() {
  //   this.searching = false;
  //   this.transactions = this.reportService.filterItems(this.searchTerm);
  // }

  calculateSales() {
    this.sum = this.transactions.reduce((total, transaction) => {
    return total + transaction.usdTotal;
    }, 0);
  }

  calculateDGB() {
    let transactions = this.filterCoins('digibyte');
    this.dgbSum = transactions.reduce((total, transaction) => {
    return total + transaction.dgbAmount;
    }, 0);
  }

  calculateBTC() {
    let transactions = this.filterCoins('bitcoin');
    this.btcSum = transactions.reduce((total, transaction) => {
    return total + transaction.dgbAmount;
    }, 0);
  }

  calculateCard() {
    let transactions = this.filterCoins('card');
    this.cardSum = transactions.reduce((total, transaction) => {
    return total + transaction.usdTotal;
    }, 0);
  }

  filterCoins(searchTerm){
    return this.transactions.filter((transaction) => {
        return transaction.coin.indexOf(searchTerm) > -1;
    });    
  }
  
  convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
  }

  downloadCSV() {  
    let data, filename, link;
    let csv = this.convertArrayOfObjectsToCSV({
        data: this.transactions
    });
    console.log(csv);
    if (csv == null) return;
    filename = 'DigiCafeExport.csv';

    if(this.platform.is('ios') || this.platform.is('android')) {
      this.testEmail(filename, csv);
    } else {
      if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
      }
      data = encodeURI(csv);

      link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);
      link.click();
    }
  }  

  testEmail(filename, data) {
    try {
      Filesystem.writeFile({
        path: filename,
        data: data,
        encoding: FilesystemEncoding.ASCII,
        directory: FilesystemDirectory.Documents,
      }).then((res) =>{
        Filesystem.getUri({
          directory: FilesystemDirectory.Documents,
          path: filename
        }).then(result => {
          console.log("URI:", result);
          let email = {
            to: this.businessEmail,
            attachments: [result.uri],
            subject: "Your DigiCafe Report",
            body: "Your exported transaction report.",
            isHtml: true
          };
          console.log(res);
          this.emailComposer.open(email);
        });
      });
    } catch(e) {
      console.error('Unable to write file', e);
    }
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'This Will DELETE All Transaction Records.',
      message: `Are you sure?`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'DELETE',
          handler: () => {
            this.reportService.deleteReports();
            this.transactions = [];
            this.sum = 0.00;
            this.dgbSum = 0.00;
            this.btcSum = 0.00;
          }
        },
      ]
    });
    await alert.present();
  }

}
