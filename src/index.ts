import { createCanvas } from 'canvas';
import { writeFile } from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import { DateTime } from 'luxon';
import config from './config.json' assert { type: 'json' };

const canvas = createCanvas(config.screen.width, config.screen.height);
const ctx = canvas.getContext('2d');

enum progressType {
    year,
    month,
    day,
    hour,
    minute,
}

const calcCenterX = (w: number, cw = config.screen.width): number => {
    return cw / 2 - w / 2;
};

const calcCenterY = (h: number, ch = config.screen.height): number => {
    return ch / 2 - h / 2;
};

const calcProgressWidth = () => {
    let size: number;

    switch (progressType[config.options.type]) {
        case 0: {
            const now = DateTime.now();
            const start = DateTime.fromISO(`${now.year}-01-01`);
            const diff = now.diff(start, 'days');
            const percent = (diff.toObject().days / 365) * 100;
            size = (percent / 100) * config.options.width;
            break;
        }
        case 1: {
            const now = DateTime.now();
            const start = DateTime.fromISO(
                `${now.year}-${now.month.toString().padStart(2, '0')}-01`
            );
            const diff = now.diff(start, 'days');
            const percent = (diff.toObject().days / 30) * 100;
            size = (percent / 100) * config.options.width;
            break;
        }
        case 2: {
            const now = DateTime.now();
            const start = DateTime.local(now.year, now.month, now.day, 0, 0, 0);
            const diff = now.diff(start, 'minutes');
            const percent = (diff.toObject().minutes / 1440) * 100;
            size = (percent / 100) * config.options.width;
            break;
        }
        case 3: {
            const now = DateTime.now();
            const start = DateTime.local(
                now.year,
                now.month,
                now.day,
                now.hour,
                0,
                0
            );
            const diff = now.diff(start, 'minutes');
            const percent = (diff.toObject().minutes / 60) * 100;
            size = (percent / 100) * config.options.width;
            break;
        }
        case 4: {
            const now = DateTime.now();
            const start = DateTime.local(
                now.year,
                now.month,
                now.day,
                now.hour,
                now.minute,
                0
            );
            const diff = now.diff(start, 'seconds');
            const percent = (diff.toObject().seconds / 60) * 100;
            size = (percent / 100) * config.options.width;
            break;
        }
        default: {
            throw new Error('Invalid Type.');
        }
    }

    return size;
};

const logTime = () => {
    const now = DateTime.now();
    return `${now.hour.toString().padStart(2, '0')}:${now.minute
        .toString()
        .padStart(2, '0')}:${now.second.toString().padStart(2, '0')}`;
};

async function draw() {
    // Draw the background
    ctx.fillStyle = config.themes[config.options.theme].bg;
    ctx.fillRect(0, 0, config.screen.width, config.screen.height);

    // Draw the bar
    ctx.fillStyle = config.themes[config.options.theme].fill;
    ctx.fillRect(
        calcCenterX(config.options.width),
        calcCenterY(config.options.height),
        calcProgressWidth(),
        config.options.height
    );

    // Draw the border
    const borderWidth =
        config.options.width +
        config.options.spacing * 2 +
        config.options.border;
    const borderHeight =
        config.options.height +
        config.options.spacing * 2 +
        config.options.border;
    ctx.lineWidth = config.options.border;
    ctx.strokeStyle = config.themes[config.options.theme].border;
    ctx.strokeRect(
        calcCenterX(borderWidth),
        calcCenterY(borderHeight),
        borderWidth,
        borderHeight
    );

    const buffer = canvas.toBuffer('image/png');
    writeFile('w.png', buffer);

    await setWallpaper('w.png');
}

setInterval(() => {
    draw();
    console.log(`changed wallpaper at ${logTime()}`);
}, config.refresh * 1000);
