import { Component } from '@angular/core';

declare var gapi: any;
declare var firebase: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public endToEndLoginDelay = 0;
  public JWTLoginDelay = 0;
  public user: any = ''

  constructor() {
  }

  ngOnInit() {
    firebase.initializeApp(
      {
        apiKey: 'AIzaSyDe3Hb-xjvf3MrxaSWkq4PxLKj1V0W2JYg',
        authDomain: 'stylenook-staging.firebaseapp.com',
        databaseURL: 'https://stylenook-staging.firebaseio.com',
        projectId: 'stylenook-staging',
        storageBucket: 'stylenook-staging.appspot.com',
        messagingSenderId: '878529058937',
      }
    )
    firebase.auth().setPersistence('local');

    this.logout()

    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: "878529058937-467pc44cq49edo9nct1a70pduo6hp2mu.apps.googleusercontent.com",
      });
    });

    firebase.auth().onIdTokenChanged((fuser) => {
      console.log("received token")
      const loginEndTs = new Date().getTime();

      let loginStartTs: any = localStorage.getItem('LOGIN_START_TS');
      let firebaseJWTstartTs: any = localStorage.getItem('FIREBASE_FETCH_JWT_START_TS') || new Date().getTime();

      loginStartTs = parseInt(loginStartTs, 10);
      firebaseJWTstartTs = parseInt(firebaseJWTstartTs, 10);

      this.endToEndLoginDelay = loginEndTs - loginStartTs;
      this.JWTLoginDelay = loginEndTs - firebaseJWTstartTs;
    })
  }

  public loginGoogleFirebase() {
    const that = this;
    localStorage.setItem("LOGIN_START_TS", new Date().getTime().toString());

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      that.user = result.user;
    })
  }

  public loginGoogleNative() {
    const that = this;
    localStorage.setItem("LOGIN_START_TS", new Date().getTime().toString());
    gapi.auth2.getAuthInstance().signIn().then((googleUser) => {
      const credential = firebase.auth.GoogleAuthProvider.credential(
        googleUser.getAuthResponse().id_token);
      localStorage.setItem("FIREBASE_FETCH_JWT_START_TS", new Date().getTime().toString());
      firebase.auth().signInWithCredential(credential).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const errorCred = error.credential;
      });
    })
  }

  public logout() {
    this.JWTLoginDelay = 0;
    this.endToEndLoginDelay = 0;
    localStorage.clear();
    firebase.auth().signOut();
  }
}
