import * as fs from 'fs';
// var glob = require("glob");
import * as glob from 'glob';

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
// Penalty from solution file
let totalPenalty: number;

function getInstanceSize(fileName: string) {
    const data = fs.readFileSync(fileName, 'utf-8');
    return data.split('\n')[0] as unknown as number;
}

export function loadInstance(fileName: string) {
    const data = fs.readFileSync(fileName, 'utf-8');
    let taskID = 1;
    let tasks: Task[] = [];
    tasks = data.split('\n').slice(1, data.split('\n').length - 1)
        .map(row => new Task(...row.split(' ')
            .map(val => val as unknown as number * 1)))
        .map(task => ({ ...task, id: taskID++ }));
    return tasks;
}

function loadSolution(fileName: string, solutionString = '') {
    let data = '';
    if (solutionString !== '') {
        data = solutionString;
    } else {
        data = fs.readFileSync(fileName, 'utf-8');
    }

    totalPenalty = data.split('\n')[0] as unknown as number;

    return data.split('\n').slice(1).map(obj => obj.split(' '))
        .map(coreTasks => coreTasks.filter(val => val !== '')
            .map(val => val as unknown as number * 1));
}

function getCorePenalty(coreTasks: Task[]) {
    let time = 0;
    let penalty = 0;

    coreTasks.map(task => {
        if (task.r > time) {
            time = task.r + task.p;
        } else {
            time += task.p;
        }

        if (time > task.d) {
            penalty += time - task.d;
        }
    });
    return penalty;
}

function calculatePenalty(tasks: Task[], solution: any) {
    return solution
        .map(core =>
            getCorePenalty(tasks.filter(task => core.includes(task.id))))
        .reduce((a, b) => a + b, 0);
}

function generateDummySolution(tasks: Task[], cores: number,
    fileName = 'dummySolution.txt', returnString = false) {
    let dummySolution = '0\n';  // Total penalty 0
    const maxTasks = Math.ceil(tasks.length / cores);

    for (let i = 0, j = tasks.length; i < j; i += maxTasks) {
        tasks.slice(i, i + maxTasks)
            .map(obj => dummySolution += `${obj.id} `);
        dummySolution += '\n';
    }

    if (returnString) {
        return dummySolution;
    } else {
        fs.writeFileSync(fileName, dummySolution);
    }
}

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

    let result = 'index,size,penalty\n';
    files.forEach(file => {
        const tasks = loadInstance(file);
        const solution = loadSolution('solution.txt', generateDummySolution(tasks, 4, 'solution.txt', true));
        result += file.substring(file.indexOf('in') + 2, file.indexOf('_'))
            + ',' + tasks.length + ',' + calculatePenalty(tasks, solution) + '\n';
    });
    fs.writeFileSync('penalties.csv', result);
});
