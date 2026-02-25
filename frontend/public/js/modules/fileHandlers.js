import { ApiService } from './apiService.js';
import { DialogUtils } from './dialogUtils.js';

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
            await DialogUtils.alert('Export failed: ' + error.message, 'Error');
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
                await DialogUtils.alert('No file selected!', 'Error');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                try {
                    const importedData = JSON.parse(content.trim());

                    if (!Array.isArray(importedData)) {
                        throw new Error('Invalid format: expected array of todos');
                    }

                    let successCount = 0;
                    let failureCount = 0;

                    for (let item of importedData) {
                        try {
                            const titleToImport = item.title ? String(item.title) : 'Imported Task';
                            await ApiService.createTask(titleToImport);
                            successCount++;
                        } catch (err) {
                            console.error('Failed to import item:', item, err);
                            failureCount++;
                        }
                    }

                    if (onSuccess) await onSuccess();

                    const message = failureCount === 0
                        ? `Successfully imported ${successCount} of ${importedData.length} items!`
                        : `Import completed with ${successCount} successes and ${failureCount} failures. See console for details.`;

                    await DialogUtils.alert(message, failureCount === 0 ? 'Import Success' : 'Import Partial Success');
                } catch (error) {
                    await DialogUtils.alert(
                        'File parsing error: ' + error.message + '. Please ensure the file is a valid JSON array of todo objects.',
                        'Error'
                    );
                }
            };

            reader.onerror = async (e) => {
                await DialogUtils.alert('Error reading file: ' + e.target.error.name, 'Error');
            };

            reader.readAsText(file);
            document.body.removeChild(fileInput);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }
}
