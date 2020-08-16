import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ItemsService } from '../items.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss']
})
export class AddItemsComponent implements OnInit {

  price: number;
  description: string = '';
  public setItems = [];
  searchTerm: string = '';
  searching: any = false;
  ios: boolean;
  public language: string = 'en';

  constructor(private itemsService: ItemsService, 
    public navCtrl: NavController, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    public storage: Storage, 
    public toast: ToastController, 
    public platform: Platform,
    public translate: TranslateService) {
      this.storage.get('userSet').then((data) => {
        if(data != null){
        this.setItems = data;
        }
      });

      if(this.platform.is('ios')){
        this.ios = true;
      } else {
        this.ios = false;
      }

      this.storage.get('language').then((data) => {
        this.language = !data ? 'en' : data;
        this.translate.use(this.language);
      });
      // if(!this.language){
      //   this.translate.setDefaultLang('en');
      //   this.translate.use('en');
      // }
  }

  ngOnInit() {
  
  }

  setFilteredItems() {
    this.setItems = this.itemsService.filterItems(this.searchTerm);
    this.itemsService.load();
  }

  saveItem(){
    if(this.description === ''){
      this.description = 'item';
    }
    let newItem = {
      price: +this.price,
      description: this.description.toLowerCase()
    };
    this.modalCtrl.dismiss(newItem);
  }

  saveFromUserDefined(item){
    this.modalCtrl.dismiss(item);
  }

  deleteItem(item) {
    this.setItems.splice(this.setItems.indexOf(item), 1);
    this.storage.set('userSet', this.setItems);
  }
  
  async editItem(item){
    let index = this.setItems.indexOf(item);
    let prompt = await this.alertCtrl.create({
        header: 'Edit Item Details',
        inputs: [
          {
            name: 'description',
            placeholder: 'Item Description',
            value: this.setItems[index].description
          },
          {
            name: 'price',
            placeholder: 'Item Price',
            value: this.setItems[index].price
          },
        ],
        buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Save',
              handler: data => {
                  let index = this.setItems.indexOf(item);
                  if(index > -1){
                    console.log(data.price);
                    if(!data.description){
                      this.fieldsWarning();
                    } else {
                      this.setItems[index].price = +data.price;
                      this.setItems[index].description = data.description.toLowerCase();
                      this.storage.set('userSet', this.setItems);
                      this.presentToast();
                    }
                  }
              }
            }
        ]
    });
    return await prompt.present();      
  } 
 
  close(){
    this.modalCtrl.dismiss();
  }

  storeUserDefined() {
    this.setItems.push({
      price: +this.price,
      description: this.description.toLowerCase()
    });
    this.storage.set('userSet', this.setItems);
    this.presentToast();
    this.itemsService.load();
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: 'Item Saved',
      position: 'middle',
      color: 'dark',
      duration: 1500
    });
    toast.present();
  }

  // Present Notifications
  async fieldsWarning() {
    const alert = await this.alertCtrl.create({
      header: 'No Blank Fields',
      subHeader: 'Please Complete All Input Fields.',
      message: 'Try Again.',
      buttons: ['OK']
    });

    await alert.present();
  }

}
