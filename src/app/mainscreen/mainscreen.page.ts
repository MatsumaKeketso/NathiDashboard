import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import * as firebase from 'firebase'
@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.page.html',
  styleUrls: ['./mainscreen.page.scss'],
})
export class MainscreenPage implements OnInit {
  cards = []
  db = firebase.firestore()
  constructor(public alertCtrl: AlertController, public navCtrl: NavController) { }

  ngOnInit() {
    while (this.cards.length < 80) {
      this.cards.push('card')
      console.log(this.cards.length);
    }
    
    
  }
  async createUser() {
    let alerter = await this.alertCtrl.create({
      header:'New CMS User',
      message:'This user will have access to your CMS',
      inputs: [{
        name: 'email',
        type: 'email',
        placeholder: 'Email'
      }, {
        name: 'password',
        type: 'password',
        placeholder: 'Password'
      }],
      buttons: [
        {text: 'Create User', handler: (data) => {
          console.log(data);
          this.db.collection('CMS_users').add(data).then(async res => {
            let goodRes = await this.alertCtrl.create({
              header: 'Created new User.',
              message:'They must use the credentials for this account to login to the CMS',
              buttons: [{
                text: 'Done',
                role: 'cancel'
              }]
            })
            goodRes.present()
          })
        }}
      ]
    })
    alerter.present()
  }
  approveTournament(document) {
    console.log('Will Approve Tournament');
    
  }
  toCMS() {
    console.log('to CMs');
    window.location.href = 'https://nathistournamentdb.firebaseapp.com';
  }
  signOut() {
    console.log('to out');
    firebase.auth().signOut().then(res => {
      console.log('signedout');
      this.navCtrl.navigateRoot('home');
    }).catch(err => {
      console.log(err.message);
      
    })

  }
}
