const isProd = process.env.NODE_ENV || "production";

const logger = {
    info: (...args: any[]) => {
        if (isProd) console.log(JSON.stringify({ level: "info", time: new Date().toISOString(), args }));
        else console.info(...args);
    },
    warn: (...args: any[]) => {
        if (isProd) console.warn(JSON.stringify({ level: "warn", time: new Date().toISOString(), args }));
        else console.warn(...args);
    },
    error: (...args: any[]) => {
        if (isProd) console.error(JSON.stringify({ level: "error", time: new Date().toISOString(), args }));
        else console.error(...args);
    },
};

export default logger;