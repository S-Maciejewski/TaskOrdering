import * as fs from 'fs';
import { Task, loadInstance } from './main';

export function generateListSolution(tasks: Task[], cores: number, returnPenalty = false,
    returnTime = false, returnSolution = false) {
    let penalty = 0;
    let coreArray = [];
    for (let i = 0; i < cores; i++) {
        coreArray.push({ id: i, time: 0, tasks: [] });
    }

    const startTime = process.hrtime.bigint();
    const sortedTasks = tasks.sort((t1, t2) => {
        if (t1.d === t2.d) {
            return t1.p < t2.p ? 1 : -1;
        } else {
            return t1.d > t2.d ? 1 : -1;
        }
    });

    sortedTasks.forEach(task => {
        coreArray = coreArray.sort((c1, c2) => c1.time > c2.time ? 1 : -1);

        if (coreArray[0].time < task.r) {
            coreArray[0].time = task.r;
        }

        if (coreArray[0].time + task.p > task.d) {
            penalty += coreArray[0].time + task.p - task.d;
        }

        coreArray[0].time += task.p;
        coreArray[0].tasks.push(task);
    });

    if (returnPenalty) {
        return penalty;
    } else if (returnTime) {
        return (process.hrtime.bigint() - startTime) / BigInt(1000);
    } else if (returnSolution) {
        let solution = penalty + '\n';
        coreArray.forEach(core => {
            // Return as string, task ids separated with spaces
            solution += core.tasks.map(task => task.id).reduce((agg, taskID) => agg += ' ' + taskID) + '\n';
        });
        return solution;
    }
}

function getListPenalty(file: string): string {
    const tasks = loadInstance(file);
    return file.substring(file.indexOf('in') + 2, file.indexOf('_'))
        + ',' + tasks.length + ',' + generateListSolution(tasks, 4, true) + '\n';
}

function getListTime(file: string): string {
    const tasks = loadInstance(file);
    return file.substring(file.indexOf('in') + 2, file.indexOf('_'))
        + ',' + tasks.length + ',' + generateListSolution(tasks, 4, false, true) + '\n';
}

function getListSolution(file: string) {
    const tasks = loadInstance(file);
    return generateListSolution(tasks, 4, false, false, true);
}

export function calculateListPenalties(files: string[]): void {
    let result = 'index,size,penalty\n';
    files.forEach(file => {
        result += getListPenalty(file);
    });
    console.log('List algorithm solution penalties saved in penalties.csv');
    fs.writeFileSync('penalties.csv', result);
}

export function calculateListTimes(files: string[]): void {
    let result = 'index,size,time\n';
    files.forEach(file => {
        // Prior execution to reduce measured execution times
        getListTime(file);
        result += getListTime(file);
    });
    console.log('List algorithm execution times saved in times.csv');
    fs.writeFileSync('times.csv', result);
}

export function saveListSolutions(files: string[]): void {
    files.forEach(file => {
        fs.writeFileSync('./solutions/out132275_' +
            file.substring(file.indexOf('_') + 1, file.indexOf('.txt')) + '.txt',
            getListSolution(file));
    });
    console.log('List algorithm solutions saved in ./solutions');
}

export function safeTestListSolution(file) {
    fs.writeFileSync('solution.txt', getListSolution(file));
    console.log('Test list solution saved in solution.txt file');
}