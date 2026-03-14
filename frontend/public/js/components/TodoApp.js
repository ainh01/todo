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
              placeholder="Add a to-do item... (Prefix with 'VIP' for task decomposition)"
              v-model="newTodoTitle"
              @keyup.enter="addTodo"
              :class="{empty: emptyChecked}"
              :disabled="isProcessingLongTask"
            />

            <div v-if="isProcessingLongTask" class="vip-processing">
              <div class="loading-spinner"></div>
              <span class="processing-text">{{ longTaskMessage }}</span>
            </div>

            <transition name="tips">
              <div class="tips" v-if="emptyChecked" style="color: red">
                💡Please enter content!
              </div>
            </transition>
            <button
              class="btn submit-btn"
              type="button"
              @click="addTodo"
              :disabled="isProcessingLongTask"
            >
              {{ isProcessingLongTask ? 'Processing...' : 'Add' }}
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
              @retry="retryAddTodo"
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
          :currentKey="currentKey"
          @update:intention="intention = $event"
          @mark-all-completed="markAllAsCompleted"
          @clear-completed="clearCompleted"
          @clear-all="clearAll"
          @export-data="handleExportData"
          @import-data="handleImportData"
          @toggle-sidebar="toggleSidebar"
          @open-sequence-dialog="openSequenceDialog"
          @convert-rush="convertToRush"
          @open-space-dialog="openSpaceDialog"
        />
      </div>

      <div class="nav">
        <span>{{ userEmail }}</span>
        <div class="github">
          <a href="http://anhhoctap.surge.sh/" target="_blank" class="social-link" draggable="false">
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

      <div class="custom-alert-overlay" v-if="showSpaceDialog">
        <div class="custom-alert">
          <div class="custom-alert-title">Change Space</div>
          <div class="custom-alert-content">
                        <div v-for="space in spaceList" :key="space.key" style="margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <label style="cursor:pointer; flex:1;">
                                <input type="radio" :value="space.key" v-model="selectedSpaceKey" />
                                {{ space.key }}
                                <span style="opacity:.6; font-size:.85em">({{ space.taskCount }} tasks)</span>
                            </label>
                            <button
                                type="button"
                                class="custom-alert-btn cancel"
                                style="padding:4px 8px; min-width:60px;"
                                @click="deleteSetKey(space.key)"
                                :disabled="isChangingSpace || !!deletingSpaceKey || spaceList.length <= 1"
                            >
                                {{ deletingSpaceKey === space.key ? 'Deleting...' : 'Delete' }}
                            </button>
            </div>
                        <div v-if="spaceList.length === 1" style="opacity:.6; font-size:.85em; margin-bottom:8px;">At least one set key is required.</div>
            <div style="margin-bottom:8px">
              <label style="cursor:pointer">
                <input type="radio" value="__new__" v-model="selectedSpaceKey" />
                Create new...
              </label>
              <input
                v-if="selectedSpaceKey === '__new__'"
                type="text"
                v-model="newSpaceName"
                placeholder="New space name"
                style="margin-top:4px; width:100%; padding:4px 6px; box-sizing:border-box;"
                @keyup.enter="confirmChangeSpace"
              />
            </div>
            <div v-if="!spaceList.length" style="opacity:.6">Loading sets...</div>
          </div>
          <div class="custom-alert-buttons">
            <button class="custom-alert-btn cancel"
              @click="showSpaceDialog = false"
              :disabled="isChangingSpace">Cancel</button>
            <button class="custom-alert-btn confirm"
              @click="confirmChangeSpace"
              :disabled="isChangingSpace || !selectedSpaceKey || (selectedSpaceKey === '__new__' && !newSpaceName.trim())">
              {{ isChangingSpace ? 'Changing...' : 'Change' }}
            </button>
          </div>
        </div>
      </div>
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
            pendingOperations: new Set(),
            syncErrors: [],
            isProcessingLongTask: false,
            longTaskMessage: '',
            _lastRefreshAt: 0,
            showSpaceDialog: false,
            spaceList: [],
            selectedSpaceKey: '',
            isChangingSpace: false,
            currentKey: '',
            newSpaceName: '',
            deletingSpaceKey: '',
        };
    },

    async created() {
        await this.loadTodos();
        this.setupLanguage();
        try {
            const res = await ApiService.getSets();
            const sets = res.data || [];
            const stored = localStorage.getItem('current_set_key');
            if (stored && sets.some(s => s.key === stored)) {
                this.currentKey = stored;
            } else if (sets.length) {
                this.currentKey = sets[0].key;
            } else {
                this.currentKey = 'Default';
            }
        } catch(e) {
            this.currentKey = localStorage.getItem('current_set_key') || 'Default';
        }
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
                if (error.isNetworkError) {
                    console.warn('Failed to load todos (network error), will retry silently');
                    this.silentRefresh();
                } else {
                    await DialogUtils.alert('Failed to load todos: ' + error.message, 'Error');
                }
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

            const trimmedTitle = this.newTodoTitle.trim();
            const isVIPTask = trimmedTitle.toLowerCase().startsWith('vip ');
            const taskTitle = isVIPTask ? trimmedTitle.substring(4).trim() : trimmedTitle;

            if (isVIPTask) {
                await this.handleVIPTask(taskTitle);
                this.newTodoTitle = '';
                this.checkEmpty = false;
                this.delayTime = '0';
            } else {
                this.newTodoTitle = '';
                this.checkEmpty = false;
                this.delayTime = '0';
                this.handleRegularTask(taskTitle);
            }
        },

        async handleVIPTask(title) {
            this.isProcessingLongTask = true;
            this.longTaskMessage = 'Breaking down your task into manageable steps...';

            try {
                const response = await ApiService.createLongTask(title);
                const decomposedTasks = response.data || response.tasks || [];

                decomposedTasks.forEach(taskData => {
                    const newTodo = {
                        id: taskData.task_id,
                        title: taskData.title,
                        slot: taskData.slot,
                        completed: taskData.finished || false,
                        removed: false,
                    };
                    this.todos.push(newTodo);
                });

                this.celebrateCompletion();
                await DialogUtils.alert(
                    `Successfully created ${decomposedTasks.length} subtasks from your VIP task!`,
                    'Task Decomposition Complete'
                );
            } catch (error) {
                console.error('VIP task creation failed:', error);

                if (error.isTimeout) {
                    const fallback = await DialogUtils.confirm(
                        'Task decomposition timed out. Create as regular task instead?',
                        'Timeout - Fallback Option'
                    );
                    if (fallback) {
                        await this.handleRegularTask(title);
                    }
                } else {
                    await DialogUtils.alert(
                        `VIP task creation failed: ${error.message}. Creating as regular task.`,
                        'Fallback to Regular Task'
                    );
                    await this.handleRegularTask(title);
                }
            } finally {
                this.isProcessingLongTask = false;
                this.longTaskMessage = '';
            }
        },

        async handleRegularTask(title) {
            const optimisticTodo = TodoStorage.createOptimisticTodo(title);
            optimisticTodo.saving = true;
            optimisticTodo.saveError = false;
            optimisticTodo.saveErrorMsg = '';
            this.todos.push(optimisticTodo);

            const operationId = `add_${optimisticTodo.id}`;
            this.pendingOperations.add(operationId);

            try {
                const response = await ApiService.createTask(optimisticTodo.title);
                const serverTodo = response.data || response;

                const optimisticIndex = this.todos.findIndex(t => t.id === optimisticTodo.id);
                if (optimisticIndex !== -1) {
                    this.todos.splice(optimisticIndex, 1, {
                        id: serverTodo.task_id,
                        title: serverTodo.title,
                        slot: serverTodo.slot,
                        completed: serverTodo.finished || false,
                        removed: false,
                    });
                }
            } catch (error) {
                const idx = this.todos.findIndex(t => t.id === optimisticTodo.id);
                if (idx !== -1) {
                    this.todos[idx].saving = false;
                    this.todos[idx].saveError = true;
                    this.todos[idx].saveErrorMsg = error.message || 'Failed to save';
                }
                console.error('Failed to add todo:', error);
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        async retryAddTodo(todo) {
            todo.saveError = false;
            todo.saveErrorMsg = '';
            todo.saving = true;

            const operationId = `add_retry_${todo.id}`;
            this.pendingOperations.add(operationId);

            try {
                const response = await ApiService.createTask(todo.title);
                const serverTodo = response.data || response;

                const idx = this.todos.findIndex(t => t.id === todo.id);
                if (idx !== -1) {
                    this.todos.splice(idx, 1, {
                        id: serverTodo.task_id,
                        title: serverTodo.title,
                        slot: serverTodo.slot,
                        completed: serverTodo.finished || false,
                        removed: false,
                    });
                }
            } catch (error) {
                const idx = this.todos.findIndex(t => t.id === todo.id);
                if (idx !== -1) {
                    this.todos[idx].saving = false;
                    this.todos[idx].saveError = true;
                    this.todos[idx].saveErrorMsg = error.message || 'Failed to save';
                }
                console.error('Retry failed:', error);
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        async markAsCompleted(todo) {
            const originalCompleted = todo.completed;
            todo.completed = true;
            this.celebrateCompletion();

            const operationId = `complete_${todo.id}`;
            this.pendingOperations.add(operationId);

            try {
                await ApiService.finishTask(todo.id);
            } catch (error) {
                todo.completed = originalCompleted;
                this.handleOptimisticError(error, 'Failed to mark as completed');
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        async markAsUncompleted(todo) {
            const originalCompleted = todo.completed;
            todo.completed = false;

            const operationId = `uncomplete_${todo.id}`;
            this.pendingOperations.add(operationId);

            try {
                await ApiService.finishTask(todo.id);
            } catch (error) {
                todo.completed = originalCompleted;
                this.handleOptimisticError(error, 'Failed to mark as uncompleted');
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        celebrateCompletion() {
            this.sound.cloneNode(true).play();
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

            const incompleteTodos = this.todos.filter(todo => !todo.completed && !todo.removed);
            if (incompleteTodos.length === 0) {
                await DialogUtils.alert('No incomplete tasks to mark as completed.', 'Info');
                return;
            }

            const originalStates = incompleteTodos.map(todo => ({
                todo,
                originalCompleted: todo.completed
            }));

            incompleteTodos.forEach(todo => { todo.completed = true; });
            this.celebrateCompletion();

            const operationId = `markAll_${Date.now()}`;
            this.pendingOperations.add(operationId);

            try {
                await Promise.all(
                    incompleteTodos
                        .filter(todo => !todo.isOptimistic)
                        .map(todo => ApiService.finishTask(todo.id))
                );
            } catch (error) {
                originalStates.forEach(({ todo, originalCompleted }) => {
                    todo.completed = originalCompleted;
                });
                this.handleOptimisticError(error, 'Some items failed to update');
            } finally {
                this.pendingOperations.delete(operationId);
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

            const originalTitle = this.editedTodo ? this.editedTodo.originalTitle : todo.title;
            this.editedTodo = null;

            const operationId = `edit_${todo.id}`;
            this.pendingOperations.add(operationId);

            try {
                if (!todo.isOptimistic) {
                    await ApiService.updateTask(todo.id, todo.title);
                }
            } catch (error) {
                todo.title = originalTitle;
                this.handleOptimisticError(error, 'Failed to update todo');
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        cancelEdit(todo) {
            if (this.editedTodo && this.editedTodo.id === todo.id) {
                todo.title = this.editedTodo.originalTitle;
            }
            this.editedTodo = null;
        },

        async removeTodo(todo) {
            const todoIndex = this.todos.indexOf(todo);
            if (todoIndex === -1) return;

            const removedTodo = this.todos.splice(todoIndex, 1)[0];
            removedTodo.removed = true;
            this.recycleBin.unshift(removedTodo);

            if (!todo.isOptimistic) {
                const operationId = `remove_${todo.id}`;
                this.pendingOperations.add(operationId);

                try {
                    await ApiService.deleteTask(todo.id);
                } catch (error) {
                    const recycleIndex = this.recycleBin.indexOf(removedTodo);
                    if (recycleIndex !== -1) {
                        this.recycleBin.splice(recycleIndex, 1);
                        removedTodo.removed = false;
                        this.todos.splice(todoIndex, 0, removedTodo);
                    }
                    this.handleOptimisticError(error, 'Failed to delete todo');
                } finally {
                    this.pendingOperations.delete(operationId);
                }
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
                console.error('Failed to restore todo:', error);
                this.silentRefresh();
            }
        },

        async clearCompleted() {
            const confirmed = await DialogUtils.confirm('Confirm to clear all completed items?');
            if (!confirmed) return;

            const completedTodos = this.todos.filter(todo => todo.completed && !todo.removed);
            if (completedTodos.length === 0) {
                await DialogUtils.alert('No completed tasks to clear.', 'Info');
                return;
            }

            const movedTodos = [];
            completedTodos.forEach(todo => {
                const index = this.todos.indexOf(todo);
                if (index !== -1) {
                    const removedTodo = this.todos.splice(index, 1)[0];
                    removedTodo.removed = true;
                    this.recycleBin.unshift(removedTodo);
                    movedTodos.push({ todo: removedTodo, originalIndex: index });
                }
            });

            const operationId = `clearCompleted_${Date.now()}`;
            this.pendingOperations.add(operationId);

            try {
                await Promise.all(
                    completedTodos
                        .filter(todo => !todo.isOptimistic)
                        .map(todo => ApiService.deleteTask(todo.id))
                );
            } catch (error) {
                movedTodos.reverse().forEach(({ todo, originalIndex }) => {
                    const recycleIndex = this.recycleBin.indexOf(todo);
                    if (recycleIndex !== -1) {
                        this.recycleBin.splice(recycleIndex, 1);
                        todo.removed = false;
                        this.todos.splice(originalIndex, 0, todo);
                    }
                });
                this.handleOptimisticError(error, 'Failed to clear completed items');
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        async clearAll() {
            const confirmed = await DialogUtils.confirm('Confirm to clear all todo items?');
            if (!confirmed) return;

            if (this.todos.length === 0 && this.recycleBin.length === 0) {
                await DialogUtils.alert('No tasks to clear.', 'Info');
                return;
            }

            const allTodos = [...this.todos];
            const allRecycleBin = [...this.recycleBin];

            this.recycleBin = this.recycleBin.concat(
                this.todos.map(todo => ({ ...todo, removed: true }))
            );
            this.todos = [];

            const operationId = `clearAll_${Date.now()}`;
            this.pendingOperations.add(operationId);

            try {
                const allTaskIds = [
                    ...allTodos.filter(t => !t.isOptimistic).map(t => t.id),
                    ...allRecycleBin.filter(t => !t.isOptimistic).map(t => t.id),
                ];

                await Promise.all(allTaskIds.map(id => ApiService.deleteTask(id)));
            } catch (error) {
                this.todos = allTodos;
                this.recycleBin = allRecycleBin;
                this.handleOptimisticError(error, 'Failed to clear all items');
            } finally {
                this.pendingOperations.delete(operationId);
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
                const savedDraggedItem = this.draggedItem;
                const savedOriginalIndex = this.originalIndex;
                const savedDragIndex = this.dragIndex;

                const operationId = `move_${savedDraggedItem.id}`;
                this.pendingOperations.add(operationId);

                this.draggedItem = null;
                this.originalIndex = null;
                this.dragIndex = null;

                try {
                    if (!savedDraggedItem.isOptimistic) {
                        await ApiService.moveTask(savedDraggedItem.id, targetSlot);
                    }
                } catch (error) {
                    const movedItem = this.filteredTodos.splice(savedDragIndex, 1)[0];
                    this.filteredTodos.splice(savedOriginalIndex, 0, movedItem);
                    this.handleOptimisticError(error, 'Failed to move task');
                } finally {
                    this.pendingOperations.delete(operationId);
                }
            } else {
                this.draggedItem = null;
                this.originalIndex = null;
                this.dragIndex = null;
            }
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

        async openSpaceDialog() {
            this.showSpaceDialog = true;
            this.selectedSpaceKey = this.currentKey;
            this.spaceList = [];
            try {
                const res = await ApiService.getSets();
                this.spaceList = res.data || [];
            } catch (e) {
                console.error('Failed to load sets:', e);
            }
        },

        async confirmChangeSpace() {
            const key = this.selectedSpaceKey === '__new__'
                ? this.newSpaceName.trim()
                : this.selectedSpaceKey;
            if (!key) return;
            this.isChangingSpace = true;
            try {
                await ApiService.switchSet(key);
            } catch (e) {
                console.error('Switch set error (reloading anyway):', e);
            } finally {
                this.currentKey = key;
                localStorage.setItem('current_set_key', this.currentKey);
                this.showSpaceDialog = false;
                this.isChangingSpace = false;
                this.newSpaceName = '';
                await this.loadTodos();
            }
        },

        async deleteSetKey(key) {
            if (!key || this.deletingSpaceKey) return;

            if (this.spaceList.length <= 1) {
                await DialogUtils.alert('Cannot delete the last set key.', 'Info');
                return;
            }

            const confirmed = await DialogUtils.confirm(
                `Delete set "${key}" and all tasks in it?`,
                'Confirm Set Deletion'
            );
            if (!confirmed) return;

            this.deletingSpaceKey = key;
            try {
                const response = await ApiService.deleteSet(key);
                const newCurrentKey = response?.data?.currentKey || this.currentKey;
                const isCurrentDeleted = key === this.currentKey;

                this.currentKey = newCurrentKey;
                localStorage.setItem('current_set_key', this.currentKey);

                const setsRes = await ApiService.getSets();
                this.spaceList = setsRes.data || [];

                if (this.selectedSpaceKey === key) {
                    this.selectedSpaceKey = this.currentKey;
                }

                if (isCurrentDeleted) {
                    await this.loadTodos();
                }
            } catch (e) {
                console.error('Failed to delete set:', e);
                await DialogUtils.alert(`Failed to delete set: ${e.message || 'Unknown error'}`, 'Error');
            } finally {
                this.deletingSpaceKey = '';
            }
        },

        async handleSequenceCreate(tasks) {
            const optimisticTasks = tasks.map(task =>
                TodoStorage.createOptimisticTodo(task.title)
            );

            optimisticTasks.forEach(task => {
                this.todos.push(task);
            });

            this.closeSequenceDialog();

            const operationId = `sequence_${Date.now()}`;
            this.pendingOperations.add(operationId);

            try {
                for (let i = 0; i < tasks.length; i++) {
                    const response = await ApiService.createTask(tasks[i].title);
                    const serverTask = response.data || response;

                    const optimisticIndex = this.todos.findIndex(t => t.id === optimisticTasks[i].id);
                    if (optimisticIndex !== -1) {
                        this.todos.splice(optimisticIndex, 1, {
                            id: serverTask.task_id,
                            title: serverTask.title,
                            slot: serverTask.slot,
                            completed: serverTask.finished || false,
                            removed: false,
                        });
                    }
                }
            } catch (error) {
                optimisticTasks.forEach(optimisticTask => {
                    const index = this.todos.findIndex(t => t.id === optimisticTask.id);
                    if (index !== -1) {
                        this.todos.splice(index, 1);
                    }
                });
                this.handleOptimisticError(error, 'Failed to create sequence tasks');
            } finally {
                this.pendingOperations.delete(operationId);
            }
        },

        async convertToRush() {
            const activeTodos = this.todos.filter(todo => !todo.removed && !todo.completed);

            if (activeTodos.length === 0) {
                await DialogUtils.alert('No tasks available to convert to RUSH mode.', 'Info');
                return;
            }

            const confirmed = await DialogUtils.confirm(
                `Convert ${activeTodos.length} task(s) to RUSH mode?\n\nThis will redirect you to RUSH mode with your current tasks.`,
                'Convert to RUSH Mode'
            );

            if (!confirmed) return;

            try {
                const rushTasks = activeTodos.map(todo => {
                    const hl = 1;

                    return {
                        id: Date.now() + Math.random(),
                        title: todo.title,
                        hl: hl,
                        completed: false,
                        allocatedTime: 0,
                        actualTime: 0,
                        startTime: null,
                        deadline: 0,
                        removed: false
                    };
                });

                localStorage.setItem('rush-imported-tasks', JSON.stringify(rushTasks));
                window.location.href = 'rush.html';
            } catch (error) {
                console.error('Failed to convert to RUSH:', error);
                await DialogUtils.alert('Failed to convert tasks to RUSH mode. Please try again.', 'Error');
            }
        },

        handleOptimisticError(error, context) {
            console.error(`${context}:`, error);

            this.syncErrors.push({
                error,
                context,
                timestamp: Date.now()
            });

            if (error.isNetworkError) {
                console.warn(`${context} - Network error, refreshing from server`);
            }

            this.silentRefresh();
        },

        async syncWithServer() {
            if (this.pendingOperations.size > 0) {
                console.log('Sync skipped: operations pending');
                return;
            }

            try {
                await this.loadTodos();
                this.syncErrors = [];
            } catch (error) {
                console.error('Sync failed:', error);
            }
        },

        silentRefresh() {
            const now = Date.now();
            if (now - this._lastRefreshAt < 2000) {
                console.log('Silent refresh throttled (< 2s since last)');
                return;
            }

            this._lastRefreshAt = now;

            ApiService.getTasks()
                .then(response => {
                    const fetchedTodos = response.data || response;
                    this.todos = fetchedTodos.map(todo => ({
                        id: todo.task_id,
                        title: todo.title,
                        slot: todo.slot,
                        completed: todo.finished || false,
                        removed: false,
                    }));
                    console.log('Silent refresh succeeded, todos updated from server');
                })
                .catch(err => {
                    console.warn('Silent refresh failed:', err);
                });
        },

        navigateToRush() {
            window.location.href = 'rush.html';
        },

        logout
    },

    mounted() {
        this.syncInterval = setInterval(() => {
            if (this.pendingOperations.size === 0 && this.syncErrors.length > 0) {
                this.syncWithServer();
            }
        }, 30000);
    },

    beforeDestroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
};