import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChatSelectionService } from './chatV2/chat-selection.service';
import { DetailsPanelService } from './chatV2/details-panel.service';
import { ConversationEventsService } from './chatV2/conversation-events.service';
import { ConversationService } from './chatV2/conversation.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./customer/customer.module').then((m) => m.CustomerModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.module').then((m) => m.ShopModule),
  },
  {
    path: 'book',
    loadChildren: () =>
      import('./booking/booking.module').then((m) => m.BookingModule),
  },
  {
    path: 'chat',
    pathMatch: 'prefix',
    providers: [
      ChatSelectionService,
      ConversationService,
      ConversationEventsService,
      DetailsPanelService,
      CustomerNamePipe,
    ],
    children: [
      {
        path: '**',
        loadComponent: () =>
          import('./chatV2/chat/chat.component').then(
            (mod) => mod.ChatComponent,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
