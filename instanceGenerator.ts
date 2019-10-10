import * as fs from 'fs';

function generateInstance(size: number, timeRange = 10, CPUs = 4) {
    let instance = `${size}\n`;

    for (let i = 0; i < size; i++) {
        const p = Math.floor(Math.random() * timeRange) + 1;
        const r = Math.floor(Math.random() * timeRange / CPUs * i);
        const d = r + p + Math.floor(Math.random() * timeRange);
        instance += `${p} ${r} ${d}\n`;
    }
    fs.writeFileSync('./instance.txt', instance);
}

generateInstance(process.argv[2] as unknown as number);
