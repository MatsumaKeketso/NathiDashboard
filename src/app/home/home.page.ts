import { firebaseConfig } from './../../environments/environment';
import { Component, NgZone, Renderer2 } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // CSS PROPERTIES (DON'T TOUCH)
  login = true;
  profile = false;
  loginDiv = document.getElementsByClassName('form')
  profileDiv = document.getElementsByClassName('profile')
  // ----------BEGIN  BACKEND AFTER THIS LINE -------------
  db  = firebase.firestore()
  storageRef = firebase.storage().ref();

  adminForm:FormGroup;
  profileForm:FormGroup;
  signingin = false;
  profiling = false;
  validation_messages = {
    email: [
        { type: 'required', message: 'Email is required.' },
        { type: 'minlength', message: 'Email must be at least 4 characters long.' },
        { type: 'maxlength', message: 'Email cannot be more than 25 characters long.' },
      ],
    password: [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' },
      { type: 'maxlength', message: 'Password cannot be more than 25 characters long.' },
      ]
    }
    profile_validation = {
      fullName: [
          { type: 'required', message: 'Your fullname is required.' },
          { type: 'minlength', message: 'Your fullname must be at least 4 characters long.' },
          { type: 'maxlength', message: 'Your fullname cannot be more than 25 characters long.' },
        ],
      phoneNumber: [
        { type: 'required', message: 'Phone Number is required.' },
        { type: 'minlength', message: 'Number must be at least 10 digits long.' },
        { type: 'maxlength', message: 'Number cannot be more than 10 digits long.' },
        ]
      }
  constructor(public ngZone: NgZone, public renderer: Renderer2, public formBuilder: FormBuilder, public navCtrl: NavController) {

  }
  ngOnInit(){
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.db.collection('admins').doc(user.uid).get().then(res =>{
          if (res.exists) {
            console.log('Will Navigate');
            this.navCtrl.navigateForward('mainscreen')
          } else {
            this.changeFormFocus();
            console.log('Signed in, buy no Profile');
          }
        
        
      }).catch(err => {
        console.log('No Profile');
        
      })
      } else {
        console.log('Not signed in');
        
      }
      
    })
    this.adminForm = this.formBuilder.group({
      email: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'), Validators.minLength((4))]],
      password: ['',[Validators.required, Validators.minLength(6), Validators.maxLength(25)]]
    })
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength((4))]],
      phoneNumber: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    })
  }
  ionViewWillEnter(){
   this.signingin = false;
   this.profileForm.reset()
   this.adminForm.reset()
   this.login = true;
   this.profile = false;
  }
  /*
    call this methid if the user who just signed in
    does not have profile
  */
  changeFormFocus() {
    this.ngZone.run(()=>{
         this.login = !this.login;
    this.profile = !this.profile;
    if (this.login) {
      setTimeout(() => {
        this.renderer.setStyle(this.profileDiv[0], 'display', 'none')
      }, 700);
    } else {
      this.renderer.setStyle(this.profileDiv[0], 'display', 'block')
    }
    if (this.profile) {
      setTimeout(() => {
        this.renderer.setStyle(this.loginDiv[0], 'display', 'none')
      }, 700);
    } else {
      this.renderer.setStyle(this.loginDiv[0], 'display', 'block')
    }
    })
 
  }
  signIn(formData) {
    // nathidashboard@gmail.com
    this.ngZone.run(()=>{
       let email = formData.email
    let password = formData.password
    this.signingin = true;
    firebase.auth().signInWithEmailAndPassword(email, password).then(res => {
      this.db.collection('admins').doc(firebase.auth().currentUser.uid).get().then(res => {
        if (res.exists) {
          this.navCtrl.navigateForward('mainscreen')
        } else {
          this.changeFormFocus()
          console.log('changed fomr');
        }
      })
    }).catch(err => {
      alert(err.message)
      this.signingin = false
    })
    })
  }
  createProfile(formData) {
    console.log(formData);
   let adminProfile = {
      admin: true,
      details: formData
    }
    this.db.collection('admins').doc(firebase.auth().currentUser.uid).set(adminProfile).then(res => {
      this.navCtrl.navigateForward('mainscreen')
    }).catch(err => {
      alert(err.message)
    })
  }
  profileImage(image) {
    
    console.log(image.path[0].value);
    
    let file = image.path[0].value
    let metadata = {
      contentType: 'image/jpeg'
    };
    let cleaned = image.target.value.replace("C:\\fakepath\\", "")
    console.log(cleaned);
    let uploadTask = this.storageRef.child('AdminProfileImage').put(file, metadata);
    uploadTask.on('state_changed', // or 'state_changed'
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, (error) => {

  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  switch (error.message) {
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      console.log('An authorised');
      
      break;

    case 'storage/canceled':
      // User canceled the upload
      console.log('cancelled');
      
      break;

    case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      console.log('Unknown');
      
      break;
  }
}, () => {
  // Upload completed successfully, now we can get the download URL
  uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
    console.log('File available at', downloadURL);
  });
});
  }
}
