import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, scan, tap } from 'rxjs';
import { Chat, Message, ReactiveChat } from './chat.component';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public readonly chats = new BehaviorSubject<Chat[]>([]);

  private readonly _selectedChat$ = new BehaviorSubject<ReactiveChat | null>(
    null
  );

  public readonly selectedChat$ = this._selectedChat$.asObservable();

  public readonly chats$: Observable<ReactiveChat[]> = this.chats.pipe(
    tap((chats) =>
      chats.sort((a, b) => b.last_update.getTime() - a.last_update.getTime())
    ),
    map((chats) => {
      return chats.map((chat) => {
        const messagesSubject = new BehaviorSubject<Message[]>(chat.messages);
        return {
          ...chat,
          messagesSubject,
          messages$: messagesSubject.asObservable().pipe(
            scan((acc, value) => [...acc, ...value]),
            tap((messages) => {
              if (messages.length) {
                chat.last_update = messages.at(-1)!.date;
              }
            }),
            map((messages) => {
              return messages.sort(
                (a, b) => a.date.getTime() - b.date.getTime()
              );
            })
          ),
        };
      });
    }),
    tap((chats) => {
      if (!this._selectedChat$.getValue()) {
        this.selectChat(chats[0]);
      }
    })
  );

  markAsRead(chat: ReactiveChat) {
    chat.read = true;
  }

  selectChat(chat: ReactiveChat) {
    console.log(chat);
    this.markAsRead(chat);
    this._selectedChat$.next(chat);
  }

  private readonly getChats$ = of([
    {
      id: 'chat1',
      last_update: new Date('Febuary 26, 2023 10:23:45.678'),
      contact: 'Jane',
      messages: [
        {
          id: '4',
          message: 'Great, see you then!',
          sender: true,
          date: new Date('Febuary 26, 2023 10:21:45.678'),
        },
        {
          id: '3',
          message: "Let's meet at 5pm?",
          sender: false,
          date: new Date('Febuary 23, 2023 10:20:45.678'),
        },
        {
          id: '2',
          message: 'Oui et toi?',
          sender: true,
          date: new Date('Febuary 23, 2023 10:19:45.678'),
        },
        {
          id: '1',
          message: 'Salut ca va?',
          sender: false,
          date: new Date('Febuary 21, 2023 10:18:45.678'),
        },
      ],
    },
    {
      id: 'chat2',
      last_update: new Date('January 30, 2023 12:23:45.678'),
      contact: 'Henry',
      messages: [
        {
          id: '3',
          message: 'On fait ca?',
          sender: true,
          date: new Date('January 30, 2023 12:22:45.678'),
        },
        {
          id: '2',
          message: 'Oklm',
          sender: false,
          date: new Date('January 27, 2023 12:21:45.678'),
        },
      ],
    },
    {
      id: 'chat3',
      last_update: new Date('January 28, 2023 15:23:45.678'),
      contact: 'Tom',
      messages: [
        {
          id: '3',
          message: 'See you soon!',
          sender: true,
          date: new Date('January 28, 2023 15:22:45.678'),
        },
        {
          id: '2',
          message: 'Leaving now.',
          sender: false,
          date: new Date('January 28, 2023 15:21:45.678'),
        },
        {
          id: '1',
          message: 'Ready for lunch?',
          sender: true,
          date: new Date('January 28, 2023 15:20:45.678'),
        },
      ],
    },
    {
      id: 'chat4',
      last_update: new Date('January 30, 2023 09:23:45.678'),
      contact: 'Emma',
      messages: [
        {
          id: '2',
          message: "Yes, let's do it!",
          sender: false,
          date: new Date('January 30, 2023 09:22:45.678'),
        },
        {
          id: '1',
          message: 'Ready for the project?',
          sender: true,
          date: new Date('January 30, 2023 09:21:45.678'),
        },
      ],
    },
  ]).pipe(
    map((chats) =>
      chats.map((chat) => ({
        ...chat,
        read: false,
      }))
    ),
    tap((chats) => {
      this.chats.next(chats);
      // this._selectedChat$.next(chats[0]);
    })
  );

  constructor() {
    this.getChats$.subscribe();
  }
}
