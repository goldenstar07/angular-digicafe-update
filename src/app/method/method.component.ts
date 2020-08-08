import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-method',
  templateUrl: './method.component.html',
  styleUrls: ['./method.component.scss']
})
export class MethodComponent implements OnInit {
  public language: string = null;
  public wyreActive: boolean = false;
  constructor(public modalCtrl: ModalController,
    private storage: Storage,
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

  ngOnInit() {
    this.storage.get('wyre-active').then((data) => {
      this.wyreActive= !data ? false : data;
    });
  }

  selectCoin(coin: string){
    console.log(coin);
    this.modalCtrl.dismiss(coin);
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
