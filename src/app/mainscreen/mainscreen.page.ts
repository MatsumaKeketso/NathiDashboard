import { Component, OnInit, NgZone, Renderer2 } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase'
import { dismissOverlay } from '@ionic/core/dist/types/utils/overlays';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { rmdirSync } from 'fs';
@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.page.html',
  styleUrls: ['./mainscreen.page.scss'],
})
export class MainscreenPage implements OnInit {
  cards = []
  newTournaments = []
  cmsMembers = []
  tokenId = []
  db = firebase.firestore()
  view = {
    tournaments: true,
    tournDiv: document.getElementsByClassName('right'),
    users: false,
    usersDiv: document.getElementsByClassName('left'),
  }
  constructor(public renderer: Renderer2,public alertCtrl: AlertController, public navCtrl: NavController, public zone: NgZone, public loadingCtrl: LoadingController,private oneSignal: OneSignal) { }
  ngOnInit() {
    this.getUsers()
    while (this.cards.length < 80) {
      this.cards.push('card')
      console.log(this.cards.length);
    }
    this.db.collection('newTournaments').onSnapshot(res => {
      this.getTournaments()
    })

    this.db.collection('members').get().then(res =>{
      res.forEach(doc =>{
        console.log(doc.data().token);
        
      })
    })
    
  }
  changeView(state) {
    console.log(state);
    
    switch (state) {
      case 'users':
        this.view.users  = true;
        this.renderer.setStyle(this.view.usersDiv[0],'display','block');
        this.view.tournaments = false;
        setTimeout(() => {
          this.renderer.setStyle(this.view.tournDiv[0],'display','none')
        }, 500);
        break;
      case 'tournaments':
      this.view.users = false;
      this.view.tournaments = true;
      this.renderer.setStyle(this.view.tournDiv[0],'display','block')
      setTimeout(() => {
        this.renderer.setStyle(this.view.usersDiv[0],'display','none')
      }, 500);
        break;
    }
  }
  getTournaments() {
    this.zone.run(() => {
      this.db.collection('newTournaments').orderBy("dateCreated").get().then(res => {
        this.newTournaments = []
        res.forEach(doc => {
          let tourn = {
            docid: doc.id,
            doc: doc.data()
          }
          this.newTournaments.unshift(tourn)
        })
        console.log('got tournas', this.newTournaments);
      })
    })
  }
  // async createUser() {
  //   let alerter = await this.alertCtrl.create({
  //     header: 'New CMS User',
  //     message: 'This user will have access to your CMS',
  //     backdropDismiss: false,
  //     inputs: [{
  //       name: 'email',
  //       type: 'email',
  //       placeholder: 'Email'
  //     }, {
  //       name: 'password',
  //       type: 'password',
  //       placeholder: 'Password'
  //     }],
  //     buttons: [
  //       {
  //         text: 'Create User',
  //         handler: (data) => {
  //         console.log('credentials', data);
          
  //         this.db.collection('CMS_users').add({data,profile: 'no'}).then(async res => {
  //           let goodRes = await this.alertCtrl.create({
  //             header: 'Created new User.',
  //             message:'They must use the credentials for this account to login to the CMS',
  //             buttons: [{
  //               text: 'Done',
  //               role: 'cancel'
  //             }]
  //           })
  //           goodRes.present()
  //         });
  //       }},{
  //         text: 'Cancel',
  //         role:'cancel'
  //       }]
  //   })
  //   alerter.present()
  // }
  async createUser() {
    const alert = await this.alertCtrl.create({
      header: 'New CMS User',
      message: 'This user will have access to your CMS',
      backdropDismiss: false,
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
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Create User',
          handler: (data) => {
            console.log('credentials', data);
          
            this.db.collection('CMS_users').add({data,profile: 'no'}).then(async res => {
              let goodRes = await this.alertCtrl.create({
                header: 'Created new User.',
                message:'They must use the credentials for this account to login to the CMS',
                buttons: [{
                  text: 'Done',
                  role: 'cancel'
                }]
              })
              goodRes.present()
            });
          }
        }
      ]
    });

    await alert.present();
  }
  async approveTournament(document) {
    let loader = await this.loadingCtrl.create({
      message: 'Approving ' + document.doc.formInfo.tournamentName + '.'
    })
    loader.present()

    this.db.collection('tokens').get().then(res =>{
      this.tokenId = []
      res.forEach(doc =>{
        console.log('tokens a a',doc.data());
        
this.tokenId.push(doc.data().token)
      })
      console.log('tokens', this.tokenId);
      var notificationObj = {
        headings: {en: "New Tournament Alert! "},
        contents: { en: "Hey, tournmanet  " +document.doc.formInfo.tournamentName + " Has been created cancelled their  " + document.doc.formInfo.tournamentName + " on "+ document.doc.formInfo.tournamentName + " at " + document.doc.formInfo.tournamentName},
        include_player_ids: this.tokenId,
      }
      this.oneSignal.postNotification(notificationObj).then(res => {
       // console.log('After push notifcation sent: ' +res);
      })
    })

    this.db.collection('members').get().then(res =>{
        res.forEach(doc =>{
          var notificationObj = {
            headings: {en: "Alert "},
            contents: { en: "Hey, tournmanet  " +doc.data().form.fullName + " Has been created cancelled their  " + document.doc.formInfo.tournamentName + " on "+ document.doc.formInfo.tournamentName + " at " + document.doc.formInfo.tournamentName},
            include_player_ids: [doc.data().token]
          }
          this.oneSignal.postNotification(notificationObj).then(res => {
           // console.log('After push notifcation sent: ' +res);
          })
        })
      
    })
 
    
    this.db.collection('newTournaments').doc(document.docid).update({ approved: true }).then(async res => {
      loader.dismiss()
      let alerter = await this.alertCtrl.create({
        header: 'Success',
        message: document.doc.formInfo.tournamentName + ' can be seen by Team Mamangers and Vendors. The CMS will accept their Invitations.',
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
  getUsers() {
    let user = {
      doc: null,
      docid: null
    }
    this.db.collection('admins').get().then(res=>{
      res.forEach(doc => {
        user = {
          doc: doc.data(),
          docid: doc.id
        }
        this.cmsMembers.push(user);
        user = {
          doc: null,
          docid: null
        }
      })
      
    })
  }
}




