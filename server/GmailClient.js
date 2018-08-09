/******************************************************************************
 * Copyright (c) 2018, John M. Larkin <jlarkin@whitworth.edu>
 * Licensed under the MIT License
 *
 * Class for interacting with Gmail
 *****************************************************************************/

'use strict';

const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const opn = require('opn');
const path = require('path');

const parseMessage = require('./gmailParser');

class GmailClient {
/**
* Constructor takes options with the following default values
* {
*   keyLocation: 'gmail_api_keys.json',  // Google Gmail API key file
*   scopes: ['https://www.googleapis.com/auth/gmail.modify'],  // Access types
*   token_path: 'gmail_credentials.json'                     // User tokens
* }
**/
   constructor (options) {
     // Either use supplied options or default values
     let opt = options || {};
     opt.keyLocation = opt.keyLocation || 'gmail_api_keys.json';
     opt.scopes = opt.scopes || ['https://www.googleapis.com/auth/gmail.modify'];
     opt.token_path = opt.token_path || 'gmail_credentials.json';
     // Load API keys and create an oAuth client
     const keyPath = path.join(__dirname, opt.keyLocation);
     var keys = { redirect_uris: [''] };
     if (fs.existsSync(keyPath)) {
       const keyFile = require(keyPath);
       keys = keyFile.installed || keyFile.web;
     }
     this.oAuth2Client = new google.auth.OAuth2(
       keys.client_id,
       keys.client_secret,
       keys.redirect_uris[0]
     );

     // Store scopes and token file
     this._scopes = opt.scopes;
     this._token_path = opt.token_path;
   }

   async authorize() {
     return new Promise( (resolve, reject) => {
       fs.readFile(this._token_path, async (err, token) => {
         if (err) {
           let newtoken = await this.getNewToken();
           this.oAuth2Client.setCredentials(newtoken);
         } else {
           this.oAuth2Client.setCredentials(JSON.parse(token));
         }
         // var auth = this.oAuth2Client;
         // this.gmail = google.gmail({version: 'v1', auth});
         this.gmail = google.gmail({version: 'v1', auth: this.oAuth2Client});
         resolve();
       });
     });
   }

   async getNewToken() {
     return new Promise( async (resolve, reject) => {
       const authUrl = this.oAuth2Client.generateAuthUrl({
         access_type: 'offline',
         scope: this._scopes,
       });
       opn(authUrl, {wait: false});
       const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
       });
       await rl.question('Enter the code here: ', (code) => {
         rl.close();
         this.oAuth2Client.getToken(code, (err, token) => {
           if (err) console.log(err);
           // Store the token to disk for later program executions
           fs.writeFile(this._token_path, JSON.stringify(token), (err) => {
             if (err) reject(err);
             console.log('Token stored');
           });
           resolve(token);
         });
       });
     });
   }

   async listMessages() {
     return new Promise( (resolve, reject) => {
       this.gmail.users.messages.list({
         userId: 'me',
         labelIds: ['INBOX','UNREAD']
       }, (err, res) => {
         if (err) reject(new Error('The API returned an error: ' + err));
         resolve(res.data.messages);
       });
     });
   }

   async getMessage(msgId) {
     return new Promise( (resolve, reject) => {
       this.gmail.users.messages.get({
         userId: 'me',
         id: msgId,
         format: 'full'
       }, (err, res) => {
         if (err) reject('The API returned an error: ' + err);
         resolve(res.data);
       })
     });
   }

   async getAttachment(msgId, attachmentId) {
     return new Promise( (resolve, reject) => {
       this.gmail.users.messages.attachments.get({
         userId: 'me',
         id: attachmentId,
         messageId: msgId
       }, (err, res) => {
         if (err) reject('The API returned an error: ' + err);
         var msgData = Buffer.from(res.data.data,'base64');
         resolve(msgData);
       })
     });
   }

   async markRead(msgId) {
     return new Promise( (resolve, reject) => {
       this.gmail.users.messages.modify({
         userId: 'me',
         id: msgId,
         requestBody: {
           'removeLabelIds': ['UNREAD']
         }
       }, (err, res) => {
         if (err) reject(new Error('The API returned an error: ' + err));
         resolve();
       })
     })
   }

   async watchInbox(topicToWatch) {
     const res = await this.gmail.users.watch({
       userId: 'me',
       requestBody: {
         labelIds: ['INBOX','UNREAD'],
         topicName: topicToWatch
       }
     });
     return res.data;
   }

   async stopWatch() {

   }

 }



 module.exports = {GmailClient, parseMessage};
