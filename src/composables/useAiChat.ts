import { ref, computed, onMounted, watch } from 'vue'
import { aiService } from '../services/aiService'
import type {ChatMessage, Summary, Task} from "../types";

const STORAGE_KEYS = {
    MESSAGES: 'ai-chat-messages',
    SUMMARIES: 'ai-chat-summaries',
    IS_OPEN: 'ai-chat-sidebar-open'
}

export function useAiChat() {
    // State
    const isOpen = ref(false)
    const messages = ref<ChatMessage[]>([])
    const summaries = ref<Summary[]>([])
    const inputValue = ref('')
    const isLoading = ref(false)
    const activeTab = ref<'chat' | 'summaries'>('chat')
    const expandedSummary = ref<string | null>(null)
    const copiedId = ref<string | null>(null)

    const hasMessages = computed(() => messages.value.length > 0)
    const hasSummaries = computed(() => summaries.value.length > 0)
    const recentSummaries = computed(() =>
        summaries.value.slice(0, 5).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    )

    const loadFromStorage = () => {
        try {
            const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES)
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages)
                messages.value = parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            }

            const savedSummaries = localStorage.getItem(STORAGE_KEYS.SUMMARIES)
            if (savedSummaries) {
                const parsed = JSON.parse(savedSummaries)
                summaries.value = parsed.map((summary: any) => ({
                    ...summary,
                    timestamp: new Date(summary.timestamp)
                }))
            }

            const savedIsOpen = localStorage.getItem(STORAGE_KEYS.IS_OPEN)
            if (savedIsOpen) {
                isOpen.value = JSON.parse(savedIsOpen)
            }
        } catch (error) {
            console.error('Failed to load AI chat data from localStorage:', error)
        }
    }

    const saveToStorage = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages.value))
            localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries.value))
            localStorage.setItem(STORAGE_KEYS.IS_OPEN, JSON.stringify(isOpen.value))
        } catch (error) {
            console.error('Failed to save AI chat data to localStorage:', error)
        }
    }

    const addMessage = (type: 'user' | 'ai', content: string, extra?: Partial<ChatMessage>): string => {
        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            content,
            timestamp: new Date(),
            ...extra
        }
        messages.value.push(newMessage)
        return newMessage.id
    }

    const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
        const index = messages.value.findIndex(msg => msg.id === id)
        if (index !== -1) {
            messages.value[index] = { ...messages.value[index], ...updates }
        }
    }

    const removeMessage = (id: string) => {
        const index = messages.value.findIndex(msg => msg.id === id)
        if (index !== -1) {
            messages.value.splice(index, 1)
        }
    }

    const TASK_KEYWORDS = [
        'task', 'todo', 'remind', 'schedule', 'create', 'add', 'do',
        'need to', 'have to', 'should', 'must', 'plan', 'appointment',
        'meeting', 'deadline', 'due', 'finish', 'complete', 'work on'
    ]

    const isTaskRequest = (text: string): boolean => {
        const lowerText = text.toLowerCase()
        return TASK_KEYWORDS.some(keyword => lowerText.includes(keyword))
    }

    const sendMessage = async () => {
        if (!inputValue.value.trim() || isLoading.value) return

        const userMessage = inputValue.value.trim()
        inputValue.value = ''

        addMessage('user', userMessage)

        const aiMessageId = addMessage('ai', 'Processing your request...', { isLoading: true })
        isLoading.value = true

        try {
            if (isTaskRequest(userMessage)) {
                const response = await aiService.parseAndCreateTask(userMessage)

                if (response.success && response.data) {
                    updateMessage(aiMessageId, {
                        content: `I've created a task for you: "${response.data.title}"`,
                        isLoading: false,
                        taskCreated: true,
                        taskId: response.data.id
                    })
                } else {
                    updateMessage(aiMessageId, {
                        content: response.message || "Sorry, I couldn't create a task from that. Could you try rephrasing?",
                        isLoading: false,
                        error: true
                    })
                }
            } else {
                updateMessage(aiMessageId, {
                    content: "I understand you'd like help with that. I specialize in task management - try asking me to create tasks, summarize your progress, or organize your schedule!",
                    isLoading: false
                })
            }
        } catch (error: any) {
            console.error('AI chat error:', error)
            updateMessage(aiMessageId, {
                content: error?.response?.data?.message || "Sorry, I encountered an error. Please try again.",
                isLoading: false,
                error: true
            })
        } finally {
            isLoading.value = false
        }
    }

    const sendAiMessage = async (
        message: string,
        selectedTaskIds?: string[],
        selectedDate?: Date
    ) => {
        if (!inputValue.value.trim() || isLoading.value) return

        message = inputValue.value.trim()
        inputValue.value = ''

        // Add user message
        addMessage('user', message);

        // Add AI message with loading state
        const aiMessageId = addMessage('ai', 'Processing your request...', { isLoading: true });
        isLoading.value = true;

        try {
            const response = await aiService.aiChat(message, selectedTaskIds, selectedDate);

            let botResponseContent: string;
            let messageUpdates: Partial<ChatMessage> = { isLoading: false };

            // Determine response type and format accordingly
            if (typeof response.data === 'string') {
                botResponseContent = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // Check if it's a task object
                if ('title' in response.data && 'id' in response.data) {
                    const createdTask = response.data as Task;
                    messageUpdates.taskCreated = true;
                    messageUpdates.taskId = createdTask.id;

                    // Rich task creation response
                    botResponseContent = `✅ **Task Created Successfully!**\n\n`;
                    botResponseContent += `📋 **Title:** ${createdTask.title}\n`;

                    if (createdTask.content) {
                        botResponseContent += `📝 **Description:** ${createdTask.content}\n`;
                    }
                    if (createdTask.dueDate) {
                        const dueDate = new Date(createdTask.dueDate);
                        botResponseContent += `📅 **Due Date:** ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}\n`;
                    }
                    if (createdTask.priority) {
                        const priorityEmoji = createdTask.priority === 'HIGH' ? '🔥' :
                            createdTask.priority === 'MEDIUM' ? '⚡' : '📝';
                        botResponseContent += `${priorityEmoji} **Priority:** ${createdTask.priority}\n`;
                    }
                    if (createdTask.categories && createdTask.categories.length > 0) {
                        botResponseContent += `🏷️ **Categories:** ${createdTask.categories.map(cat => cat.name).join(', ')}\n`;
                    }
                } else {
                    // Might be a categorization result or other response
                    botResponseContent = "I've processed your request successfully!";
                }
            } else {
                botResponseContent = "I've processed your request successfully!";
            }

            // Update the AI message with the response
            updateMessage(aiMessageId, {
                content: botResponseContent,
                ...messageUpdates
            });

        } catch (error: any) {
            console.error("Error sending AI message:", error);

            let errorContent = "Sorry, I couldn't process your request. Please try again.";

            // Provide more specific error messages
            if (error?.response?.status === 404) {
                errorContent = "The AI service is temporarily unavailable. Please try again later.";
            } else if (error?.response?.status === 400) {
                errorContent = "I couldn't understand your request. Could you please rephrase it?";
            } else if (error?.response?.data?.message) {
                errorContent = error.response.data.message;
            }

            updateMessage(aiMessageId, {
                content: errorContent,
                isLoading: false,
                error: true
            });
        } finally {
            isLoading.value = false;
        }
    };


    const generateSummary = async (
        type: 'daily' | 'all' | 'selected',
        options?: { date?: Date; taskIds?: string[] }
    ) => {
        isLoading.value = true

        try {
            let response
            let title = ''
            let summaryData: Partial<Summary> = {}

            switch (type) {
                case 'daily':
                    const date = options?.date || new Date()
                    response = await aiService.summarizeDailyTasks(date)
                    title = `Daily Summary - ${date.toDateString()}`
                    summaryData = { date: date.toISOString() }
                    break

                case 'all':
                    response = await aiService.summarizeAllTasks()
                    title = 'All Tasks Summary'
                    break

                case 'selected':
                    if (!options?.taskIds?.length) {
                        throw new Error('No tasks selected for summary')
                    }
                    response = await aiService.summarizeTasks(options.taskIds)
                    title = `Summary of ${options.taskIds.length} Selected Tasks`
                    summaryData = { taskIds: options.taskIds }
                    break
            }

            if (response.success && response.data) {
                const newSummary: Summary = {
                    id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type,
                    title,
                    content: response.data,
                    timestamp: new Date(),
                    ...summaryData
                }

                summaries.value.unshift(newSummary)

                addMessage('ai', `${title}\n\n${response.data}`)

                activeTab.value = 'summaries'

                return newSummary
            } else {
                throw new Error(response.message || 'Failed to generate summary')
            }
        } catch (error: any) {
            console.error('Summary generation error:', error)
            addMessage('ai', `Sorry, I couldn't generate the ${type} summary. ${error.message || 'Please try again.'}`)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const quickSummarizeToday = () => generateSummary('daily')
    const quickSummarizeAll = () => generateSummary('all')
    const quickSummarizeSelected = (taskIds: string[]) => generateSummary('selected', { taskIds })

    const removeSummary = (id: string) => {
        const index = summaries.value.findIndex(s => s.id === id)
        if (index !== -1) {
            summaries.value.splice(index, 1)
        }
    }

    const clearSummaries = () => {
        summaries.value = []
        localStorage.removeItem(STORAGE_KEYS.SUMMARIES)
    }

    const clearChat = () => {
        messages.value = []
        localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    }

    const clearAll = () => {
        clearChat()
        clearSummaries()
    }

    const toggleSidebar = () => {
        isOpen.value = !isOpen.value
    }

    const closeSidebar = () => {
        isOpen.value = false
    }

    const openSidebar = () => {
        isOpen.value = true
    }

    const setActiveTab = (tab: 'chat' | 'summaries') => {
        activeTab.value = tab
    }

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            copiedId.value = id
            setTimeout(() => {
                copiedId.value = null
            }, 2000)
            return true
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            return false
        }
    }

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (date: Date): string => {
        const now = new Date()
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === now.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString()
        }
    }

    const formatRelativeTime = (date: Date): string => {
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`

        return date.toLocaleDateString()
    }

    watch(messages, saveToStorage, { deep: true })
    watch(summaries, saveToStorage, { deep: true })
    watch(isOpen, saveToStorage)

    onMounted(() => {
        loadFromStorage()
    })

    return {
        isOpen,
        messages,
        summaries,
        inputValue,
        isLoading,
        activeTab,
        expandedSummary,
        copiedId,

        hasMessages,
        hasSummaries,
        recentSummaries,

        addMessage,
        updateMessage,
        removeMessage,
        sendMessage,
        sendAiMessage,

        generateSummary,
        quickSummarizeToday,
        quickSummarizeAll,
        quickSummarizeSelected,
        removeSummary,
        clearSummaries,

        clearChat,
        clearAll,

        toggleSidebar,
        closeSidebar,
        openSidebar,
        setActiveTab,
        copyToClipboard,

        formatTime,
        formatDate,
        formatRelativeTime,
        isTaskRequest
    }
}