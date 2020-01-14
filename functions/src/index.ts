
const functions = require('firebase-functions')
const admin = require('firebase-admin');

const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
require('dotenv').config()
admin.initializeApp(functions.config().firebase);

const {SENDER_EMAIL,SENDER_PASSWORD}= process.env;
// Firebase function
/*
    take the user credentials from the CMS_Users collection (email/password)
    create an account in the auth
*/
exports.createAccount = functions.firestore.document('CMS_users/{docid}').onCreate((snap: { data: () => any; }, context: any) => {
    console.log('Document change', snap.data());
    const dataR = snap.data();

    const email = dataR.email
    const password = dataR.password
    // let password = change.get('password');
    console.log('email is', email);
    admin.auth().createUser({
        email: email,
        password: password
    })
})

exports.newtournament = functions.firestore.document('newTournaments/{docid}').onUpdate(async (snap: { data: () => any; after: { data: () => any; }; },context :any) => {
    console.log('Document change', snap.after.data() , ' id', context.params.docid);
    const projectId = context.params.docid;
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
        const db = admin.firestore()
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
            db.doc('newTournaments/'+projectId)
            .update({
                notifyUser :  answer
            })
        })
    } else {
        console.log('Approved is false');

    }
})

//Not done need to pull tournament details
exports.TournamentApplicationNotification = functions.firestore.document('newTournaments/{docid}/teamApplications/{id}').onUpdate(async (snap: { data: () => any; after: { data: () => any; }; },context :any) => {
    console.log('Document change', snap.after.data(), 'uid'+ context.params.id);
    const dataR = snap.after.data().status;
    const uid = context.params.id
    const  tournUID =  context.params.docid
    const ApplicantUid = snap.after.data().TeamObject.uid
    const teamName = snap.after.data().TeamObject.teamName
    const refNumber = snap.after.data().refNumber
    console.log('ApplicantUid', ApplicantUid);
  
    if (dataR ==='accepted' && uid === ApplicantUid) {
        console.log('Send Client a notification that they have been accepted and ');
        const payload = {
            notification: {
                title: 'Congradulation '+ teamName+ '! your application is Accepted!',
                body: `for us to continue with processing your application please pay the tournament application fee to account :155 and use this ${refNumber} as your :`,
                icon: 'https://goo.gl/Fz9nrQ'
            }
        }

     return admin.firestore().doc('members/'+uid).get().then((res: any) =>{
        console.log('token',res.data());
        const  token = res.data().Token
        return  admin.messaging().sendToDevice(token, payload)
     })
       
    } else if(dataR === 'paid' && uid === ApplicantUid ) {
        
        console.log('payment recieved');

        const db = admin.firestore()
        const  tournName  = { formInfo : {tournamentName : '',startdate : ''}}
     return admin.firestore().doc('members/'+uid).get().then((res: any) =>{
        console.log('token',res.data());
        const  token = res.data().Token
        db.doc('newTournaments/'+ tournUID).get().then((doc: any) =>{
console.log('ddddd',doc.data().formInfo.tournamentName);

 tournName.formInfo.tournamentName = doc.data().formInfo.tournamentName;
 tournName.formInfo.startdate = doc.data().formInfo.startDate;

        })
        console.log('tournament details',tournName);
        const nametourn = tournName.formInfo.tournamentName;
        const  startdate  = new Date(tournName.formInfo.startdate).toDateString().toString()
        const payload = {
            notification: {
                title: 'Congradulation '+ teamName+ '!',
                body: `you are now part of ${nametourn} and it will start on the : ${startdate}`,
                icon: 'https://goo.gl/Fz9nrQ'
            }
        }

        return  admin.messaging().sendToDevice(token, payload)
     })
    }
})
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sisekodolwana17@gmail.com',
        pass: 'xnmqrokeflqnsfsw'
    }
});
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
                <p style="font-size: 15px;">Thank you for registering to be part of Nath's Tournament, for you to be able to apply for tournaments as a ${dataR.form.role} we will have to accept your application.  </p>
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
