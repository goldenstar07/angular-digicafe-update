import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-method',
  templateUrl: './method.component.html',
  styleUrls: ['./method.component.scss']
})
export class MethodComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
  }

  selectCoin(coin: string){
    console.log(coin);
    this.modalCtrl.dismiss(coin);
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
