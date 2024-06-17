import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Message, MessageService } from '../services/message.service';
import { AuthService, CurrentUser } from '../services/auth.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { EmojiPickerDialogComponent } from '../emoji-picker-dialog/emoji-picker-dialog.component';
import { UserService } from '../services/user.service';
import { ReactionsComponent } from '../reactions/reactions.component';
import { Subject, firstValueFrom } from 'rxjs';
import { MessageBarComponent, MessageContent } from '../message-bar/message-bar.component';
import { ChannelService } from '../services/channel.service';
import { MainService } from '../services/main.service';
import { AddReactionComponent } from '../svgs/add-reaction/add-reaction.component';
import { DeleteComponent } from '../svgs/delete/delete.component';
import { EditDocumentComponent } from '../svgs/edit-document/edit-document.component';
import { HeartComponent } from '../svgs/heart/heart.component';
import { LikeComponent } from '../svgs/like/like.component';
import { RocketComponent } from '../svgs/rocket/rocket.component';
import { ReplyComponent } from '../svgs/reply/reply.component';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, EmojiPickerDialogComponent, ReactionsComponent, MessageBarComponent,
    // reaction components:
    AddReactionComponent, DeleteComponent, EditDocumentComponent, HeartComponent, LikeComponent, RocketComponent, ReplyComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() myMessage!: boolean;
  currentUser: CurrentUser;
  showEmojiPicker: boolean = false;
  allReactions: any[] = [];
  reactionsPreview: any[] = [];
  expandReaction: boolean = true;
  editState: boolean = false;

  addedReaction: Subject<void> = new Subject<void>();

  constructor(
    public authService: AuthService,
    public messageService: MessageService,
    public userService: UserService,
    public channelService: ChannelService,
    private http: HttpClient,
    public scroller: ViewportScroller,
  ) {
    this.currentUser = authService.currentUser;
    this.setupClickListener();
  }

  getImage() {
    if (typeof this.message.attachment === 'string')
      return this.channelService.getImg(this.message.attachment);
    else {
      return 'assets/img/profile_placeholder.svg'
    }
  }

  thread() {
    const threadMsg = this.messageService.threads.find(obj => obj.source === this.message.id)
    return threadMsg != undefined;
  }

  private setupClickListener() {
    document.addEventListener('click', () => {
      this.showEmojiPicker = false;
    });
  }

  openEmojiPicker() {
    setTimeout(() => {
      this.showEmojiPicker = true;
    }, 1);
  }

  addReaction(character: string) {
    const reaction = {
      user: this.currentUser.id,
      emoji: character,
    };
    if (this.message.reactions.length > 0 && this.message.reactions.some(obj => obj.emoji === reaction.emoji && obj.user === reaction.user)) {
      const reactionIndex = this.message.reactions.findIndex(obj => obj.emoji === reaction.emoji && obj.user === reaction.user);
      this.message.reactions.splice(reactionIndex, 1);
    } else {
      this.message.reactions.push(reaction);
    }
    this.messageService.patchMessage(this.message);
    this.addedReaction.next();
    this.showEmojiPicker = false;
  }

  getCharater($event: any) {
    return $event.character
  }

  sourceIsChannel() {
    return this.messageService.currentMessages.some(obj => obj.hash === this.message.hash);
  }

  editMessage(messageContent: MessageContent) {
    this.message.content = messageContent.content;
    this.updateMessage(this.message);
    this.editState = false;
  }


  async updateMessage(message: Message) {
    const url = environment.baseUrl + 'messages/' + message.id + '/';
    const formData = new FormData();
    formData.append('content', message.content);
    const response = await firstValueFrom(this.http.patch(url, formData));
    this.updateLocalArray(response as Message);
    this.channelService.startPollingForMessages(this.message.source);
  }

  updateLocalArray(messageToUpdate: Message){
    const index = this.messageService.currentMessages.findIndex(message => message.id === messageToUpdate.id);
    this.messageService.currentMessages[index] = messageToUpdate;
  }

  toggleEditState(){
    this.channelService.stopPollingForMessages();
    this.editState = !this.editState;
  }
}