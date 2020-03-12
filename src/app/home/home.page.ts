// import { firebaseConfig } from './../../environments/environment';
import { Component, NgZone, Renderer2 } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import { NavController, AlertController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as particlesJS from "particles.js";
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// declare var particlesJS;
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
  signingin = false;
  profiling = false;
  authStatus = "Checking"
  checking = {
    login: false,
    profile: false,
    div: document.getElementsByClassName('checking')
  }
  particlesJs = document.getElementsByClassName('body')
  // ----------BEGIN  BACKEND AFTER THIS LINE -------------
  db = firebase.firestore()
  storage = firebase.storage().ref()
  storageRef = firebase.storage().ref();

  adminForm: FormGroup;
  profileForm: FormGroup;
  adminProfile = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ4iz2iJIpybxaWUwf4aLrDmRN4ISoaZ-LAnGlwHkmlaMRIPajcQ&s',
    admin: true,
    details: null,
    email: null
  }
  uploadprogress = 0;
  imageUploaded = false
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
  constructor(public ngZone: NgZone, private splashScreen: SplashScreen, public renderer: Renderer2, public formBuilder: FormBuilder, public navCtrl: NavController, public alertCtrl: AlertController, public camera: Camera) {

  }

  ngOnInit() {
    /*
    setTimeout(() => {
      this.profile = true
    }, 1000);
    const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});
*/
    this.ngZone.run(() => {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 3000);
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.db.collection('admins').doc(user.uid).get().then(res => {
            if (res.exists) {
              console.log('Will Navigate');
              this.navCtrl.navigateForward('mainscreen')
              this.authStatus = "Welcome Back"
              this.checking.login = true;
              setTimeout(() => {
                // this.renderer.setStyle(this.checking.div[0], 'display', 'none')
              }, 500);
            } else {
              this.changeFormFocus('profile');
              this.authStatus = "No Profile."

              this.checking.profile = true;
              this.renderer.setStyle(this.profileDiv[0], 'display', 'block')
              setTimeout(() => {
                this.renderer.setStyle(this.checking.div[0], 'display', 'none')
              }, 500);
              console.log('Signed in, buy no Profile');
            }
          }).catch(err => {
            console.log('No Profile'); this.authStatus = "No Profile."
            this.checking.profile = true;
            this.login = false;
          this.profile = true;
          console.log(this.checking.div[0])
          setTimeout(() => {
            this.renderer.setStyle(this.checking.div[0], 'display', 'none')
          }, 500);
          })
        } else {
          this.authStatus = "Please Sign In."
          console.log(this.authStatus);
          
          this.checking.login = true;
          this.login = true;
          this.profile = false;
          this.changeFormFocus('login');
          setTimeout(() => {
            this.renderer.setStyle(this.checking.div[0], 'display', 'none')
          }, 500);
          console.log(this.authStatus );
          
        }

      })
      this.adminForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'), Validators.minLength((4))]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]]
      })
      this.profileForm = this.formBuilder.group({
        fullName: ['', [Validators.required, Validators.minLength((4))]],
        phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
      })
    })
    // PARTICLES.JS
    // setTimeout(() => {
    //   particlesJS.load(this.particlesJs[0], '../../assets/particles.json', () => {
    //   console.log('callback - particles-js config loaded');
    // });
    // }, 500);
  }
  ionViewWillEnter() {
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
  changeFormFocus(state) {
    this.ngZone.run(() => {
      switch (state) {
        case 'login':
          this.login = true;
          this.profile = false;
          setTimeout(() => {
            this.renderer.setStyle(this.loginDiv[0], 'display', 'block')
            this.renderer.setStyle(this.profileDiv[0], 'display', 'none')
          }, 700);
          break;
        case 'profile':
          this.profile = true;
          this.login = false;
          this.renderer.setStyle(this.profileDiv[0], 'display', 'block')
          setTimeout(() => {
            this.renderer.setStyle(this.loginDiv[0], 'display', 'none')
          }, 700);

          break;
      }

    })

  }
  signIn(formData) {
    // nathidashboard@gmail.com
    this.ngZone.run(() => {
      let email = formData.email
      let password = formData.password
      this.signingin = true;
      firebase.auth().signInWithEmailAndPassword(email, password).then(res => {
        this.db.collection('admins').doc(firebase.auth().currentUser.uid).get().then(res => {
          if (res.exists) {
            this.navCtrl.navigateForward('mainscreen')
          } else {
            this.changeFormFocus('profile')
            console.log('changed fomr');
          }
        })
      }).catch(async err => {
        let alerter = await this.alertCtrl.create({
          header: 'PROFILE IMAGE UPLOAD ERROR',
          message: err.message,
          buttons: [{ text: 'Okay', role: 'cancel' }]
        })
        alerter.present()
        this.signingin = false

      })
    })
  }
  createProfile(formData) {
    console.log(formData);
    this.adminProfile = {
      admin: true,
      details: formData,
      image: this.adminProfile.image,
      email: firebase.auth().currentUser.email
    }
    this.db.collection('admins').doc(firebase.auth().currentUser.uid).set(this.adminProfile).then(res => {
      this.navCtrl.navigateForward('mainscreen')
    }).catch(async err => {
      let alerter = await this.alertCtrl.create({
        header: 'ERROR',
        message: err.message,
        buttons: [{ text: 'Okay', role: 'cancel' }]
      })
      alerter.present()
    })
  }
  async selectimage(image) {
    console.log(image.name)
    let imagetosend = image.item(0);
    console.log(imagetosend);
    if (!imagetosend) {
      const imgalert = await this.alertCtrl.create({
        message: 'Select image to upload',
        buttons: [{
          text: 'Okay',
          role: 'cancel'
        }]
      });
      imgalert.present();
    } else {
      if (imagetosend.type.split('/')[0] !== 'image') {
        const imgalert = await this.alertCtrl.create({
          message: 'Unsupported file type.',
          buttons: [{
            text: 'Okay',
            role: 'cancel'
          }]
        });
        imgalert.present();
        imagetosend = '';
        return;
      } else {
        const upload = this.storage.child(image.item(0).name).put(imagetosend);
        upload.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          console.log(progress);
          if (progress <= 90) {
            this.uploadprogress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          } else {
            this.uploadprogress = 90
          }
        }, error => {
        }, () => {
          upload.snapshot.ref.getDownloadURL().then(downUrl => {
            this.adminProfile.image = null
            this.adminProfile.image = downUrl
            setTimeout(() => {
              this.imageUploaded = true
              this.uploadprogress = 100
            }, 1000);
            // console.log(downUrl)
            // this.tournamentObj.sponsors.push(newSponsor)
            // console.log(this.tournamentObj.sponsors);

          });
        });
      }
    }
  }

  async selectImage() {
    let option: CameraOptions = {

      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      quality: 90,
      targetHeight: 600,
      targetWidth: 600,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM
    }
    await this.camera.getPicture(option).then(res => {
      console.log(res);
      const image = `data:image/jpeg;base64,${res}`;
      const filename = Math.floor(Date.now() / 1000);
      let file = 'Teams-Players-image/' + firebase.auth().currentUser.uid + filename + '.jpg';
      const UserImage = this.storage.child(file);

      const upload = UserImage.putString(image, 'data_url');
      upload.on('state_changed', snapshot => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadprogress = progress;
      }, async err => {
        let alerter = await this.alertCtrl.create({
          header: 'PROFILE IMAGE UPLOAD ERROR',
          message: err.message,
          buttons: [{ text: 'Okay', role: 'cancel' }]
        })
        alerter.present()
      }, () => {
        upload.snapshot.ref.getDownloadURL().then(downUrl => {
          this.adminProfile.image = downUrl;

        })
      })
    })

  }
}
