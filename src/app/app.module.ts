import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {environment} from '../environments/environment';
import * as firebase from 'firebase/app';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

firebase.initializeApp(environment.firebaseConfig);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

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
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    })
  ],
  providers: [
    Network,
    File,
    EmailComposer,
    BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
