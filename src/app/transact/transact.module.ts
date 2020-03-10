import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TransactPage } from './transact.page';
import { QRCodeModule } from 'angularx-qrcode';

const routes: Routes = [
  {
    path: '',
    component: TransactPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    QRCodeModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransactPage]
})
export class TransactPageModule {}
