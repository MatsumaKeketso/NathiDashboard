
const functions = require('firebase-functions')
const admin = require('firebase-admin');

const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
require('dotenv').config()
admin.initializeApp(functions.config().firebase);
const db = admin.firestore()
const {SENDER_EMAIL,SENDER_PASSWORD}= process.env;
// Firebase function
/*
    take the user credentials from the CMS_Users collection (email/password)
    create an account in the auth
*/

//Done
exports.createAccount = functions.firestore.document('CMS_users/{docid}').onCreate((snap: { data: () => any; }, context: any) => {
    console.log('Document change', snap.data() ,' doc id' + context.params.docid);
    const dataR = snap.data();
    const uid = context.params.docid
    const email = dataR.email
    const password = dataR.password
    // let password = change.get('password');
    console.log('email is', email);
    const mailOption = {
        from: 'Nathis Tournament <sisekodolwana17@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
        to: dataR.email,
        subject: 'Payment Received', // email subject
        html: `<p style="font-size: 16px;">Good day <b>Admin User </b></p>
            <br />
            <p style="font-size: 15px;"> An account has been set up for you to be able to access nathi's Tournament CMS  </p>
            <p style="font-size: 15px;"> Your login credentials are as follows:</p>
            <p style="font-size: 15px;"> username/email : ${dataR.email}</p>
            <p style="font-size: 15px;"> password: ${dataR.password}</p>
            <p style="font-size: 15px;"> Use this link to access nathi's Tournament CMS <a href="https://tournaments-c444f.firebaseapp.com">click here </a> </p>
            <br />
         
        ` // email content in HTML
    };
    admin.auth().createUser({
        email: email,
        password: password
    })
 return transporter.sendMail(mailOption).then(() =>{
   
        db.collection('CMS_users/').doc(uid).delete().then(() =>{
            console.log("Document successfully deleted!");
        }).catch( (err: any) =>{
            console.error("Error removing document: ", err);
        })

 })
})
exports.test = functions.firestore.document('test/{docid}').onCreate((snap: { data: () => any; }, context: any) => {
    console.log('Document change', snap.data());
    const dataR = snap.data();

    const token = dataR.token
    const payload = {
        notification: {
            title: 'New Tournament has been created!',
            body: `name of: application fee:   , application closing date : , the tournament will start and end `,
            icon: 'https://goo.gl/Fz9nrQ'
        }
    }
    return admin.messaging().sendToDevice(token, payload)

})
let ID  = '';

exports.newtournament = functions.firestore.document('newTournaments/{docid}').onUpdate(async (snap: { data: () => any; after: { data: () => any; }; },context :any) => {
    console.log('Document change', snap.after.data() , ' id', context.params.docid);
    ID = context.params.docid;
    const dataR = snap.after.data().approved;
    const tournName = snap.after.data().formInfo.tournamentName
    const appFee = snap.after.data().formInfo.joiningFee
    const startDate = snap.after.data().formInfo.startDate
    const endDate = snap.after.data().formInfo.endDate
    const closingdate = snap.after.data().formInfo.applicationClosing
    const notify = snap.after.data().notifyUser;
    console.log('masibone', dataR);
    if (dataR === true && notify === 'yes') {
        console.log('Approved is true');

        // const token = 'dR9e_F_fzUo:APA91bEOzSKr9e8sItFZVZLytZpqb-rLSukN8dSz8b7yoh40nqNvQEu_ED0ZM7hutRXFY9f9DKQvYeds5WmyPQA03zBTyBlFlE16Uh8BcautdR0_IjTb1LkNZbE36SklFPU9OGnD1TeA'
        const payload = {
            notification: {
                title: 'New Tournament has been created!',
                body: `name of: ${tournName}, application fee: ${appFee}  , application closing date : ${closingdate} , the tournament will start ${startDate} and end ${endDate}`,
                icon: 'https://goo.gl/Fz9nrQ'
            }
        }
       
        const devicesRef = db.collection('testToken')
        // get the user's tokens and send notifications
        const devices = await devicesRef.get();
        const tokens: any[] = [];
        // send a notification to each device token
        devices.forEach((result: { data: () => { (): any; new(): any; token: any; }; }) => {
            const token = result.data().token;
            tokens.push(token)
            console.log('tokens', token);
        })
        return admin.messaging().sendToDevice(tokens, payload).then( () =>{
const answer = "no"
            db.doc('newTournaments/'+ID)
            .update({
                notifyUser :  answer
            })
        })
    } else {
        console.log('Approved is false');

    }
})

