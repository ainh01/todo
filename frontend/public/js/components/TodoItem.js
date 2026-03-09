export default {
    name: 'TodoItem',
    props: {
        todo: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        editedTodo: {
            type: Object,
            default: null
        },
        delayTime: {
            type: String,
            default: '1'
        }
    },

    template: `
    <li
      class="todo-item"
      :class="{'todo-item--saving': todo.saving, 'todo-item--error': todo.saveError}"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      :data-delay="index * 150 * delayTime"
      :draggable="!isEditing"
    >
      <div
        class="todo-content"
        :class="{completed: todo.completed}"
        @dblclick="handleEdit"
        v-html="renderedContent"
        v-if="!isEditing"
      >
      </div>
      
      <div
        class="todo-content"
        :class="{completed: todo.completed}"
        @dblclick="handleEdit"
        v-if="isEditing"
      >
        {{ todo.title }}
      </div>
      
      <div
        class="todo-btn btn-finish"
        v-if="!todo.completed"
        @click="$emit('complete', todo)"
      ></div>
      
      <div
        class="todo-btn btn-unfinish"
        v-if="todo.completed"
        @click="$emit('uncomplete', todo)"
      >
        <img
          src="public/img/complete.svg"
          alt="Mark as Incomplete"
          class="icon-finish"
          draggable="false"
        />
      </div>
      
      <!-- Copy button for hidden prompts -->
      <div
        class="todo-btn btn-copy"
        v-if="hasHiddenPrompt && !isEditing"
        @click="copyPromptContent"
        title="Copy hidden prompt"
      >
        <img src="public/img/copy.svg" alt="Copy Prompt" draggable="false" />
      </div>
      
      <div
        v-if="todo.removed"
        class="todo-btn btn-restore"
        @click="$emit('restore', todo)"
      >
        <img src="public/img/restore.svg" alt="Restore" draggable="false" />
      </div>
      
      <div
        v-else-if="todo.saving"
        class="todo-saving-indicator"
      >
        <div class="todo-saving-spinner"></div>
      </div>

      <div
        class="todo-btn btn-delete"
        v-else
        @click="$emit('remove', todo)"
      >
        <img src="public/img/delete.svg" alt="Delete" draggable="false" />
      </div>

      <div v-if="todo.saveError" class="todo-error-bar">
        <span class="todo-error-msg">&#9888; {{ todo.saveErrorMsg || 'Save failed' }}</span>
        <button class="btn-retry-task" @click.stop="$emit('retry', todo)">Retry</button>
        <button class="btn-discard-task" @click.stop="$emit('remove', todo)">Discard</button>
      </div>

      <div class="edit-todo-wrapper" v-if="isEditing">
        <input
          type="text"
          class="edit-todo"
          v-model="todo.title"
          v-focus
          @keyup.enter="handleEditDone"
          @keyup.esc="handleEditCancel"
          @dragstart.stop.prevent
          @mousedown.stop
        />
        <div class="todo-btn btn-edit-submit" @click="handleEditDone">
          <img src="public/img/submit.svg" alt="Submit" draggable="false" />
        </div>
      </div>
    </li>
  `,

    computed: {
        isEditing() {
            return this.editedTodo !== null && this.editedTodo.id === this.todo.id;
        },

        hasHiddenPrompt() {
            return this.todo.title.includes('fPrompt[') && this.todo.title.includes('fPromptEnd]');
        },

        renderedContent() {
            let content = this.todo.title;

            // Step 1: Extract and hide prompt content
            const promptPattern = /fPrompt\[(.*?)fPromptEnd\]/gs;
            let displayContent = content.replace(promptPattern, '').trim();

            // Step 2: Render mathematics with KaTeX
            if (window.katex) {
                try {
                    // Handle display math $$...$$
                    displayContent = displayContent.replace(/\$\$([^$]+)\$\$/g, (match, mathContent) => {
                        try {
                            return katex.renderToString(mathContent.trim(), {
                                displayMode: true,
                                throwOnError: false,
                                strict: false
                            });
                        } catch (e) {
                            console.warn('KaTeX display math error:', e);
                            return match;
                        }
                    });

                    // Handle inline math $...$
                    displayContent = displayContent.replace(/\$([^$]+)\$/g, (match, mathContent) => {
                        try {
                            return katex.renderToString(mathContent.trim(), {
                                displayMode: false,
                                throwOnError: false,
                                strict: false
                            });
                        } catch (e) {
                            console.warn('KaTeX inline math error:', e);
                            return match;
                        }
                    });
                } catch (error) {
                    console.error('KaTeX rendering error:', error);
                }
            }

            return displayContent;
        },

        hiddenPromptContent() {
            const promptPattern = /fPrompt\[(.*?)fPromptEnd\]/gs;
            const matches = [...this.todo.title.matchAll(promptPattern)];
            return matches.map(match => match[1]).join('\n\n');
        }
    },

    methods: {
        handleEdit() {
            this.$emit('edit', this.todo);
        },

        handleEditDone() {
            this.$emit('edit-done', this.todo);
        },

        handleEditCancel() {
            this.$emit('edit-cancel', this.todo);
        },

        handleDragStart(event) {
            this.$emit('drag-start', this.index);
            event.dataTransfer.setData('text/plain', JSON.stringify(this.todo));
            event.dataTransfer.effectAllowed = 'move';
        },

        handleDragEnter(event) {
            event.preventDefault();
            this.$emit('drag-enter', this.index);
        },

        handleDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            this.$emit('drag-over', this.index);
        },

        handleDragEnd(event) {
            event.preventDefault();
            this.$emit('drag-end');
        },

        async copyPromptContent() {
            if (!this.hasHiddenPrompt) return;

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(this.hiddenPromptContent);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = this.hiddenPromptContent;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                }

                this.showCopyFeedback();
            } catch (error) {
                console.error('Copy failed:', error);
                alert('Copy failed. Please select and copy manually.');
            }
        },

        showCopyFeedback() {
            const copyBtn = this.$el.querySelector('.btn-copy');
            if (copyBtn) {
                const originalTitle = copyBtn.title;
                copyBtn.title = 'Copied!';
                copyBtn.style.background = '#16a34a';
                copyBtn.style.borderColor = '#16a34a';

                setTimeout(() => {
                    copyBtn.title = originalTitle;
                    copyBtn.style.background = '';
                    copyBtn.style.borderColor = '';
                }, 1000);
            }
        }
    },

    directives: {
        focus: {
            inserted: function (el) {
                el.focus();
            }
        }
    }
};
