import * as fs from 'fs';
import * as glob from 'glob';
import { validateInstances, validateSolution } from './validator';
import { calculateListPenalties, saveListSolutions, calculateListTimes, saveTestListSolution, calculateGeneticOutcome } from './solver';

const indexes = [132290, 132324, 132289, 132234, 132311, 132235, 132275, 132332,
    132202, 132205, 132217, 132250, 132322, 132212, 116753, 132264, 132078];

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
    if (data[data.length - 1] !== '\n') {
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

glob('./Instancje/*', {}, (er, files) => {
    files = files.sort((x, y) => {
        const xIndex = + x.substring(x.indexOf('in') + 2, x.indexOf('_'));
        const yIndex = + y.substring(y.indexOf('in') + 2, y.indexOf('_'));
        const xSize = + x.substring(x.indexOf('_') + 1, x.indexOf('.txt'));
        const ySize = + y.substring(y.indexOf('_') + 1, y.indexOf('.txt'));
        if (xIndex === yIndex) {
            return xSize > ySize ? 1 : -1;
        } else {
            return indexes.indexOf(xIndex) > indexes.indexOf(yIndex) ? 1 : -1;
        }
    });
    // Command line arguments
    // Validate instances - generate dummy solution

    if (process.argv.includes('-vi')) {
        validateInstances(files);
    }

    // Calculate penalties for list algorithm solution
    if (process.argv.includes('-lk')) {
        calculateListPenalties(files);
    }

    // Calculate execution time of list algorithm
    if (process.argv.includes('-lt')) {
        calculateListTimes(files);
    }

    // Generate list algorithm solutions for my instances (save in ./solutions)
    if (process.argv.includes('-ls')) {
        const myInstances = files.filter(x => x.includes('132275'));
        saveListSolutions(myInstances);
    }

    // Generate test list algorithm solution for given instance file
    if (process.argv.includes('-tls')) {
        saveTestListSolution('instance.txt');
    }

    // Check if solution's given penalty equals it's actual penalty
    if (process.argv.includes('-vs')) {
        validateSolution('instance.txt', 'solution.txt');
    }

    if (process.argv.includes('-g')) {
        calculateGeneticOutcome(files, false);
    }

    if (process.argv.includes('-gs')) {
        calculateGeneticOutcome(files, true);
    }
});
