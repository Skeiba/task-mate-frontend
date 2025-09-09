<template>
  <div>
    <button
        @click="toggleSidebar"
        :class="[
        'fixed right-6 top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
        isOpen ? 'mr-96' : ''
      ]"
        title="AI Assistant"
    >
      <X v-if="isOpen" class="w-6 h-6" />
      <Bot v-else class="w-6 h-6" />
    </button>

    <!-- Sidebar -->
    <div
        :class="[
        'fixed right-0 top-0 h-full w-96 bg-color shadow-2xl transform transition-transform duration-300 z-40 flex flex-col overflow-hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-color">AI Assistant</h3>
            <p class="text-xs text-secondary">Task management helper</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="p-4">
        <p class="text-sm font-medium text-secondary mb-3">Quick Actions</p>
        <div class="grid grid-cols-2 gap-2">
          <button
              @click="quickSummarizeToday"
              :disabled="isLoading"
              class="p-3  hover-theme rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar class="w-4 h-4 text-blue-500 mb-1 mx-auto" />
            <p class="text-xs font-medium text-blue-500">Today's Summary</p>
          </button>
          <button
              @click="quickSummarizeAll"
              :disabled="isLoading"
              class="p-3 hover-theme rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <List class="w-4 h-4 text-green-500  mb-1 mx-auto" />
            <p class="text-xs font-medium text-green-500 ">All Tasks</p>
          </button>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="flex">
          <button
              @click="setActiveTab('chat')"
              :class="[
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'chat'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover-theme text-secondary'
            ]"
          >
            Chat
          </button>
          <button
              @click="setActiveTab('summaries')"
              :class="[
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'summaries'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover-theme text-secondary'
            ]"
          >
            Summaries ({{ summaries.length }})
          </button>
        </div>

        <!-- Chat Tab Content -->
        <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col min-h-0">
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref="messagesContainer">
            <!-- Empty State -->
            <div v-if="messages.length === 0" class="text-center py-8">
              <Sparkles class="w-12 h-12 text-secondary mx-auto mb-4" />
              <p class="text-secondary text-sm">
                Start chatting to create tasks or get summaries
              </p>
            </div>

            <!-- Messages -->
            <div
                v-for="message in messages"
                :key="message.id"
                :class="['flex', message.type === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div :class="[
                'flex items-start space-x-2 max-w-xs',
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              ]">
                <!-- Avatar -->
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  message.type === 'user'
                    ? 'text-green-600'
                    : 'text-blue-600'
                ]">
                  <User v-if="message.type === 'user'" class="w-5 h-5 text-green-600" />
                  <Bot v-else class="w-5 h-5 text-blue-600" />
                </div>

                <!-- Message Content -->
                <div :class="[
                  'rounded-lg px-3 py-2',
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-secondary-color text-color'
                ]">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs opacity-75">{{ formatTime(message.timestamp) }}</p>
                    <div class="flex items-center ml-2">
                      <Loader2 v-if="message.isLoading" class="w-3 h-3 animate-spin" />
                      <CheckCircle v-else-if="message.taskCreated" class="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                  <p
                      class="text-sm whitespace-pre-wrap"
                      v-html="md.render(message.content)"
                  ></p>

                </div>
              </div>
            </div>
            <div ref="messagesEnd"></div>
          </div>

          <!-- Chat Input -->
          <div class="border-t border-gray-200  p-4">
            <form @submit.prevent="sendAiMessage" class="flex space-x-2">
              <input
                  v-model="inputValue"
                  type="text"
                  placeholder="Ask me to create tasks or summarize..."
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-secondary-color text-color placeholder-gray-500  text-sm"
                  :disabled="isLoading"
              />
              <button
                  type="submit"
                  :disabled="!inputValue.trim() || isLoading"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-color rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
                <Send v-else class="w-4 h-4" />
              </button>
            </form>

            <!-- Clear Chat Button -->
            <div v-if="messages.length > 0" class="flex justify-between items-center mt-2">
              <button
                  @click="clearChat"
                  class="text-xs text-secondary hover:text-red-600 flex items-center transition-colors"
              >
                <Trash2 class="w-3 h-3 mr-1" />
                Clear chat
              </button>
            </div>
          </div>
        </div>

        <!-- Summaries Tab Content -->
        <div v-else-if="activeTab === 'summaries'" class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-y-auto p-4 min-h-0">
            <!-- Empty State -->
            <div v-if="summaries.length === 0" class="text-center py-8">
              <BarChart3 class="w-12 h-12 text-secondary mx-auto mb-4" />
              <p class="text-secondary text-sm mb-2">No summaries yet</p>
              <p class="text-xs text-secondary opacity-75 mb-4">
                Generate summaries using the quick actions above
              </p>
            </div>

            <!-- Summaries List -->
            <div v-else class="space-y-3">
              <div
                  v-for="summary in summaries"
                  :key="summary.id"
                  class="bg-secondary-color rounded-lg overflow-hidden"
              >
                <!-- Summary Header -->
                <div class="p-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-1">
                        <Calendar v-if="summary.type === 'daily'" class="w-4 h-4 text-blue-600" />
                        <List v-else-if="summary.type === 'all'" class="w-4 h-4 text-green-600" />
                        <Star v-else class="w-4 h-4 text-yellow-600" />
                        <h4 class="text-sm font-medium text-color truncate">{{ summary.title }}</h4>
                      </div>
                      <p class="text-xs text-secondary">{{ formatRelativeTime(summary.timestamp) }}</p>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <button
                          @click="copyToClipboard(summary.content, summary.id)"
                          class="p-1 hover-theme rounded"
                          :title="copiedId === summary.id ? 'Copied!' : 'Copy summary'"
                      >
                        <Check v-if="copiedId === summary.id" class="w-4 h-4 text-green-600" />
                        <Copy v-else class="w-4 h-4 " />
                      </button>
                      <button
                          @click="expandedSummary = expandedSummary === summary.id ? null : summary.id"
                          class="p-1 hover-theme rounded"
                      >
                        <ChevronUp v-if="expandedSummary === summary.id" class="w-4 h-4 " />
                        <ChevronDown v-else class="w-4 h-4 " />
                      </button>
                      <button
                          @click="removeSummary(summary.id)"
                          class="p-1 hover-theme rounded"
                      >
                        <Trash2 class="w-4 h-4  hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Summary Content -->
                <div
                    v-if="expandedSummary === summary.id"
                    class="p-3 bg-secondary-color"
                >
                  <div
                      class="text-sm text-secondary leading-relaxed prose prose-sm max-w-none"
                      v-html="md.render(summary.content)"
                  />
                </div>

                <div v-else class="p-3">
                  <div
                      class="text-sm text-secondary line-clamp-2 prose prose-sm max-w-none"
                      v-html="md.render(summary.content)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Summaries Footer -->
          <div v-if="summaries.length > 0" class=" p-4">
            <div class="flex justify-between items-center">
              <p class="text-xs text-secondary">{{ summaries.length }} summaries</p>
              <button
                  @click="clearSummaries"
                  class="text-xs text-secondary hover:text-red-600 flex items-center transition-colors"
              >
                <Trash2 class="w-4 h-4 mr-1" />
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-25 z-30"
        @click="closeSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Bot,
  X,
  Calendar,
  List,
  Sparkles,
  User,
  Send,
  Loader2,
  CheckCircle,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Star
} from "lucide-vue-next"
import { nextTick, watch, ref } from "vue"
import { useAiChat } from "../composables/useAiChat.ts"
import MarkdownIt from "markdown-it"

const {
  isOpen,
  messages,
  summaries,
  inputValue,
  isLoading,
  activeTab,
  expandedSummary,
  copiedId,

  sendAiMessage,
  quickSummarizeToday,
  quickSummarizeAll,
  removeSummary,
  clearChat,
  clearSummaries,
  toggleSidebar,
  closeSidebar,
  setActiveTab,
  copyToClipboard,
  formatTime,
  formatRelativeTime
} = useAiChat()

const messagesContainer = ref<HTMLElement>()
const messagesEnd = ref<HTMLElement>()

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
})




watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>