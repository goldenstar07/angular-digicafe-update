import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';

import { EmailPageRoutingModule } from './email-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { EmailPage } from './email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    EmailPageRoutingModule
  ],
  declarations: [EmailPage]
})
export class EmailPageModule {}
