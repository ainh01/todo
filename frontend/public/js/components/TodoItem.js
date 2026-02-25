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
      
      <div
        v-if="todo.removed"
        class="todo-btn btn-restore"
        @click="$emit('restore', todo)"
      >
        <img src="public/img/restore.svg" alt="Restore" draggable="false" />
      </div>
      
      <div
        class="todo-btn btn-delete"
        v-else
        @click="$emit('remove', todo)"
      >
        <img src="public/img/delete.svg" alt="Delete" draggable="false" />
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
