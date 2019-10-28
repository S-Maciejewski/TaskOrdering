import * as fs from 'fs';

class Task {
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

let tasks: Task[];
let instanceSize: number;
let solution: any;
let totalPenalty: number;

function loadInstance(fileName: string) {
    const data = fs.readFileSync(fileName, 'utf-8');
    instanceSize = data.split('\n')[0] as unknown as number;
    let taskID = 1;

    tasks = data.split('\n').slice(1, data.split('\n').length - 1)
        .map(row => new Task(...row.split(' ')
            .map(val => val as unknown as number * 1)))
        .map(task => ({ ...task, id: taskID++ }));
}

function loadSolution(fileName: string) {
    const data = fs.readFileSync(fileName, 'utf-8');
    totalPenalty = data.split('\n')[0] as unknown as number;

    solution = data.split('\n').slice(1).map(obj => obj.split(' '))
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
        // Debug
        // console.log('\nTask:', task, '\n\tTime:', time, '\n\tPenalty:', penalty);
    });
    return penalty;
}

function calculatePenalty() {
    return solution
        .map(core =>
            getCorePenalty(tasks.filter(task => core.includes(task.id))))
        .reduce((a, b) => a + b, 0);
}

loadInstance(process.argv.length > 2 ? process.argv[2] : 'instance.txt');
loadSolution(process.argv.length > 3 ? process.argv[3] : 'solution.txt');

console.log('Calculated penalty:', calculatePenalty(), '\nSolution penalty:', totalPenalty);
// console.log(tasks);
// console.log(solution);
