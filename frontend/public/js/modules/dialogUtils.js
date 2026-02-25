
export class DialogUtils {
    static createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        return overlay;
    }

    static createAlertBox(title, message, buttons) {
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
      <div class="custom-alert-title">${title}</div>
      <div class="custom-alert-content">${message}</div>
      <div class="custom-alert-buttons">${buttons}</div>
    `;
        return alertBox;
    }

    static alert(message, title = 'Prompt') {
        return new Promise((resolve) => {
            const overlay = this.createOverlay();
            const alertBox = this.createAlertBox(title, message,
                '<button class="custom-alert-btn confirm">OK</button>'
            );

            overlay.appendChild(alertBox);
            document.body.appendChild(overlay);

            const confirmBtn = alertBox.querySelector('.confirm');
            const closeDialog = () => {
                alertBox.style.animation = 'popOut 0.3s forwards';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    resolve(true);
                }, 300);
            };

            confirmBtn.addEventListener('click', closeDialog);
            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeDialog();
            });
            confirmBtn.focus();
        });
    }

    static confirm(message, title = 'Please Confirm') {
        return new Promise((resolve) => {
            const overlay = this.createOverlay();
            const alertBox = this.createAlertBox(title, message,
                '<button class="custom-alert-btn cancel">Cancel</button><button class="custom-alert-btn confirm">OK</button>'
            );

            overlay.appendChild(alertBox);
            document.body.appendChild(overlay);

            const confirmBtn = alertBox.querySelector('.confirm');
            const cancelBtn = alertBox.querySelector('.cancel');

            const resolveDialog = (result) => {
                alertBox.style.animation = 'popOut 0.3s forwards';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    resolve(result);
                }, 300);
            };

            confirmBtn.addEventListener('click', () => resolveDialog(true));
            cancelBtn.addEventListener('click', () => resolveDialog(false));
            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') resolveDialog(false);
            });
            cancelBtn.focus();
        });
    }
}

window.alert = DialogUtils.alert.bind(DialogUtils);
window.confirm = DialogUtils.confirm.bind(DialogUtils);
