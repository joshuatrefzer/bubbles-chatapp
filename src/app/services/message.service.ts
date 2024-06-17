import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MainService } from './main.service';

export interface Reaction {
  user: number,
  emoji: string,
}

export class Message {
  id: number;
  author: number; //ID from User
  reactions: Reaction[];
  source: number; //ID from Channel
  content: string;
  created_at: number;
  attachment?: string[] | File | null;
  hash: string;

  constructor(obj?: any) {
    this.id = obj ? obj.id : null;
    this.author = obj ? obj.author : null;
    this.reactions = obj ? obj.reactions : [];
    this.source = obj ? obj.source : null;
    this.content = obj ? obj.content : '';
    this.created_at = obj ? obj.created_at : null;
    this.hash = obj ? obj.hash : '';
  }
}

export interface MessagesAndThread {
  messages: Message[],
  thread_messages: Message[],
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messagesFromChatUrl: string = environment.baseUrl + 'messages-and-thread-from-channel/';
  currentThread!: Message;
  currentMessages: Message[] = [];
  threads: Message[] = [];
  showNewMessageComp: boolean = true;

  $messagesAndThread: BehaviorSubject<MessagesAndThread> = new BehaviorSubject<MessagesAndThread>({
    messages: [],
    thread_messages: [],
  });

  constructor(
    private http: HttpClient,
    private mainService: MainService,
  ) { }

  async getMessagesAndThread(chatId: number) {
    try {
      await firstValueFrom(this.fetchMessagesAndThread(chatId))
        .then((data) => {
          this.$messagesAndThread.next(data);
          this.subscribeMessagesAndThreads();
          this.mainService.messageAndThreadFetchingDone = true;
          this.mainService.deactivateLoader();
        });
    } catch (error) {
      this.mainService.popupLog('Error by fetching data for messages and thread', true)
    }
  }

  fetchMessagesAndThread(chatId: number): Observable<MessagesAndThread> {
    const url = this.messagesFromChatUrl + chatId;
    return this.http.get<MessagesAndThread>(url);
  }

  subscribeMessagesAndThreads() {
    this.$messagesAndThread.subscribe(data => {
      this.currentMessages = data.messages;
      this.threads = data.thread_messages;
      this.mainService.chatLoader = false;
    });
  }

  groupMsgByAuthor(channelId: number, isThread: boolean) {
    let groupedArray = [];
    let currentGroup: Message[] = [];
    const seperatedArray = this.seperateChannelByDay(channelId, isThread);
    for (let i = 0; i < seperatedArray.length; i++) {
      if ('author' in seperatedArray[i]) {
        const message = seperatedArray[i] as Message;
        if (currentGroup.length != 0 && currentGroup[0].author !== message.author) {
          groupedArray.push(currentGroup);
          currentGroup = [];
        }
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0)
          groupedArray.push(currentGroup);
        currentGroup = [];
        groupedArray.push(seperatedArray[i]);
      }
    }
    if (currentGroup.length > 0)
      groupedArray.push(currentGroup);
    return groupedArray;
  }


  seperateChannelByDay(channelId: number, isThread: boolean) {
    const sortedArray = this.filterByChannel(channelId, isThread);
    let seperatedArray = [];
    let currentDay;
    for (let i = 0; i < sortedArray.length; i++) {
      const compareDate = new Date(sortedArray[i].created_at)
      if (!currentDay || !this.sameDay(currentDay, compareDate)) {
        currentDay = compareDate;
        seperatedArray.push(currentDay);
      }
      seperatedArray.push(sortedArray[i])
    }
    return seperatedArray;
  }

  sameDay(date1: Date, date2: Date) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  filterByChannel(channelId: number, isThread: boolean) {
    if (isThread) {
      return this.threads.filter(obj => obj.source === channelId);
    } else {
      return this.currentMessages;
    }
  }

  /// Wo wird diese Funktion aufgerufen?? Ist sie überflüssig?
  async getMessage(messageId: number) {
    const url = environment.baseUrl + 'messages/' + messageId + '/';
    const response = await firstValueFrom(this.http.get<Message>(url));
    return response as Message;
  }

  openThread(threadSource: number) {
    this.currentThread = this.currentMessages.find(obj => obj.id === threadSource) as Message;
    this.mainService.threadOpen = true;
    if (window.innerWidth < 1260)
      this.mainService.sideMenuOpen = false;
    this.mainService.scrollEmitThread();
  }

  async patchMessage(message: Message) {
    const endpoint = this.currentMessages.some(obj => obj === message) ? 'messages/' : 'threads/';
    const url = environment.baseUrl + endpoint + message.id + '/';
    const data = {
      'reactions': message.reactions
    }
    try {
      await firstValueFrom(this.http.patch(url, data));
    } catch (error) {
      this.mainService.popupLog('Error by updating message', true);
    }
  }
}