import { Component ,OnDestroy } from '@angular/core';
import {  IonicPage, NavParams, ToastController,Platform,NavController } from 'ionic-angular';
import { SendMessageWithContent } from '../../interfaces/user-options';
import { SetupService } from '../../providers/setup.services'; 
import * as socketIOClient  from 'socket.io-client';
import * as sailsIOClient  from 'sails.io.js';
import * as io from 'socket.io-client';

@IonicPage()
@Component({
  selector: 'page-chat-room',
  templateUrl: 'chatroom.html',
})
export class ChatroomPage implements OnDestroy {   
  nickname = '';
  chatId = '';
  responseData:any;
  data:any;
  msg:any;
  user:any;
  socket:any;
  io:any = sailsIOClient(socketIOClient);
  messageDetails: SendMessageWithContent = { sender: '', recipient: '',content:'',chatId:'' };
  messages  : any[]=[];
  chatid={
           "chatId": ""           
  }

  // myInfo = this.messages[0];
  constructor( public platform:Platform,private navCtrl:NavController,private navParams: NavParams, public _setupService: SetupService, 
    private toastCtrl: ToastController) {

       this.getUserSocketConnection();

     this.user=JSON.parse(localStorage.getItem('logindetail'));     
        let backAction =  platform.registerBackButtonAction(() => {        
        this.navCtrl.pop();
        backAction();
      },2)

    this.messageDetails.sender=this.navParams.get('sender'); 
    this.nickname = this.messageDetails.sender;
    this.messageDetails.recipient=this.navParams.get('receiver');
    // this.messageDetails.chatId=this.navParams.get('chatId');
    this.messageDetails.chatId="33";
    this.chatid.chatId=this.messageDetails.chatId;

   this.getAllChatMessage();
   this.getUserChatMessage(); 

   this.socket.on('NEWMESSAGE', (msg) => {
      console.log("message", msg);
      this.messages.push(msg);
    });

 }


getUserSocketConnection(){
 this.socket = io('http://192.168.0.128:1338');
}


getUserChatMessage(){
     this._setupService.getChatMessages({chatId:33}).subscribe((response) => {
        debugger;
     });
}

getAllChatMessage(){
   this._setupService.getChatMessages({chatId:33}).subscribe((response)=>{

     if(response.statusCode==200){
       this.messages.push(response.data);
     }
   });
}

sendMessageOnEnter(event){
  debugger;
   if (event.which == 13 || event.keyCode == 13) {
         this.messages.push({
             sender : 'singh',
             content : event.target.value,
             createdAt :  new Date(),
             recipient : 'kunvar'
             });
         this.messageDetails.content = '';
    }
}

sendMessage() {    
  if(this.messageDetails.content){
    debugger;
       // this.socket.emit('NEWMESSAGE', this.messageDetails);

       this.io.socket.post('/chat/sendMessage',this.messageDetails, function(data, response){
         if(response.statusCode == 200){

           this.messages.push({
             sender : this.messageDetails.sender,
             content : this.messageDetails.content,
             createdAt :  new Date(),
             recipient : this.messageDetails.recipient
             });
         }
     });
   }
  }
  
 ionViewWillLeave() {
   this.io.socket.disconnect();
   delete this.io.sails;
  }

 

  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

   ngOnDestroy() {
   this.io.socket.disconnect();
   delete this.io.sails;
  }

}
