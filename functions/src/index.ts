// import { firebaseConfig } from './../../src/environments/environment';

import * as functions from 'firebase-functions';
// import * as firebase from 'firebase';
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Firebase function
/*
    take the user credentials from the CMS_Users collection (email/password)
    create an account in the auth
*/

exports.createAccount = functions.firestore.document('CMS_users/{docid}').onCreate((change, context) => {

    console.log('Document change', change.data(), 'Document context', context);
    const email = change.get('email');
    const password = change.get('password');
    
    admin.auth().createUser({
        email: email,
        password: password
      })
})