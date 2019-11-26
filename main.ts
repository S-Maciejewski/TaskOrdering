import * as fs from 'fs';
import * as glob from 'glob';
import { validateInstances } from './validator';

export class Task {
    public id: number; // Just for ease of handling tasks
    public p: number;  // Time to complete
    public r: number;  // Ready
    public d: number;  // Deadline

    constructor(...args: number[]) {
        this.p = args[0];
        this.r = args[1];
        this.d = args[2];
    }
}

export function loadInstance(fileName: string) {
    let data = fs.readFileSync(fileName, 'utf-8');
    if (data[data.length -1] !== '\n') {
        data += '\n';
    }
    let taskID = 1;
    let tasks: Task[] = [];
    tasks = data.split('\n').slice(1, data.split('\n').length - 1)
        .map(row => new Task(...row.split(' ')
            .map(val => val as unknown as number * 1)))
        .map(task => ({ ...task, id: taskID++ }));
    return tasks;
}

// TODO: Sortowanie indeksów wg. klucza z excela
glob('./Instancje/*', {}, (er, files) => {
    files = files.sort((x, y) => {
        const xIndex = + x.substring(x.indexOf('in') + 2, x.indexOf('_'));
        const yIndex = + y.substring(y.indexOf('in') + 2, y.indexOf('_'));
        const xSize = + x.substring(x.indexOf('_') + 1, x.indexOf('.txt'));
        const ySize = + y.substring(y.indexOf('_') + 1, y.indexOf('.txt'));
        if (xIndex === yIndex) {
            return xSize > ySize ? 1 : -1;
        } else {
            return xIndex > yIndex ? 1 : -1;
        }
    });

    validateInstances(files);
});
