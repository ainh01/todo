import { TodoStorage } from '../modules/todoStorage.js';
import { ApiService } from '../modules/apiService.js';
import { DialogUtils } from '../modules/dialogUtils.js';
import { FileHandlers } from '../modules/fileHandlers.js';
import { logout } from '../modules/authGuard.js';
import TodoItem from './TodoItem.js';
import SidebarActions from './SidebarActions.js';
import SequenceTaskDialog from './SequenceTaskDialog.js';

export default {
    name: 'TodoApp',
    components: {
        TodoItem,
        SidebarActions,
        SequenceTaskDialog
    },

    template: `
    <div>
      <div class="container header">
        <div class="todo-input">
          <h1 class="title">
            <img src="public/img/todo.svg" alt="" class="title-1" draggable="false" />
            <div class="ani-vector">
              <span></span><span></span>
            </div>
            <div class="pendulums">
              <div class="pendulum">
                <div class="bar"></div>
                <div class="motion">
                  <div class="string"></div>
                  <div class="weight"></div>
                </div>
              </div>
              <div class="pendulum shadow">
                <div class="bar"></div>
                <div class="motion">
                  <div class="string"></div>
                  <div class="weight"></div>
                </div>
              </div>
            </div>
          </h1>
          <div class="add-content-wrapper">
            <input
              type="text"
              class="add-content"
              placeholder="Add a to-do item..."
              v-model="newTodoTitle"
              @keyup.enter="addTodo"
              :class="{empty: emptyChecked}"
            />
            <transition name="tips">
              <div class="tips" v-if="emptyChecked" style="color: red">
                💡Please enter content!
              </div>
            </transition>
            <button class="btn submit-btn" type="button" @click="addTodo">
              Add
            </button>
          </div>
        </div>
      </div>

      <div class="container main">
        <div class="todo-list-box">
          <div class="bar-message">
            <input
              type="button"
              class="btn btn-label btn-allFinish"
              value="Mark All Done"
              @click="markAllAsCompleted"
              v-if="todos.length || recycleBin.length"
            />
            <div>
              <div
                v-if="!isEditing"
                @dblclick="editSlogan"
                class="bar-message-text"
              >
                {{ slogan }}
              </div>
              <div v-else>
                <input
                  v-model="slogan"
                  ref="sloganInput"
                  class="slogan-input"
                  @keyup.enter="saveSlogan"
                  @keyup.esc="cancelSloganEdit"
                />
                <div class="todo-btn btn-edit-submit slogan-btn" @click="saveSlogan">
                  <img src="public/img/delete.svg" alt="Finish" />
                </div>
              </div>
            </div>
          </div>

          <ul v-if="!todos.length && showEmptyTips" class="empty-tips">
            <li>Add Your First To-Do Item! 📝</li>
            <li>Usage Tips 💡:</li>
            <li>✔️ Press Enter to submit actions.</li>
            <li>✔️ Drag to reorder your to-dos (PC only)</li>
            <li>✔️ Double-click to edit slogan and tasks.</li>
            <li>✔️ Access quick actions in the right sidebar.</li>
            <li>🔒 Your data is stored in the cloud.</li>
            <li>📝 Supports data download and import.</li>
          </ul>

          <transition-group
            name="drag"
            class="todo-list"
            tag="ul"
            mode="in-out"
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
            :css="false"
            appear
          >
            <TodoItem
              v-for="(todo, index) in filteredTodos"
              :key="todo.id"
              :todo="todo"
              :index="index"
              :editedTodo="editedTodo"
              :delayTime="delayTime"
              @edit="editTodo"
              @edit-done="editDone"
              @edit-cancel="cancelEdit"
              @complete="markAsCompleted"
              @uncomplete="markAsUncompleted"
              @remove="removeTodo"
              @restore="restoreTodo"
              @drag-start="dragstart"
              @drag-enter="dragenter"
              @drag-over="dragover"
              @drag-end="dragend"
            />
          </transition-group>

          <div class="bar-message bar-bottom">
            <div class="bar-message-text">
              <span v-if="leftTodosCount">{{ leftTodosCount }} items remaining</span>
              <span v-else-if="completedTodosCount">All completed, good job!</span>
            </div>
          </div>
        </div>

        <SidebarActions
          :todos="todos"
          :recycleBin="recycleBin"
          :intention="intention"
          :leftTodosCount="leftTodosCount"
          :completedTodosCount="completedTodosCount"
          :isShow="isShow"
          :shortCut="shortCut"
          @update:intention="intention = $event"
          @mark-all-completed="markAllAsCompleted"
          @clear-completed="clearCompleted"
          @clear-all="clearAll"
          @export-data="handleExportData"
          @import-data="handleImportData"
          @toggle-sidebar="toggleSidebar"
          @open-sequence-dialog="openSequenceDialog"
        />
      </div>

      <div class="nav">
        <span>{{ userEmail }}</span>
        <div class="github">
          <a href="https://github.com/ainh01/todo" target="_blank" class="social-link" draggable="false">
            <img src="public/img/social/github.svg" class="ic-social" alt="" draggable="false" />
          </a>
        </div>
                <div class="about">
          <div class="info">
            <div class="info-ico" @click="togglePop" :style="{ fontWeight: popShow ? 'normal' : 'bold' }">
              About
            </div>
            <div class="popup animated popIn" v-if="!popShow">
              <div class="author">
                <img src="public/img/author.png" alt="" />
                Ainh01
              </div>
              <div class="author-info">
                <div class="author-desc">Hate cod-</div>
              </div>
              <div class="social">
                <a href="https://github.com/ainh01/todo" target="_blank" class="social-link" draggable="false">
                  <img src="public/img/social/github.svg" class="ic-social" alt="" draggable="false" />
                </a>
                <a href="mailto:binhtx204@gmail.com" class="social-link">
                  <img src="public/img/social/mail.svg" class="ic-social" alt="" />
                </a>
              </div>
              <a href="https://www.facebook.com/Binh.MM.mm" target="_blank" class="inspiration">🔖Facebook↗</a>
            </div>
          </div>
        </div>
                <div class="rush-nav" style="margin-right:15px">
                    <button
                        class="shortcut-title"
                        style="background-color: rgb(255, 112, 191); border-radius: 3px; color: white; margin-right: 8px;"
                        @click="navigateToRush"
                    >
                        RUSH mode
                    </button>
                </div>
                <div class="user-info">
          <button
            class="shortcut-title"
            style="background-color: rgb(250, 233, 254); border-radius: 3px"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>

      <SequenceTaskDialog
        v-if="showSequenceDialog"
        @close="closeSequenceDialog"
        @create="handleSequenceCreate"
      />
    </div>
  `,

    data() {
        return {
            todos: [],
            recycleBin: [],
            newTodoTitle: '',
            editedTodo: null,
            intention: 'all',
            checkEmpty: false,
            dragIndex: null,
            originalIndex: null,
            draggedItem: null,
            delayTime: '1',
            isShow: false,
            shortCut: 'OPEN✨',
            popShow: true,
            slogan: TodoStorage.getSlogan(),
            isEditing: false,
            originalSlogan: '',
            userEmail: localStorage.getItem('user_email') || '',
            isLoading: false,
            showSequenceDialog: false,
            sound: new Audio('/public/sound/confetti.mp3'),
            confettiColors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
        };
    },

    async created() {
        await this.loadTodos();
        this.setupLanguage();
    },

    computed: {
        emptyChecked() {
            return this.newTodoTitle.length === 0 && this.checkEmpty;
        },

        leftTodos() {
            return this.todos.filter(todo => !todo.completed && !todo.removed);
        },

        leftTodosCount() {
            return this.leftTodos.length;
        },

        completedTodos() {
            return this.todos.filter(todo => todo.completed && !todo.removed);
        },

        completedTodosCount() {
            return this.completedTodos.length;
        },

        filteredTodos: {
            get() {
                switch (this.intention) {
                    case 'ongoing': return this.leftTodos;
                    case 'completed': return this.completedTodos;
                    case 'removed': return this.recycleBin;
                    default: return this.todos.filter(todo => !todo.removed);
                }
            },
            set(newValue) {
                if (this.intention === 'all') {
                    this.todos = newValue;
                } else if (this.intention === 'removed') {
                    this.recycleBin = newValue;
                }
            }
        },

        showEmptyTips() {
            return this.filteredTodos.length === 0 && this.intention !== 'removed';
        }
    },

    methods: {
        setupLanguage() {
            localStorage.setItem('uiineed-todos-lang', 'en');
        },

        async loadTodos() {
            this.isLoading = true;
            try {
                const fetchedTodos = await TodoStorage.fetch();
                this.todos = fetchedTodos;
            } catch (error) {
                await DialogUtils.alert('Failed to load todos: ' + error.message, 'Error');
            } finally {
                this.isLoading = false;
            }
        },

        editSlogan() {
            this.originalSlogan = this.slogan;
            this.isEditing = true;
            this.$nextTick(() => {
                this.$refs.sloganInput.focus();
            });
        },

        saveSlogan() {
            this.isEditing = false;
            TodoStorage.saveSlogan(this.slogan);
        },

        cancelSloganEdit() {
            this.slogan = this.originalSlogan;
            this.isEditing = false;
        },

        async addTodo() {
            if (this.newTodoTitle === '') {
                this.checkEmpty = true;
                return;
            }

            try {
                const response = await ApiService.createTask(this.newTodoTitle);
                const newTodo = response.data || response;

                this.todos.unshift({
                    id: newTodo.task_id,
                    title: newTodo.title,
                    slot: newTodo.slot,
                    completed: newTodo.finished || false,
                    removed: false,
                });

                this.newTodoTitle = '';
                this.checkEmpty = false;
                this.delayTime = '0';
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Failed to add todo: ' + error.message, 'Error');
            }
        },

        async markAsCompleted(todo) {
            try {
                this.sound.currentTime = 0;
                await ApiService.finishTask(todo.id, true);
                await this.loadTodos();
                this.celebrateCompletion();
            } catch (error) {
                await DialogUtils.alert('Failed to mark as completed: ' + error.message, 'Error');
            }
        },

        async markAsUncompleted(todo) {
            try {
                await ApiService.finishTask(todo.id, false);
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Failed to mark as uncompleted: ' + error.message, 'Error');
            }
        },

        celebrateCompletion() {
            this.sound.play();
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 350,
                    startVelocity: 88,
                    drift: 0.3,
                    angle: 45,
                    spread: 70,
                    origin: { x: 0.0, y: 1.0 },
                    colors: this.confettiColors,
                });
                confetti({
                    particleCount: 350,
                    startVelocity: 88,
                    drift: 0.3,
                    angle: 135,
                    spread: 70,
                    origin: { x: 1.0, y: 1.0 },
                    colors: this.confettiColors,
                });
            }
        },

        async markAllAsCompleted() {
            const confirmed = await DialogUtils.confirm('Confirm to mark all as completed?');
            if (!confirmed) return;

            try {
                const incompleteTodos = this.todos.filter(todo => !todo.completed && !todo.removed);
                if (incompleteTodos.length === 0) {
                    await DialogUtils.alert('No incomplete tasks to mark as completed.', 'Info');
                    return;
                }

                await Promise.all(
                    incompleteTodos.map(todo => ApiService.finishTask(todo.id, true))
                );

                this.celebrateCompletion();
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Some items failed to update: ' + error.message, 'Error');
            }
        },

        editTodo(todo) {
            this.editedTodo = {
                id: todo.id,
                title: todo.title,
                originalTitle: todo.title,
            };
        },

        async editDone(todo) {
            if (todo.title === '') {
                const confirmed = await DialogUtils.confirm(
                    'Task title is empty. Delete this task?',
                    'Confirm Deletion'
                );
                if (confirmed) {
                    await this.removeTodo(todo);
                } else {
                    todo.title = this.editedTodo.originalTitle;
                }
                this.editedTodo = null;
                return;
            }

            try {
                await ApiService.updateTask(todo.id, todo.title);
                this.editedTodo = null;
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Failed to update todo: ' + error.message, 'Error');
                if (this.editedTodo && this.editedTodo.id === todo.id) {
                    todo.title = this.editedTodo.originalTitle;
                }
                this.editedTodo = null;
                await this.loadTodos();
            }
        },

        cancelEdit(todo) {
            if (this.editedTodo && this.editedTodo.id === todo.id) {
                todo.title = this.editedTodo.originalTitle;
            }
            this.editedTodo = null;
        },

        async removeTodo(todo) {
            try {
                await ApiService.deleteTask(todo.id);
                const removedTodo = this.todos.splice(this.todos.indexOf(todo), 1)[0];
                removedTodo.removed = true;
                this.recycleBin.unshift(removedTodo);
            } catch (error) {
                await DialogUtils.alert('Failed to delete todo: ' + error.message, 'Error');
                await this.loadTodos();
            }
        },

        async restoreTodo(todo) {
            try {
                const response = await ApiService.createTask(todo.title);
                const restoredTodoData = response.data || response;

                const newTodo = {
                    id: restoredTodoData.task_id,
                    title: restoredTodoData.title,
                    slot: restoredTodoData.slot,
                    completed: restoredTodoData.finished || false,
                    removed: false,
                };

                this.todos.unshift(newTodo);

                const pos = this.recycleBin.indexOf(todo);
                if (pos > -1) {
                    this.recycleBin.splice(pos, 1);
                }
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Failed to restore todo: ' + error.message, 'Error');
                await this.loadTodos();
            }
        },

        async clearCompleted() {
            const confirmed = await DialogUtils.confirm('Confirm to clear all completed items?');
            if (!confirmed) return;

            try {
                const completedTodos = this.todos.filter(todo => todo.completed && !todo.removed);
                if (completedTodos.length === 0) {
                    await DialogUtils.alert('No completed tasks to clear.', 'Info');
                    return;
                }

                await Promise.all(completedTodos.map(todo => ApiService.deleteTask(todo.id)));
                await this.loadTodos();
                this.recycleBin = this.recycleBin.concat(
                    completedTodos.map(todo => ({ ...todo, removed: true }))
                );
            } catch (error) {
                await DialogUtils.alert('Failed to clear completed items: ' + error.message, 'Error');
            }
        },

        async clearAll() {
            const confirmed = await DialogUtils.confirm('Confirm to clear all todo items?');
            if (!confirmed) return;

            try {
                if (this.todos.length === 0 && this.recycleBin.length === 0) {
                    await DialogUtils.alert('No tasks to clear.', 'Info');
                    return;
                }

                const allTaskIds = [
                    ...this.todos.map(t => t.id),
                    ...this.recycleBin.map(t => t.id),
                ];

                await Promise.all(allTaskIds.map(id => ApiService.deleteTask(id)));

                this.recycleBin = this.recycleBin.concat(
                    this.todos.map(todo => ({ ...todo, removed: true }))
                );
                this.todos = [];
                await this.loadTodos();
            } catch (error) {
                await DialogUtils.alert('Failed to clear all items: ' + error.message, 'Error');
            }
        },

        dragstart(index) {
            this.dragIndex = index;
            this.originalIndex = index;
            this.draggedItem = this.filteredTodos[index];
        },

        dragenter(index) {
            if (this.dragIndex !== index && this.draggedItem) {
                if (['ongoing', 'completed', 'all'].includes(this.intention)) {
                    const movedItem = this.filteredTodos.splice(this.dragIndex, 1)[0];
                    this.filteredTodos.splice(index, 0, movedItem);
                    this.dragIndex = index;
                }
            }
        },

        dragover(index) {
        },

        async dragend() {
            if (this.draggedItem && this.originalIndex !== this.dragIndex) {
                const targetSlot = this.dragIndex + 1;

                try {
                    await ApiService.moveTask(this.draggedItem.id, targetSlot);
                    await this.loadTodos();
                } catch (error) {
                    console.error('Failed to move task:', error);
                    await DialogUtils.alert('Failed to move task: ' + error.message, 'Error');
                    await this.loadTodos();
                }
            }

            this.draggedItem = null;
            this.originalIndex = null;
            this.dragIndex = null;
        },

        beforeEnter(dom) {
            dom.classList.add('drag-enter-active');
        },

        enter(dom, done) {
            const delay = dom.dataset.delay;
            setTimeout(() => {
                this.delayTime = '1';
                dom.classList.remove('drag-enter-active');
                dom.classList.add('drag-enter-to');
                const transitionend = window.ontransitionend ? 'transitionend' : 'webkitTransitionEnd';
                dom.addEventListener(transitionend, function onEnd() {
                    dom.removeEventListener(transitionend, onEnd);
                    done();
                });
            }, delay);
        },

        afterEnter(dom) {
            dom.classList.remove('drag-enter-to');
        },

        async handleExportData() {
            await FileHandlers.exportTodos(this.todos);
        },

        handleImportData() {
            FileHandlers.importTodos(async () => {
                await this.loadTodos();
            });
        },

        togglePop() {
            this.popShow = !this.popShow;
        },

        toggleSidebar() {
            this.isShow = !this.isShow;
            this.shortCut = this.isShow ? '＝' : 'OPEN✨';
        },

        openSequenceDialog() {
            this.showSequenceDialog = true;
        },

        closeSequenceDialog() {
            this.showSequenceDialog = false;
        },

        async handleSequenceCreate(tasks) {
            try {
                for (let task of tasks) {
                    await ApiService.createTask(task.title);
                }
                await this.loadTodos();
                this.closeSequenceDialog();
            } catch (error) {
                await DialogUtils.alert('Failed to create sequence tasks: ' + error.message, 'Error');
            }
        },

        navigateToRush() {
            window.location.href = 'rush.html';
        },

        logout
    },
};
