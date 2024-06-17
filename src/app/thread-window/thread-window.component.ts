import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from '../services/channel.service';
import { Message, MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { MessageBarComponent } from '../message-bar/message-bar.component';
import { GroupedMessagesComponent } from '../grouped-messages/grouped-messages.component';
import { SearchComponent } from '../search/search.component';
import { CommonModule } from '@angular/common';
import { CloseComponent } from '../svgs/close/close.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [MessageBarComponent, LoaderComponent, GroupedMessagesComponent, SearchComponent, CommonModule, CloseComponent],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.scss'
})
export class ThreadWindowComponent implements OnInit {
  @Input() threadToDisplay!: Message;
  @ViewChild('chatWrapper') chatWrapper!: any;
  messagesToDisplay: Message[] = [];
  threadMessage: string = '';

  constructor(
    public channelService: ChannelService,
    public messageService: MessageService,
    public authService: AuthService,
    public mainService: MainService,
  ) {
    this.mainService.scrollToBottomThread.subscribe(() => {
      // console.log('stbThread received');

      this.scrollToBottomThread();
    });
    this.mainService.scrollToThread.subscribe(() => {
      if (this.mainService.threadToScroll)
        this.scrollToThread(this.mainService.threadToScroll.toString());
    });
  }

  scrollToBottomThread() {
    if (this.chatWrapper) {
      this.chatWrapper.nativeElement.scrollTop = this.chatWrapper.nativeElement.scrollHeight;
    }
  }

  scrollToThread(threadId: string): void {
    const element = document.getElementById(threadId);

    if (element && this.chatWrapper) {
      this.chatWrapper.nativeElement.scrollTop = element.offsetTop - this.chatWrapper.nativeElement.offsetTop;
      element.classList.add('highlight');
    }
  }

  ngOnInit(): void {
    this.getMessagesToDisplay();
  }

  getMessagesToDisplay() {
    this.messagesToDisplay = this.messageService.threads.filter(obj => obj.source === this.threadToDisplay.id);
  }

  getThreadMessage() {
    this.threadMessage = this.threadToDisplay.content;
  }

  closeThread() {
    this.mainService.threadOpen = false;
  }

  getImg(attachment: any) {
    if (typeof attachment === 'string') {
      return this.channelService.getImg(attachment)
    }
    return false
  }
}