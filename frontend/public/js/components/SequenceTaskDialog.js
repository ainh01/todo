export default {
    name: 'SequenceTaskDialog',

    template: `
    <div class="custom-alert-overlay" @keydown="handleKeydown">
      <div class="custom-alert">
        <div class="custom-alert-title" style="text-align:center">Sequence Task</div>
        <div class="custom-alert-content" style="text-align:left">
          <div style="margin-bottom:10px">
            <label style="margin-right:16px; cursor:pointer">
              <input type="radio" v-model="position" value="prefix" />
              Prefix &nbsp;<span style="opacity:.6;font-size:.85em">(x+Task)</span>
            </label>
            <label style="cursor:pointer">
              <input type="radio" v-model="position" value="suffix" />
              Suffix &nbsp;<span style="opacity:.6;font-size:.85em">(Task+x)</span>
            </label>
          </div>

          <div style="margin-bottom:8px">
            <label style="display:block;margin-bottom:4px;font-weight:600">Task Name</label>
            <input
              ref="taskNameInput"
              v-model="taskName"
              type="text"
              placeholder="e.g. Finish part 3."
              style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px"
              @input="updatePreview"
            />
          </div>

          <div style="display:flex;gap:12px;margin-bottom:8px">
            <div style="flex:1">
              <label style="display:block;margin-bottom:4px;font-weight:600">From</label>
              <input
                v-model.number="fromNum"
                type="number"
                style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px"
                @input="updatePreview"
              />
            </div>
            <div style="flex:1">
              <label style="display:block;margin-bottom:4px;font-weight:600">To</label>
              <input
                v-model.number="toNum"
                type="number"
                style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px"
                @input="updatePreview"
              />
            </div>
          </div>

          <div style="margin-bottom:8px">
            <label style="display:block;margin-bottom:4px;font-weight:600">Preview</label>
            <input
              v-model="previewStart"
              type="text"
              disabled
              style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:14px;background:#f3f3f3;color:#888;cursor:not-allowed"
            />
            <label style="display:block;margin-bottom:4px;font-weight:600">To</label>
            <input
              v-model="previewEnd"
              type="text"
              disabled
              style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:14px;background:#f3f3f3;color:#888;cursor:not-allowed"
            />
          </div>

          <div
            style="color:#e53935;font-size:.85em;min-height:18px;margin-top:2px"
            :style="{ color: isCreating ? '#1976d2' : '#e53935' }"
          >
            {{ errorMessage }}
          </div>
        </div>

        <div class="custom-alert-buttons">
          <button 
            class="custom-alert-btn cancel" 
            @click="handleCancel"
            :disabled="isCreating"
          >
            Cancel
          </button>
          <button 
            class="custom-alert-btn confirm" 
            @click="handleCreate"
            :disabled="isCreating"
          >
            {{ isCreating ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  `,

    data() {
        return {
            position: 'suffix',
            taskName: '',
            fromNum: 1,
            toNum: 5,
            previewStart: '',
            previewEnd: '',
            errorMessage: '',
            isCreating: false
        };
    },

    mounted() {
        this.updatePreview();
        this.$nextTick(() => {
            this.$refs.taskNameInput.focus();
        });
    },

    watch: {
        position() {
            this.updatePreview();
        }
    },

    methods: {
        updatePreview() {
            if (!this.taskName || isNaN(this.fromNum)) {
                this.previewStart = '';
                this.previewEnd = '';
                return;
            }

            this.previewStart = this.position === 'suffix'
                ? `${this.taskName}${this.fromNum}`
                : `${this.fromNum}${this.taskName}`;

            if (!isNaN(this.toNum)) {
                this.previewEnd = this.position === 'suffix'
                    ? `${this.taskName}${this.toNum}`
                    : `${this.toNum}${this.taskName}`;
            } else {
                this.previewEnd = '';
            }
        },

        validate() {
            if (!this.taskName) {
                this.errorMessage = '⚠ Task Name must not be empty.';
                return false;
            }
            if (isNaN(this.fromNum) || isNaN(this.toNum)) {
                this.errorMessage = '⚠ From and To must be valid integers.';
                return false;
            }
            if (this.fromNum > this.toNum) {
                this.errorMessage = '⚠ From must be ≤ To.';
                return false;
            }
            this.errorMessage = '';
            return true;
        },

        async handleCreate() {
            if (!this.validate()) return;

            this.isCreating = true;
            this.errorMessage = `Creating ${this.toNum - this.fromNum + 1} task(s)…`;

            try {
                const tasks = [];
                for (let i = this.fromNum; i <= this.toNum; i++) {
                    const title = this.position === 'suffix'
                        ? `${this.taskName}${i}`
                        : `${i}${this.taskName}`;
                    tasks.push({ title });
                }

                this.$emit('create', tasks);
            } catch (error) {
                this.isCreating = false;
                this.errorMessage = '⚠ Error: ' + error.message;
            }
        },

        handleCancel() {
            this.$emit('close');
        },

        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.handleCancel();
            }
        }
    }
};
