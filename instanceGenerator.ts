import * as fs from 'fs';

function generateInstance(size: number, fileName: string, timeRange = 10,
    buffer = 8, CPUs = 4) {
    let instance = `${size}\n`;

    for (let i = 0; i < size; i++) {
        const p = Math.floor(Math.random() * timeRange) + 1;
        // const r = Math.floor((Math.random()) * timeRange / CPUs * i);
        const r = Math.floor((Math.random()) * timeRange / CPUs + i / CPUs);
        const d = r + p + Math.floor(Math.random() * buffer) + 1;
        instance += `${p} ${r} ${d}\n`;
    }

    fs.writeFileSync(fileName, instance);
}

if (process.argv.length > 2) {
    generateInstance(process.argv[2] as unknown as number,
        process.argv.length > 3 ? process.argv[3] : 'instance.txt');
} else {
    for (let i = 50; i <= 500; i += 50) {
        generateInstance(i, `./instances/instance${i}.txt`);
    }
}

