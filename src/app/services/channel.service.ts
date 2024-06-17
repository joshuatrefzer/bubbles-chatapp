import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Message, MessageService } from './message.service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, first, firstValueFrom, take } from 'rxjs';
import { User, UserService } from './user.service';
import { MainService } from './main.service';
import { MessageContent } from '../message-bar/message-bar.component';
import { Router } from '@angular/router';

export class Channel {
  id: number;
  name: string;
  description?: string; // optional because direct messages doesnt have
  members: number[]; // Array of user ID's inside the channel
  is_channel: boolean;
  picture?: string;
  read_by: number[];
  hash: string;


  constructor(obj?: any) {
    this.id = obj ? obj.id : null;
    this.name = obj ? obj.name : '';
    this.description = obj ? obj.description : '';
    this.members = obj ? obj.members : [];
    this.is_channel = obj ? obj.is_channel : false;
    this.picture = obj ? obj.picture : '';
    this.read_by = obj ? obj.read_by : [];
    this.hash = obj ? obj.hash : '';
  }
}

export interface ChatsAndPreview {
  channels: Channel[],
  preview_messages: Message[],
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  $chatsAndPreview: BehaviorSubject<ChatsAndPreview> = new BehaviorSubject<ChatsAndPreview>({
    channels: [],
    preview_messages: [],
  });
  channels: Channel[] = [];
  directMessages: Channel[] = [];
  currentChannel!: Channel;
  localStorageChannel: Channel | undefined;
  chatPreviews: Message[] = [];
  chats: Channel[] = [];

  intervalIdMessages: any;
  pollingIntervalMessages: number = 8000; // 8 sec

