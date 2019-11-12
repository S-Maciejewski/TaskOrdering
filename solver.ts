import { Task, loadInstance } from './validator';

const tasks: Task[] = loadInstance('instance.txt');
// loadInstance('instance.txt');
// function generateSolution(cores: number, fileName: string) {
//     let sortedTasks = tasks.sort((t1, t2) => (t1.p + t1.r) - (t2.p + t2.r));
//     let coresTasks = [[], [], [], []];
//     let d = 0;

//     sortedTasks.map(task => {

//         console.log(task)
//     });

//     // console.log(sortedTasks);

// }


// function assignTask(coresTasks, task) {
//     for(core in coresTasks) {

//     }
// }

// function getCoreTime(tasksList) {
//     tasksList.reduce(task => {
//         return tasks[task]
//     }, 0)

// }

// generateSolution(4, 'solution.txt');