//Done
exports.TournamentApplicationNotification = functions.firestore.document('newTournaments/{docid}/teamApplications/{id}').onUpdate(async (snap: { data: () => any; after: { data: () => any; }; },context :any) => {
    console.log('Document change', snap.after.data(), 'uid'+ context.params.id);
    const dataR = snap.after.data().status;
    const uid = context.params.id
    const teamName = snap.after.data().TeamObject.teamName
    const tournID = snap.after.data().TournamentID
    const refNumber = snap.after.data().refNumber
    const clientNotified = snap.after.data().clientNotified
    const ManagerName = snap.after.data().TeamObject.managerName
    const email = snap.after.data().TeamObject.managerEmail

 

  admin.firestore().doc('newTournaments/'+ tournID).get().then( (response: any) =>{

console.log('doc ref',response.data());
if (dataR ==='accepted' && clientNotified === 1) {
    console.log('Send Client a notification that they have been accepted and ');
    const payload = {
        notification: {
            title: 'Congratulations '+ teamName+ '!',
            body: ` Your Team has Been accepted to be part of ${response.data().formInfo.tournamentName}, Please check your email, we have sent  detailed instructions on what to do from here. `,
            icon: 'https://goo.gl/Fz9nrQ'
        }
    }
    const mailOption = {
        from: 'Nathis Tournament <sisekodolwana17@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
        to: email,
        subject: 'Tournament Application Accepted', // email subject
        html: `
        <div class="body">
        <h1>Good Day <b>${ManagerName}</b></h1>
        <hr>
        <p>Thank your applying to be part of <b>${response.data().formInfo.tournamentName}</b>, Your application is successful and for us to proceed with your application we humbly request you to pay the tournament application fee of <b>${response.data().formInfo.joiningFee}</b> to the following bank account: </p>
        <ul>
          <li>Account Holder</li>
          <li>Account Number</li>
          <li>Bank</li>
        </ul>
        <p>Please use <span style="font-size: 30px;"> <b>${refNumber}</b> </span> as your reference number when you make the payment.
      </div>
      <style>
        .body {
          width: 500px;
          margin: auto;
          background: #e9e9e9;
          padding: 10px;
          border-radius: 10px;
        }
        </style>
            <img src="https://media.giphy.com/media/dKdtyye7l5f44/giphy.gif" />
        ` // email content in HTML
    };

 return admin.firestore().doc('members/'+uid).get().then((res: any) =>{
    console.log('token',res.data());
    const  token = res.data().Token
    transporter.sendMail(mailOption)
    return  admin.messaging().sendToDevice(token, payload).then(() =>{
            db.collection('newTournaments/').doc(tournID).collection('teamApplications/').doc(uid).update({
                clientNotified : 2
            })
     
    })
 })
   
} else if(dataR === 'paid' && clientNotified === 2 ) {
    const newStartdate = new Date(response.data().formInfo.startDate)
    const endDate = new Date(response.data().formInfo.endDate)
    const appClosingDate = new Date(response.data().formInfo.applicationClosing)
    console.log('payment recieved');
    const payload = {
        notification: {
            title: 'Payment Received for '+ teamName+ '!',
            body: ` Payment received to be part of ${response.data().formInfo.tournamentName}, An email has been sent to you with all relevant information regarding the Tournament `,
            icon: 'https://goo.gl/Fz9nrQ'
        }
    }
    const mailOption = {
        from: 'Nathis Tournament <sisekodolwana17@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
        to: email,
        subject: 'Payment Received', // email subject
        html: `<p style="font-size: 16px;">Good day <b>${ManagerName}</b></p>
            <br />
            <p style="font-size: 15px;">Payment received for Tournament Name: ${response.data().formInfo.tournamentName}, Tournament details are as follows: </p>
            <p style="font-size: 16px;">Tournament start Date: ${newStartdate.toDateString()}</p>
            <p style="font-size: 16px;">Tournament end Date ${endDate.toDateString()} </p>
            <p style="font-size: 16px;">Tournament Location: ${response.data().formInfo.location}</p>
            <p style="font-size: 16px;"> match fixtures will be generated after ${appClosingDate.toDateString()} which is the tournament closing date and you will be notified of the fixtures </p>
            <br />
            <img src="https://media.giphy.com/media/dKdtyye7l5f44/giphy.gif" />
        ` // email content in HTML
    };
    return admin.firestore().doc('members/'+uid).get().then((res: any) =>{
        console.log('token',res.data());
        const  token = res.data().Token
        transporter.sendMail(mailOption)
        return  admin.messaging().sendToDevice(token, payload).then(() =>{
                db.collection('newTournaments/').doc(tournID).collection('teamApplications/').doc(uid).update({
                    clientNotified : 3
                })
         
        })
     })
}
  })

})
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sisekodolwana17@gmail.com',
        pass: 'xnmqrokeflqnsfsw'
    }
});
//Done
exports.newUserEmailNotification = functions.firestore.document('members/{docid}').onCreate((change: { data: () => any; }, context: any) => {
    console.log('Document change', change.data(), 'Document context', context.params.docid);
    const projectId = context.params.docid
    const dataR = change.data();
    // const db = admin.firestore()
    if(dataR.status === 'awaiting'){
        const mailOptions = {
            from: 'Nathis Tournament <sisekodolwana17@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
            to: dataR.form.email,
            subject: 'Registration recieved', // email subject
            html: `<p style="font-size: 16px;">Good day <b>${dataR.form.fullName}</b></p>
                <br />
                <p style="font-size: 15px;">Thank you for registering to be part of Nathi's Tournament, for you to be able to apply for tournaments as a ${dataR.form.role} we will have to accept your application.  </p>
                <p style="font-size: 16px;">Until then,<b>HAPPY WAITING!!</b> </p>
                <br />
                <img src="https://media.giphy.com/media/dKdtyye7l5f44/giphy.gif" />
            ` // email content in HTML
        };
        return transporter.sendMail(mailOptions).then(() =>{
           return admin.firestore().doc('members/'+ projectId).update({
            firstEmailRecieved : 'yes'
         
          });
        }).catch( (err : any) =>{
            console.log('Error is',err);    
        })
    }
})
//Done
exports.updateUserEmailNotification = functions.firestore.document('members/{docid}').onUpdate(async (snap: { data: () => any; after: { data: () => any; }; },context :any) => {
    console.log('Document change', snap.after.data() , ' id', context.params.docid);
    const projectId = context.params.docid
    const dataR = snap.after.data();
    // const db = admin.firestore()

    if(dataR.status === 'accepted' && dataR.firstEmailRecieved === 'yes' ){
        const mailOption = {
            from: 'Nathis Tournament <sisekodolwana17@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
            to: dataR.form.email,
            subject: 'Congratulations', // email subject
            html: `<p style="font-size: 16px;">Good day, <b>${dataR.form.fullName}</b></p>
            <p style="font-size: 16px;"> You are now part of Nathi's Tournament , please go to the app and create your team in order to apply for a tournament. Remember you can't apply for a tournament if you havent created your team and team players</p>
                <br />
                <img src="https://media.giphy.com/media/4I5WwgRKfFxq8/giphy.gif" />
            ` // email content in HTML
        };
        return transporter.sendMail(mailOption).then(()=>{
            return admin.firestore().doc('members/'+ projectId).update({
                firstEmailRecieved : 'cancel'   
              });
        }).catch( (err : any) =>{
            console.log('Error is',err);
            
        })
    }

  
})