  intervalIdChats: any;
  pollingIntervalChats: number = 20000; //20sec

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private http: HttpClient,
    private userService: UserService,
    private mainService: MainService,
    private router: Router,
  ) {
    this.setCurrentChannel();
  }

  async setCurrentChannel() {
    let localStorageAsString = localStorage.getItem('currentChannel');
    if (localStorageAsString != 'undefined')
      this.localStorageChannel = JSON.parse(localStorageAsString as string);
    await this.checkCurrentChannel();
    if (this.currentChannel) {
      this.messageService.getMessagesAndThread(this.currentChannel.id);
    } else {
      this.mainService.messageAndThreadFetchingDone = true;
      this.mainService.deactivateLoader();
    }
  }

  async checkCurrentChannel() {
    try {
      if (this.localStorageChannel) {
        const url = environment.baseUrl + 'channels/' + this.localStorageChannel.id + '/';
        await firstValueFrom(this.http.get(url))
          .then((response) => {
            this.localStorageChannel = response as Channel;
            if (this.localStorageChannel.members.includes(this.authService.currentUser.id)) {
              localStorage.setItem('currentChannel', JSON.stringify(response as Channel));
              this.currentChannel = this.localStorageChannel;
            }
          });
      }
    } catch (error) {
      this.mainService.popupLog('Error by fetching channeldata.', true);
    }
  }

  async getChatsForUser() {
    try {
      const data = await firstValueFrom(this.fetchChatsAndPreview());
      this.$chatsAndPreview.next(data);
      this.subscribeChatsAndPreview();
      this.mainService.chatsAndPreviewFetchingDone = true;
      this.mainService.deactivateLoader();
    } catch (error) {
      console.error('Error by fetching Chats:', error);
      throw error;
    }
  }

  fetchChatsAndPreview(): Observable<ChatsAndPreview> {
    const url: string = environment.baseUrl + 'channels-and-preview/' + this.authService.currentUser.id;
    return this.http.get<ChatsAndPreview>(url);
  }

  subscribeChatsAndPreview() {
    this.$chatsAndPreview.pipe(take(1)).subscribe(data => {
      this.chats = data.channels;
      this.chatPreviews = data.preview_messages;
      this.filterChats();
      this.userService.getUsers();
    });
  }


  openChannel(channelId: number) {
    this.mainService.chatLoader = true;
    this.mainService.showNewMessageSearch = false;
    this.currentChannel = this.chats.find(obj => obj.id === channelId) as Channel;
    localStorage.setItem('currentChannel', JSON.stringify(this.currentChannel));
    this.setRead(channelId);
    this.startPollingForMessages(channelId);
    this.mainService.threadOpen = false;
    if (window.innerWidth < 845) {
      this.mainService.sideMenuOpen = false;
    }
    this.mainService.scrollEmitChat();
  }

  startPollingForMessages(id: number) {
    console.log('start polling');
    this.stopPollingForMessages();
    this.messageService.getMessagesAndThread(id);
    if (id) {
      this.intervalIdMessages = setInterval(() => {
        this.messageService.getMessagesAndThread(id);
      }, this.pollingIntervalMessages);
    } else {
      return;
    }
  }

  stopPollingForMessages() {
    console.log('stop polling');
    clearInterval(this.intervalIdMessages);
  }

  startPolloingForChats() {
    this.stopPollingForChats();
    this.getChatsForUser();
    this.intervalIdChats = setInterval(() => {
      this.pollChats();
    }, this.pollingIntervalChats);
  }

  stopPollingForChats() {
    clearInterval(this.intervalIdChats);
  }

  pollChats() {
    this.getChatsForUser();
  }

  filterChats() {
    this.channels = this.chats.filter(channel => channel.is_channel === true); //filters only channels that have currentuser as member
    this.directMessages = this.chats.filter(channel => channel.is_channel === false);
  }

  checkMsg(chatId: number) { // only render channels with messages?
    let messagesOfChat = this.messageService.currentMessages.filter(obj => obj.source === chatId);
    return messagesOfChat.length > 0
  }

  getChannel(channelId: number) {
    return this.channels.find(obj => obj.id === channelId) as Channel;
  }

  async setUnread(channelId: number) {
    const url = environment.baseUrl + 'channels/' + channelId + '/';
    const index = this.chats.findIndex(obj => obj.id === channelId);
    this.chats[index].read_by = [this.authService.currentUser.id];
    const formData = new FormData();
    formData.append('read_by', this.authService.currentUser.id.toString());
    await firstValueFrom(this.http.patch<Channel>(url, formData));
  }

  async setRead(channelId: number) {
    const url = environment.baseUrl + 'channels/' + channelId + '/';
    const index = this.chats.findIndex(obj => obj.id === channelId);
    if (!this.chats[index].read_by.includes(this.authService.currentUser.id)) {
      this.chats[index].read_by.push(this.authService.currentUser.id);
    }
    const formData = new FormData();
    this.chats[index].read_by.forEach((memberId) => {
      formData.append('read_by', memberId.toString());
    })
    await firstValueFrom(this.http.patch<Channel>(url, formData));
  }

  sendMsg(messageContent: MessageContent, isThread: boolean) {
    let newMessage: Message = {
      id: 0,
      author: this.authService.currentUser.id,
      reactions: [],
      source: isThread ? this.messageService.currentThread.id : this.currentChannel.id,
      content: messageContent.content,
      created_at: new Date().getTime(),
      hash: '',
      attachment: messageContent.attachment
    }
    const formData = this.getMessageForm(newMessage, isThread);
    if (isThread) {
      this.postMessage('threads/', formData);
    } else {
      this.postMessage('messages/', formData);
      this.setUnread(this.currentChannel.id);
    }
  }

  async deleteMessage(message: Message) {
    let index = null;
    let url = '';
    if (this.messageService.currentMessages.some(obj => obj.id === message.id)) {
      index = this.messageService.currentMessages.findIndex(obj => obj.id === message.id);
      this.messageService.currentMessages.splice(index, 1);
      url = environment.baseUrl + 'messages/' + message.id + '/';
    } else {
      index = this.messageService.threads.findIndex(obj => obj.id === message.id);
      this.messageService.threads.splice(index, 1);
      url = environment.baseUrl + 'threads/' + message.id + '/';
    }
    try {
      await firstValueFrom(this.http.delete(url));
    } catch (error) {
      this.mainService.popupLog('Deleting message failed', true);
    }

  }

  async postMessage(endpoint: string, message: FormData) {
    const url = environment.baseUrl + endpoint;
    try {
      const response = await firstValueFrom(this.http.post(url, message)) as Message;
      if (endpoint === 'messages/') {
        this.messageService.currentMessages.push(response);
        this.replacePreview(response);
        setTimeout(() => {
          this.mainService.scrollToBottomChat.emit();
        }, 100);
      } else {
        this.messageService.threads.push(response);
      }
    } catch (error) {
      this.mainService.popupLog('Error by sending message', true);
    }
  }


  replacePreview(message: Message) {
    const index = this.chatPreviews.findIndex(obj => obj.source === message.source);
    if (index == -1) {
      this.chatPreviews.push(message);
    } else {
      this.chatPreviews[index] = message;
    }
  }

  getMessageForm(newMessage: Message, isThread: boolean) {
    const formData = new FormData();
    formData.append('author', this.authService.currentUser.id.toString());
    if (newMessage.reactions.length > 0) {
      formData.append('reactions', JSON.stringify(newMessage.reactions));
    }
    formData.append('source', isThread ? this.messageService.currentThread.id.toString() : this.currentChannel.id.toString());
    formData.append('content', newMessage.content);
    if (newMessage.attachment instanceof File) {
      formData.append('attachment', newMessage.attachment);
    }
    return formData;
  }


  getImg(imgUrl: string | undefined | null) {
    if (imgUrl != null) {
      if (imgUrl.startsWith('https:')) {
        return imgUrl; //if full link is available just return full link
      } else {
        return environment.baseUrl.slice(0, -1) + imgUrl;
      }
    } else {
      return 'assets/img/profile_placeholder.svg';
    }
  }

  isSeperator(obj: any) {
    return obj instanceof Date
  }

  createSeperator(date: any) {
    const weekday = date.toLocaleDateString("en-EN", { weekday: 'long' });
    const dateString = date.toLocaleDateString();
    return weekday + ' ' + dateString;
  }

  checkGroupedMsg(messages: any) {
    return messages as Message[];
  }

  async selectDirectMessage(user: User) {
    const userId = user.id || 0;
    if (!this.dmAlreadyExist(userId)) {
      this.createDmWithUser(userId);
    } else {
      this.openChannel(this.directMessages.find(obj => obj.members.includes(userId))!.id);
    }
  }

  dmAlreadyExist(userId: number) {
    return this.directMessages.some(obj => obj.members.includes(userId));
  }

  async createDmWithUser(userId: number) {
    let members = [];
    members.push(userId);
    members.push(this.authService.currentUser.id);
    const newChannel: Channel = {
      id: 0,
      name: 'DirectMessage',
      members: members,
      is_channel: false,
      read_by: [],
      hash: '',
      description: '',
      picture: undefined,
    }
    const url = environment.baseUrl + 'channels/';
    try {
      const response = await firstValueFrom(this.http.post(url, newChannel)) as Channel;
      await this.getChatsForUser(); //remove
      this.openChannel(response.id);
    } catch (error) {
      this.mainService.popupLog('Error by creating direct message', true);
    }
  }

  resetData() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentChannel');
    this.router.navigate(['/login']);
    this.mainService.loader = false;
    this.setCurrentChannel();
  }
} 