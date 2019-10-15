import * as fs from 'fs';

function generateInstance(size: number, fileName: string, timeRange = 10,
    buffer = 6, CPUs = 4) {
    let instance = `${size}\n`;

    for (let i = 0; i < size; i++) {
        const p = Math.floor(Math.random() * timeRange) + 1;
        const r = Math.floor((Math.random() + 1) * timeRange / CPUs * i);
        const d = r + p + Math.floor(Math.random() * buffer) + 1;
        instance += `${p} ${r} ${d}\n`;
    }

    fs.writeFileSync(fileName, instance);
}

generateInstance(process.argv[2] as unknown as number,
    process.argv.length > 3 ? process.argv[3] : 'instance.txt');
