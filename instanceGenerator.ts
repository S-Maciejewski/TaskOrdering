
function generateInstance(size: number, timeRange = 10, CPUs = 4) {
    console.log(size);
    for (let i = 0; i < size; i++) {
        const p = Math.floor(Math.random() * timeRange);
        const r = Math.floor(Math.random() * timeRange / CPUs * i);
        const d = r + p + Math.floor(Math.random() * timeRange);

        console.log(p, r, d);
    }
}

generateInstance(10);
