import { Task, loadInstance } from './main';

// TODO: Pomiar czasu w mikrosekundach
function generateSolution(tasks: Task[], cores: number, fileName = 'solution.txt', returnString = true) {

    const sortedTasks = tasks.sort((t1, t2) => t1.p > t2.p ? 1 : -1);
    let penalty = 0;
    let coreArray = []
    for (let i = 0; i < cores; i++) {
        coreArray.push({ id: i, time: 0, tasks: [] });
    }

    sortedTasks.forEach(task => {
        coreArray = coreArray.sort((c1, c2) => c1.time > c2.time ? 1 : -1);

        if (coreArray[0].time < task.r) {
            coreArray[0].time = task.r;
        }

        if (coreArray[0].time + task.p > task.d) {
            console.log('Penalty, (task, core time)', task, coreArray[0].time);
            penalty += coreArray[0].time + task.p - task.d;
        }

        coreArray[0].time += task.p;
        coreArray[0].tasks.push(task);
    });

    let solution = penalty + '\n';
    coreArray.forEach(core => {
        solution += core.tasks.map(task => task.id) + '\n';
    });

    // TODO: Return solution, integrate solver and validator better
    console.log(solution);
}

generateSolution(loadInstance('instance.txt'), 4);
