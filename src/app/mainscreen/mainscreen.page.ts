import { Component, OnInit, NgZone } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase'
@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.page.html',
  styleUrls: ['./mainscreen.page.scss'],
})
export class MainscreenPage implements OnInit {
  cards = []
  newTournaments = []
  cmsMembers = []
  db = firebase.firestore()
  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public zone: NgZone, public loadingCtrl: LoadingController) { }

  ngOnInit() {
    while (this.cards.length < 80) {
      this.cards.push('card')
      console.log(this.cards.length);
    }
      this.db.collection('newTournaments').onSnapshot(res =>{
        this.getTournaments()
      })
    
  }
  getTournaments() {
    this.zone.run(()=>{
      
      this.db.collection('newTournaments').orderBy("dateCreated").get().then(res => {
        this.newTournaments = []
      res.forEach(doc => {
        let tourn = {
          docid: doc.id,
          doc: doc.data()
        }
        this.newTournaments.unshift(tourn)
      })
      console.log('got tournas',this.newTournaments);
      
    })
    })
    
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
 async approveTournament(document) {
    let loader = await this.loadingCtrl.create({
      message: 'Approving '+document.doc.formInfo.tournamentName+'.'
    })
    loader.present()
    this.db.collection('newTournaments').doc(document.docid).update({approved: true}).then(async res => {
      loader.dismiss()
      let alerter = await this.alertCtrl.create({
        header: 'Success',
        message: document.doc.formInfo.tournamentName+' can be seen by Team Mamangers and Vendors. The CMS will accept their Invitations.',
        buttons: [{
          text: 'Okay',
          role: 'cancel'
        }]
      })
      alerter.present()
      
    })
    
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
