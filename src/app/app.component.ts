import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as admin from 'firebase-admin';
// const admin = require('firebase-admin');
import * as firebase from 'firebase'
const serviceAccount = require('./nathi-stourmentdb-firebase-adminsdk-tm3sd-50e3041b6f.json');
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  // serviceAccount = './nathi-stourmentdb-firebase-adminsdk-tm3sd-50e3041b6f.json';
  messaging = firebase.messaging();
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    // admin.initializeApp()
  } 

  initializeApp() {
    // console.log(admin.app().name); 
//    admin.initializeApp({
     
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://nathi-stourmentdb.firebaseio.com"
// })
    this.platform.ready().then(() => {
      
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
