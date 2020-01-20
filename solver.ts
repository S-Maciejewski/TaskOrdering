import * as fs from 'fs';
import * as micSec from 'microseconds';
import { Task, loadInstance } from './main';
import { calculateCoresPenalty } from './validator';

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

export function saveTestListSolution(file) {
    fs.writeFileSync('solution.txt', getListSolution(file));
    console.log('Test list solution saved in solution.txt file');
}


// Genetic algorithm

function getGeneticOutcome(file: string) {
    const tasks = loadInstance(file);
    return generateSolution(tasks, 4);
}

export function calculateGeneticOutcome(files: string[], saveSolutions = false): void {
    let result = 'index,size,penalty\n';
    let resultTime = 'index,size,time\n';

    if (saveSolutions) {
        files = files.filter(x => x.includes('132275'));
    }

    files.forEach(file => {
        const size = loadInstance(file).length;
        const res = getGeneticOutcome(file);

        if (saveSolutions) {
            console.log('Genetic algorithm solution for size', size, 'saved in ./solutions');

            fs.writeFileSync('./solutions/out132275_' +
                file.substring(file.indexOf('_') + 1, file.indexOf('.txt')) + '.txt',
                res.solution);
        }
        result += file.substring(file.indexOf('in') + 2, file.indexOf('_'))
            + ',' + size + ',' + res.penalty + '\n';
        resultTime += file.substring(file.indexOf('in') + 2, file.indexOf('_'))
            + ',' + size + ',' + res.time + '\n';
    });
    fs.writeFileSync('penalties.csv', result);
    console.log('Genetic algorithm solution penalties saved in penalties.csv');
    fs.writeFileSync('times.csv', resultTime);
    console.log('Genetic algorithm execution times saved in times.csv');
}

function restoreCleanCoreArray(coreArray) {
    const res = [];
    for (let i = 0; i < coreArray.length; i++) {
        res.push({ id: i, time: 0, tasks: coreArray[i].tasks.slice(0, coreArray[i].tasks.length) });
    }
    return res;
}

function nearMutation(tasks: Task[], coreArray) {
    const childArray = restoreCleanCoreArray(coreArray);
    const genesArray = childArray.map(core => core.tasks.map(task => task.id));
    const range = Math.max(...genesArray.map(x => x.length)) - Math.min(...genesArray.map(x => x.length));
    const gene = Math.ceil(Math.random() * tasks.length);

    let corePos, taskPos;
    do {
        corePos = genesArray.findIndex(x => x.includes(gene));
        taskPos = genesArray[corePos].indexOf(gene);
    } while (taskPos >= genesArray[corePos].length);

    let newCorePos, newTaskPos;
    newCorePos = Math.floor(Math.random() * coreArray.length);
    do {
        if (Math.random() > 0.5) {
            newTaskPos = taskPos - Math.ceil(Math.random() * range);
        } else {
            newTaskPos = taskPos + Math.ceil(Math.random() * range);
        }
    } while (!(newTaskPos >= 0 && newTaskPos < genesArray[newCorePos].length));
    // console.log({ cp: corePos, tp: taskPos, ncp: newCorePos, ntp: newTaskPos });

    childArray[corePos].tasks[taskPos] = coreArray[newCorePos].tasks[newTaskPos];
    childArray[newCorePos].tasks[newTaskPos] = coreArray[corePos].tasks[taskPos];
    return childArray;
}

function generateSolution(tasks: Task[], cores: number) {
    // Alg. listowy
    let coreArray = [];
    for (let i = 0; i < cores; i++) {
        coreArray.push({ id: i, time: 0, tasks: [] });
    }

    const startTime = process.hrtime.bigint();
    // const startTime = micSec.now();
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

        coreArray[0].time += task.p;
        coreArray[0].tasks.push(task);
    });

    const listSolutionPenalty = calculateCoresPenalty(coreArray);
    // console.log('List solution penalty:', listSolutionPenalty, 'time:', (process.hrtime.bigint() - startTime) / BigInt(1000));
    // timeLimit: n * 100 microseconds
    const timeLimit = 100 * 1000 * tasks.length;

    let penalty = calculateCoresPenalty(coreArray);
    let mutations = 0, improvements = 0;
    // * 0.98 to give some time to finish last iteration
    for (mutations = 0; (process.hrtime.bigint() - startTime) / BigInt(1000) < timeLimit * 0.98; mutations++) {
        const child = nearMutation(tasks, coreArray);
        if (calculateCoresPenalty(child) < penalty) {
            penalty = calculateCoresPenalty(child);
            coreArray = restoreCleanCoreArray(child);
            improvements++;
        }
    }

    // console.log('Post-mutation penalty:', penalty, 'took:', (process.hrtime.bigint() - startTime) / BigInt(1000), 'after', mutations, 'mutations. Improved generations:', improvements);

    const time = (process.hrtime.bigint() - startTime) / BigInt(1000);
    let solution = penalty + '\n';
    coreArray.forEach(core => {
        // Return as string, task ids separated with spaces
        solution += core.tasks.map(task => task.id).reduce((agg, taskID) => agg += ' ' + taskID) + '\n';
    });

    console.log('Improvement:', (1 - penalty / listSolutionPenalty) * 100, '% - instance size:', tasks.length);

    return { penalty, time, solution };

}
