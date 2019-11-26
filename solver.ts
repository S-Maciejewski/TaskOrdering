import * as fs from 'fs';
import { Task, loadInstance } from './main';

// TODO: Pomiar czasu w mikrosekundach
export function generateListSolution(tasks: Task[], cores: number, returnPenalty = false,
    returnTime = false, returnSolution = false) {
    let penalty = 0;
    let coreArray = [];
    for (let i = 0; i < cores; i++) {
        coreArray.push({ id: i, time: 0, tasks: [] });
    }

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
        return 0; // TODO: Time counter
    } else if (returnSolution) {
        let solution = penalty + '\n';
        coreArray.forEach(core => {
            solution += core.tasks.map(task => task.id) + '\n';
        });
        return solution;
    }
}

function getListPenalty(file: string): string {
    const tasks = loadInstance(file);
    return file.substring(file.indexOf('in') + 2, file.indexOf('_'))
        + ',' + tasks.length + ',' + generateListSolution(tasks, 4, true) + '\n';
}

export function calculateListPenalties(files: string[]): void {
    let result = 'index,size,penalty\n';
    files.forEach(file => {
        result += getListPenalty(file);
    });
    console.log('List algorithm solution penalties saved in penalties.csv');
    fs.writeFileSync('penalties.csv', result);
}
