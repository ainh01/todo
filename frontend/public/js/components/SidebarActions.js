export default {
    name: 'SidebarActions',
    props: {
        todos: Array,
        recycleBin: Array,
        intention: String,
        leftTodosCount: Number,
        completedTodosCount: Number,
        isShow: Boolean,
        shortCut: String,
        currentKey: String
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
          <span class="shortcut-name">{{ $t('quicks') }}</span>
        </div>
        <div v-if="currentKey" style="font-size:11px; opacity:.65; padding:2px 6px; text-align:center;">
          {{ currentKey }}
        </div>
      </div>

      <div class="todo-footer-box">
        <ul class="todo-func-list filter">
          <li>
            <input
              class="btn-small action-showAll"
              type="button"
              :value="$t('filterAll')"
              :class="{selected: intention === 'all'}"
              @click="$emit('update:intention', 'all')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              class="btn-small action-progress"
              type="button"
              :value="$t('filterInProgress')"
              v-if="leftTodosCount"
              :class="{selected: intention === 'ongoing'}"
              @click="$emit('update:intention', 'ongoing')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              class="btn-small action-completed"
              type="button"
              :value="$t('filterCompleted')"
              :class="{selected: intention === 'completed'}"
              @click="$emit('update:intention', 'completed')"
            />
          </li>
          <li v-if="recycleBin.length">
            <input
              class="btn-small action-deleted"
              type="button"
              :class="{selected: intention === 'removed'}"
              :value="$t('filterTrash')"
              @click="$emit('update:intention', 'removed')"
            />
          </li>
        </ul>

        <ul class="todo-func-list batch">
          <li v-if="leftTodosCount">
            <input
              type="button"
              class="btn-small completed-all"
              :value="$t('finishAll')"
              @click="$emit('mark-all-completed')"
            />
          </li>
          <li v-if="completedTodosCount">
            <input
              type="button"
              :value="$t('clearCompleted')"
              class="btn-small completed-clear"
              @click="$emit('clear-completed')"
            />
          </li>
          <li v-if="todos.length">
            <input
              type="button"
              class="btn-small clear-all"
              :value="$t('clearAll')"
              @click="$emit('clear-all')"
            />
          </li>
        </ul>

        <ul class="todo-func-list batch">
          <li>
            <input
              type="button"
              :value="$t('sequenceTask')"
              class="btn-small action-import"
              @click="$emit('open-sequence-dialog')"
            />
          </li>
          <li>
            <input
              type="button"
              :value="$t('importVTask')"
              class="btn-small action-import"
              @click="$emit('open-import-vtask-dialog')"
            />
          </li>
          <li v-if="leftTodosCount">
            <input
              type="button"
              :value="$t('convertRush')"
              class="btn-small action-import"
              @click="$emit('convert-rush')"
            />
          </li>
          <li>
            <input
              type="button"
              :value="$t('changeSpace')"
              class="btn-small action-import"
              @click="$emit('open-space-dialog')"
            />
          </li>
        </ul>
      </div>
    </div>
  `
};
