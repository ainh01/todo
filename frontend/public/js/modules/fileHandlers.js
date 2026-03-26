import { ApiService } from './apiService.js';
import { DialogUtils } from './dialogUtils.js';

const t = (key, ...args) => {
    if (typeof window._t === 'function') {
        return window._t(key, ...args);
    }

    const fallbackMap = {
        exportFail: (message) => `Export failed: ${message}`,
        noFileSelected: 'No file selected!',
        invalidFormat: 'Invalid format: expected array of todos',
        importSuccess: (ok, total) => `Successfully imported ${ok} of ${total} items!`,
        importPartial: (ok, fail) => `Import completed with ${ok} successes and ${fail} failures. See console for details.`,
        importSuccessTitle: 'Import Success',
        importPartialTitle: 'Import Partial Success',
        importParseError: (message) => `File parsing error: ${message}. Please ensure the file is a valid JSON array of todo objects.`,
        importReadError: (name) => `Error reading file: ${name}`,
        importedTask: 'Imported Task',
        errorTitle: 'Error'
    };

    const value = fallbackMap[key] ?? key;
    return typeof value === 'function' ? value(...args) : value;
};

export class FileHandlers {

    static async exportTodos(todos) {
        try {
            const todosData = todos
                .filter(todo => !todo.removed)
                .map(todo => ({
                    title: todo.title,
                    completed: todo.completed,
                }));

            const todosText = JSON.stringify(todosData, null, 2);
            const date = new Date().toISOString().replace(/-|:|\.\d+/g, '');
            const fileName = `todos-${date.slice(0, 8)}-${date.slice(9, 15)}.json`;

            const element = document.createElement('a');
            element.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(todosText);
            element.download = fileName;

            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (error) {
            await DialogUtils.alert(t('exportFail', error.message), t('errorTitle'));
        }
    }

    static importTodos(onSuccess) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.json';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                await DialogUtils.alert(t('noFileSelected'), t('errorTitle'));
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                try {
                    const importedData = JSON.parse(content.trim());

                    if (!Array.isArray(importedData)) {
                        throw new Error(t('invalidFormat'));
                    }

                    let successCount = 0;
                    let failureCount = 0;

                    for (let item of importedData) {
                        try {
                            const titleToImport = item.title ? String(item.title) : t('importedTask');
                            await ApiService.createTask(titleToImport);
                            successCount++;
                        } catch (err) {
                            console.error('Failed to import item:', item, err);
                            failureCount++;
                        }
                    }

                    if (onSuccess) await onSuccess();

                    const message = failureCount === 0
                        ? t('importSuccess', successCount, importedData.length)
                        : t('importPartial', successCount, failureCount);

                    await DialogUtils.alert(message, failureCount === 0 ? t('importSuccessTitle') : t('importPartialTitle'));
                } catch (error) {
                    await DialogUtils.alert(
                        t('importParseError', error.message),
                        t('errorTitle')
                    );
                }
            };

            reader.onerror = async (e) => {
                await DialogUtils.alert(t('importReadError', e.target.error.name), t('errorTitle'));
            };

            reader.readAsText(file);
            document.body.removeChild(fileInput);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }
}
