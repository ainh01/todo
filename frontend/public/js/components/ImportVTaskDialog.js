export default {
  name: 'ImportVTaskDialog',

  template: `
    <div class="custom-alert-overlay" @keydown.esc="$emit('close')">
      <div class="custom-alert" style="max-width:560px; width:95%;">

        <div class="custom-alert-title">{{ $t('importVTask') }}</div>

        <div class="custom-alert-content" style="display:flex; flex-direction:column; gap:10px;">

          <!-- Textarea for raw string input -->
          <textarea
            v-model="rawInput"
            :placeholder="$t('importVTaskPlaceholder')"
            style="
              width:100%;
              min-height:260px;
              resize:vertical;
              box-sizing:border-box;
              padding:10px;
              font-size:13px;
              font-family:monospace;
              border:1px solid #d1d5db;
              border-radius:6px;
              line-height:1.5;
            "
          ></textarea>

          <!-- Paste button and Force Quiz checkbox -->
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <button
              type="button"
              class="btn-small action-import"
              @click="pasteFromClipboard"
              style="padding:5px 12px;"
            >
              {{ $t('pasteBtn') }}
            </button>

            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:14px; user-select:none;">
              <input
                type="checkbox"
                v-model="forceQuiz"
                style="width:15px; height:15px; cursor:pointer;"
              />
              {{ $t('forceQuiz') }}
            </label>
          </div>

          <!-- Live parse preview of detected tasks -->
          <div v-if="previewCount !== null" style="font-size:13px; opacity:.7;">
            {{ $t('importVTaskPreview', previewCount) }}
          </div>

          <!-- Error message display -->
          <div v-if="errorMsg" style="color:#dc2626; font-size:13px;">
            {{ errorMsg }}
          </div>

        </div>

        <!-- Footer buttons -->
        <div class="custom-alert-buttons">
          <button class="custom-alert-btn cancel" @click="$emit('close')" :disabled="isImporting">
            {{ $t('seqCancel') }}
          </button>
          <button
            class="custom-alert-btn confirm"
            @click="handleImport"
            :disabled="isImporting || !rawInput.trim()"
          >
            {{ isImporting ? $t('importVTaskImporting') : $t('importVTaskBtn') }}
          </button>
        </div>

      </div>
    </div>
  `,

  data() {
    return {
      rawInput: '',
      forceQuiz: false,
      isImporting: false,
      errorMsg: '',
    };
  },

  computed: {
    previewCount() {
      if (!this.rawInput.trim()) return null;
      return this.parseVTasks(this.rawInput).length;
    }
  },

  methods: {
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        this.rawInput = text;
        this.errorMsg = '';
      } catch (err) {
        this.errorMsg = this.$t('pasteFailed');
        console.warn('Clipboard paste failed:', err);
      }
    },
    parseVTasks(raw) {
      const EX_MARKER = '<!Ex>';
      const EX_REPLACEMENT = '\n\n\n\n\n\n\n\n';
      const QUIZ_SUFFIX = ' The quiz must use tools to create.';

      const tasks = [];
      const blockRegex = /fTask:([\s\S]*?)fPrompt\[([\s\S]*?)fPromptEnd\][\s\S]*?fEnd/g;

      let match;
      while ((match = blockRegex.exec(raw)) !== null) {
        let title = match[1].trim();
        let innerContent = match[2].trim();

        innerContent = innerContent.split(EX_MARKER).join(EX_REPLACEMENT);
        if (this.forceQuiz) {
          innerContent = innerContent + QUIZ_SUFFIX;
        }
        const content = 'fPrompt[' + innerContent + 'fPromptEnd]';

        if (title) {
          title = title + content;
          tasks[tasks.length] = { title };
        }
      }

      return tasks;
    },
    handleImport() {
      this.errorMsg = '';

      const tasks = this.parseVTasks(this.rawInput);

      if (tasks.length === 0) {
        this.errorMsg = this.$t('importVTaskNoTasks');
        return;
      }

      this.isImporting = true;
      this.$emit('import', tasks);
    }
  }
};
