import * as fs from 'fs';

class Task {
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

function loadInstance() {
    const data = fs.readFileSync('./instance.txt', 'utf-8');
    instanceSize = data.split('\n')[0] as unknown as number;

    tasks = data.split('\n').slice(1, data.split('\n').length - 1)
        .map(row => new Task(...row.split(' ')
            .map(val => val as unknown as number)));
}

loadInstance();
