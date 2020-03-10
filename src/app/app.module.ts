import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { AddItemsComponent } from './add-items/add-items.component';
import { MethodComponent } from './method/method.component';
import { QRCodeModule } from 'angularx-qrcode';
import { Network } from '@ionic-native/network/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ClipboardModule } from 'ngx-clipboard';
import { CardIO } from '@ionic-native/card-io/ngx';
import {Stripe} from '@ionic-native/stripe/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { PayPal } from '@ionic-native/paypal/ngx';
@NgModule({
  declarations: [AppComponent, AddItemsComponent, MethodComponent],
  entryComponents: [
    AddItemsComponent,
    MethodComponent
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(), 
    AppRoutingModule,
    ClipboardModule,
    FormsModule,
    QRCodeModule,
    HttpClientModule
  ],
  providers: [
    Network,
    EmailComposer,
    File,
    BarcodeScanner,
    CardIO,
    Stripe,
    PayPal,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
