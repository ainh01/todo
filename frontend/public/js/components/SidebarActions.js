export default {
    name: 'SidebarActions',
    props: {
        todos: Array,
        recycleBin: Array,
        intention: String,
        leftTodosCount: Number,
        completedTodosCount: Number,
        isShow: Boolean,
        shortCut: String
    },

    template: `
    <div class="footer side-bar">
      <div
        class="side-shortcut"
        @click="$emit('toggle-sidebar')"
        :class="{fold: isShow}"
      >
        <div class="shortcut-switch">
          <span class="shortcut-title">{{ shortCut }}</span>
          <span class="shortcut-name">Quicks</span>
        </div>
      </div>

      <div class="todo-footer-box">
        <ul class="todo-func-list filter">
          <li>
            <input
              class="btn-small action-showAll"
              type="button"
              value="All"
              :class="{selected: intention === 'all'}"
              @click="$emit('update:intention', 'all')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              class="btn-small action-progress"
              type="button"
              value="In Progress"
              v-if="leftTodosCount"
              :class="{selected: intention === 'ongoing'}"
              @click="$emit('update:intention', 'ongoing')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              class="btn-small action-completed"
              type="button"
              value="Completed"
              :class="{selected: intention === 'completed'}"
              @click="$emit('update:intention', 'completed')"
            />
          </li>
          <li v-if="recycleBin.length">
            <input
              class="btn-small action-deleted"
              type="button"
              :class="{selected: intention === 'removed'}"
              value="Trash"
              @click="$emit('update:intention', 'removed')"
            />
          </li>
        </ul>

        <ul class="todo-func-list batch">
          <li v-if="leftTodosCount">
            <input
              type="button"
              class="btn-small completed-all"
              value="Finish all"
              @click="$emit('mark-all-completed')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              type="button"
              value="Clear Completed"
              class="btn-small completed-clear"
              @click="$emit('clear-completed')"
            />
          </li>
          <li v-if="todos.length">
            <input
              type="button"
              class="btn-small clear-all"
              value="Clear All"
              @click="$emit('clear-all')"
            />
          </li>
        </ul>

        <ul class="todo-func-list datasave">
          <li v-if="leftTodosCount">
            <input
              type="button"
              value="Export data"
              class="btn-small action-download"
              @click="$emit('export-data')"
            />
          </li>
          <li>
            <input
              value="Import(txt/json)"
              type="button"
              class="btn-small action-import"
              @click="$emit('import-data')"
            />
          </li>
        </ul>

        <ul class="todo-func-list batch">
          <li>
            <input
              type="button"
              value="Sequence Task"
              class="btn-small action-import"
              @click="$emit('open-sequence-dialog')"
            />
          </li>
        </ul>
      </div>
    </div>
  `
};
