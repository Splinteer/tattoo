import { Injectable, inject } from '@angular/core';
import { ChatSelectionService } from './chat-selection.service';
import { Conversation } from './chat.interface';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  readonly #chatSelectionService = inject(ChatSelectionService);

  update(editor: (conversation: Conversation) => Conversation) {
    const selectedProfile = this.#chatSelectionService.selectedChatProfile();
    const conversationId = this.#chatSelectionService.activeConversation();

    if (!selectedProfile || !conversationId) {
      return;
    }

    this.#chatSelectionService.chatsByProfile.update((chatsByProfile) => {
      const updatedChatsByProfile = { ...chatsByProfile };

      const conversations = updatedChatsByProfile[
        selectedProfile
      ].conversations.map((conversation) => {
        if (conversation.project.id === conversationId) {
          return editor(conversation);
        }

        return conversation;
      });

      return {
        ...updatedChatsByProfile,
        [selectedProfile]: {
          conversations,
          noMoreConversation:
            updatedChatsByProfile[selectedProfile].noMoreConversation,
        },
      };
    });

    // this.#chatSelectionService.chatsByProfile.set

    // this.#chatSelectionService.chatsByProfile.update((chatsByProfile) => {
    //   const updatedChatsByProfile = { ...chatsByProfile };

    //   const conversations = updatedChatsByProfile[selectedProfile].map(
    //     (conversation) => {
    //       if (conversation.project.id === conversationId) {
    //         return editor(conversation);
    //       }

    //       return conversation;
    //     },
    //   );

    //   return {
    //     ...updatedChatsByProfile,
    //     [selectedProfile]: conversations,
    //   };
    // });
  }
}
