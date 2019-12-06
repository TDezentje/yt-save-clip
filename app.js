const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const readline = require('readline');

const videoId = process.argv[2];
const startTime = process.argv[3];

(async () => {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const selectedFormat = info.formats
        .filter(f => !!f.width)
        .sort((a,b) => b.width === a.width ? a.mimeType.startsWith('video/webm') ? -1 : 1 : b.width - a.width)
        [0];
    
    const extension = selectedFormat.mimeType.startsWith('video/webm') ? 'webm' : selectedFormat.mimeType.startsWith('video/mp4') ? 'mp4' : undefined;

    if(!extension) {
        console.error('No accepted format found');
    }

    try {
        fs.readdirSync('.cache');
    } catch {
        fs.mkdirSync('.cache');
    }

    const outputPath = path.resolve(__dirname, `./.cache/${videoId}.${extension}`);
    const video = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
        format: selectedFormat,
        begin: startTime
    });
    
    video.pipe(fs.createWriteStream(outputPath));
    video.once('response', () => {
        starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => { 
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimated time left: ${(downloadedMinutes / percent - downloadedMinutes).toFixed(2)}minutes `);
        readline.moveCursor(process.stdout, 0, -1);
    });
})();
