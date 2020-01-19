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

export function safeTestListSolution(file) {
    fs.writeFileSync('solution.txt', getListSolution(file));
    console.log('Test list solution saved in solution.txt file');
}

export function getSolution(file: string) {
    const tasks = loadInstance(file);
    return generateSolution(tasks, 4);
}



function getPermutations(tasks) {
    const ret = [];
    for (let i = 0; i < tasks.length; i = i + 1) {
        const rest = getPermutations(tasks.slice(0, i).concat(tasks.slice(i + 1)));
        if (!rest.length) {
            ret.push([tasks[i]]);
        } else {
            for (let j = 0; j < rest.length; j = j + 1) {
                ret.push([tasks[i]].concat(rest[j]));
            }
        }
    }
    return ret;
}

function restoreCleanCoreArray(coreArray) {
    const res = [];
    for (let i = 0; i < coreArray.length; i++) {
        res.push({ id: i, time: 0, tasks: coreArray[i].tasks.slice(0, coreArray[i].tasks.length) });
    }
    return res;
}

function addPermutationToCoreArray(coreArray, permutation) {
    const res = coreArray;
    for (let i = 0; i < permutation.length; i++) {
        res[i].tasks.push(permutation[i]);
    }
    return res;
}

function mutateCoreArray(tasks: Task[], coreArray) {
    let gene1, gene2;
    const childArray = coreArray;

    do {    // Math.ceil, bo taski mają id 1..n
        gene1 = Math.ceil(Math.random() * tasks.length);
        gene2 = Math.ceil(Math.random() * tasks.length);
    } while (gene1 === gene2);

    childArray.forEach(core => {
        let genes = core.tasks.map(task => task.id);
        if (genes.includes(gene1) && genes.includes(gene2)) {
            // TODO?
            return;
        } else if (genes.includes(gene1)) {
            // console.log('gene1', gene1, 'found in', genes, 'swapping with gene2', gene2);
            genes = core.tasks[genes.indexOf(gene1)] = tasks[tasks.map(task => task.id).indexOf(gene2)];
            genes = core.tasks.map(task => task.id);
            // console.log(genes);
        } else if (genes.includes(gene2)) {
            // console.log('gene2', gene2, 'found in', genes, 'swapping with gene1', gene1);
            genes = core.tasks[genes.indexOf(gene2)] = tasks[tasks.map(task => task.id).indexOf(gene1)];
            genes = core.tasks.map(task => task.id);
            // console.log(genes);
        }
    });

    return childArray;
}

function nearMutation(tasks: Task[], coreArray) {
    let gene1;
    const range = 2;
    const childArray = restoreCleanCoreArray(coreArray);

    let genesArray = childArray.map(core => core.tasks.map(task => task.id));
    // console.log(genesArray);

    gene1 = Math.ceil(Math.random() * tasks.length);
    const corePos = genesArray.findIndex(x => x.includes(gene1));
    const taskPos = genesArray[corePos].indexOf(gene1);
    // console.log('gene1 (', gene1, ') position (core, task):', corePos, taskPos);

    let newCorePos, newTaskPos;
    newCorePos = Math.floor(Math.random() * coreArray.length);

    // if (newCorePos !== corePos)

    if (taskPos + range > genesArray[corePos].length - 1) {
        newTaskPos = taskPos - Math.ceil(Math.random() * range);
    } else if (taskPos - range < 0) {
        newTaskPos = taskPos + Math.ceil(Math.random() * range);
    } else {
        if (Math.random() > 0.5) {
            newTaskPos = taskPos + Math.ceil(Math.random() * range);
        } else {
            newTaskPos = taskPos - Math.ceil(Math.random() * range);
        }
    }

    // console.log('gene2 (', coreArray[newCorePos].tasks[newTaskPos].id, ') position (core, task):', newCorePos, newTaskPos);

    childArray[corePos].tasks[taskPos] = coreArray[newCorePos].tasks[newTaskPos];
    childArray[newCorePos].tasks[newTaskPos] = coreArray[corePos].tasks[taskPos];

    // genesArray = childArray.map(core => core.tasks.map(task => task.id));
    // console.log(genesArray);

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
    console.log('List solution penalty:', listSolutionPenalty, 'time:', (process.hrtime.bigint() - startTime) / BigInt(1000));
    // Limit czasu: n * 100 mikrosekund
    const timeLimit = 100 * tasks.length;

    // const child = nearMutation(tasks, coreArray)


    let penalty = calculateCoresPenalty(coreArray);
    let mutations = 0, improvements = 0;
    for (mutations = 0; (process.hrtime.bigint() - startTime) / BigInt(1000) < timeLimit; mutations++) {
        // const child = mutateCoreArray(tasks, coreArray);
        const child = nearMutation(tasks, coreArray);
        console.log(child)
        if (calculateCoresPenalty(child) < penalty) {
            penalty = calculateCoresPenalty(child);
            coreArray = child;
            improvements++;
        }
    }

    console.log('Post-mutation penalty:', penalty, 'took:', (process.hrtime.bigint() - startTime) / BigInt(1000), 'after', mutations, 'mutations. Improved generations:', improvements);
    console.log('Improvement:', (1 - penalty / listSolutionPenalty) * 100, '%');
}
