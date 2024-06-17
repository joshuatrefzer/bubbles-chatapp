import { EventEmitter, Injectable, Output } from '@angular/core';
import { Theme } from '../theme-picker/theme-picker.component';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  @Output() scrollToBottomChat = new EventEmitter();
  @Output() scrollToBottomThread = new EventEmitter();
  @Output() scrollToMessage = new EventEmitter();
  @Output() scrollToThread = new EventEmitter();
  @Output() updateHeader = new EventEmitter();
  @Output() renderGroupMember = new EventEmitter();

  messageToScroll: number | undefined;
  threadToScroll: number | undefined;

  chatLoader: boolean = false;
  loader: boolean = false;

  showPopup: boolean = false;
  addChannelPopup: boolean = false;
  profilePopup: boolean = false;
  addMembersPopup: boolean = false;
  showMembersPopup: boolean = false;
  editChannelPopup: boolean = false;
  popupMessage: string | undefined;
  popupIsError: boolean = true;
  private popupTimeout: any;

  showEmojiPicker: 'thread' | 'chat' | 'reaction' | undefined;
  allEmojis: Array<any> = [];
  categoryList: Array<any> = [];
  emojiUrl: string = 'https://emoji-api.com/emojis?access_key=a3f490babea502cd547755934800ad65f1dd5f65';
  categoryUrl: string = 'https://emoji-api.com/categories?access_key=a3f490babea502cd547755934800ad65f1dd5f65';

  sideMenuOpen: boolean = true;
  threadOpen: boolean = false;
  mainChatOpen: boolean = true;
  showNewMessageSearch: boolean = false;

  userFetchingDone: boolean = false;
  chatsAndPreviewFetchingDone: boolean = false;
  messageAndThreadFetchingDone: boolean = false;

  showThemes: boolean = false;
  showColorPalette: boolean = true;
  selectedTheme: string = localStorage.getItem('selectedTheme') || 'black';
  themes: Theme[] = [{
    name: 'black',
    color1: '#000000',
    color2: '#202020',
    color3: '#666',
    color4: '#35b8bd',
    color5: '#FFFFFF',
    color6: '#adadad', //ausgegrauter text
  },
  {
    name: 'blue',
    color1: '#263250',
    color2: '#354c76',
    color3: '#607599',
    color4: '#35b8bd',
    color5: '#FFFFFF',
    color6: '#adadad',
  },
  {
    name: 'red',
    color1: '#602632',
    color2: '#823d44',
    color3: '#ba7c7e',
    color4: '#35b8bd',
    color5: '#FFFFFF',
    color6: '#adadad',
  },
  {
    name: 'green',
    color1: '#1e2717',
    color2: '#2c3722',
    color3: '#727d69',
    color4: '#35b8bd',
    color5: '#FFFFFF',
    color6: '#adadad',
  },
  {
    name: 'light',
    color1: '#bdbdbd',
    color2: '#e0e0e0',
    color3: '#eee',
    color4: '#35b8bd',
    color5: '#060606',
    color6: '#000000',
  }];

  constructor() {
    this.checkSelectedTheme();
    this.getEmojis();
  }

  scrollEmitChat() {
    setTimeout(() => {
      if (this.messageToScroll) {
        this.scrollToMessage.emit();
        this.messageToScroll = undefined;
      } else if (this.threadToScroll) {
        this.scrollToThread.emit();
      } else {
        this.scrollToBottomChat.emit();
      }
      this.renderGroupMember.emit();
      this.updateHeader.emit();
    }, 500);
  }

  scrollEmitThread() {
    setTimeout(() => {
      if (this.threadToScroll) {
        this.scrollToThread.emit();
        this.threadToScroll = undefined;
      } else {
        this.scrollToBottomThread.emit();
      }
    }, 500);
  }

  popupLog(message: string, isError: boolean) {
    this.popupIsError = isError;
    this.openPopup();
    this.popupMessage = message;
    
    // Setze den Timeout und speichere ihn in der Variable
    this.popupTimeout = setTimeout(() => {
      this.closePopups();
    }, 3000);
  }
  

  openPopup() {
    this.showPopup = true;
  }

  closePopups() {
    this.showPopup = false;
    this.popupMessage = undefined;
    this.addChannelPopup = false;
    this.profilePopup = false;
    this.addMembersPopup = false;
    this.showMembersPopup = false;
    this.editChannelPopup = false;
    this.stopPopupTimeout();
  }

  stopPopupTimeout() {
    clearTimeout(this.popupTimeout);
  }

  checkSelectedTheme() {
    if (!this.themes.some(theme => theme.name === this.selectedTheme)) {
      localStorage.setItem('selectedTheme', 'black');
      this.selectedTheme = 'black';
    }
  }

  /**
  * Fetches emojis from the API.
  */
  getEmojis() {
    fetch(this.emojiUrl)
      .then(res => res.json())
      .then(data => this.loadEmoji(data));

    fetch(this.categoryUrl)
      .then(res => res.json())
      .then(data => this.loadCategorys(data));
  }

  /**
  * Loads emojis from the API response into the emojiList and allEmojis arrays.
  * @param {[]} data - The data containing emojis from the API response.
  */
  loadEmoji(data: []) {
    data.forEach(emoji => {
      this.allEmojis.push(emoji);
    });
  }

  loadCategorys(data: []) {
    data.forEach(category => {
      this.categoryList.push(category);
    });
  }

  deactivateLoader() {
    if (this.userFetchingDone && this.chatsAndPreviewFetchingDone && this.messageAndThreadFetchingDone) {
      this.loader = false;
      this.userFetchingDone = false;
      this.chatsAndPreviewFetchingDone = false;
      this.messageAndThreadFetchingDone = false;
    }
  }

  setTheme() {
    const currentTheme = this.themes.filter(obj => obj.name === this.selectedTheme);
    document.documentElement.style.setProperty('--color1', currentTheme[0].color1);
    document.documentElement.style.setProperty('--color2', currentTheme[0].color2);
    document.documentElement.style.setProperty('--color3', currentTheme[0].color3);
    document.documentElement.style.setProperty('--color4', currentTheme[0].color4);
    document.documentElement.style.setProperty('--color5', currentTheme[0].color5);
    document.documentElement.style.setProperty('--color6', currentTheme[0].color6);
    setTimeout(() => {
      document.documentElement.style.setProperty('--transition', 'all 125ms ease-in-out');
    }, 200);
  }
}