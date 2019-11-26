import * as fs from 'fs';
import { Task, loadInstance } from './main';

// Solution penalty
let totalPenalty: number;

function loadSolution(fileName: string, solutionString = ''): number[][] {
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

function getCorePenalty(coreTasks: Task[]): number {
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

function calculatePenalty(tasks: Task[], solution: any): number {
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

// Validate instance using dummy solution
function validateInstance(file: string): string {
    const tasks = loadInstance(file);
    const solution = loadSolution('solution.txt', generateDummySolution(tasks, 4, 'solution.txt', true));
    return file.substring(file.indexOf('in') + 2, file.indexOf('_'))
        + ',' + tasks.length + ',' + calculatePenalty(tasks, solution) + '\n';
}


export function validateInstances(files: string[]): void {
    let result = 'index,size,penalty\n';
    files.forEach(file => {
        result += validateInstance(file);
    });
    console.log('Dummy solution penalties saved in penalties.csv');
    fs.writeFileSync('penalties.csv', result);
}
