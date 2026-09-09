import OBR from '@owlbear-rodeo/sdk';
import { OwlbearIds } from './BSConstants';

/**
 * Central logging utility for console output control
 * Toggle ENABLE_LOGGING to turn all console output on/off
 */

let enableLogging = false;
const LOGGER_LABEL = '[SMOKE ☁️]';
const CHATLOG_CHANNEL = `${OwlbearIds.EXTENSIONID}/chatlog`;

// Helper to send message to System Log via broadcast
const sendToChatLog = (message: string) => {
    if (OBR.isAvailable) {
        OBR.broadcast.sendMessage(CHATLOG_CHANNEL, message, { destination: 'LOCAL' });
    }
};

// Helper to format args for display
const formatArgs = (...args: any[]): string => {
    return args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
};

export const LOGGER = {
    setEnabled: (enabled: boolean) => {
        enableLogging = enabled;
    },

    isEnabled: () => enableLogging,

    log: (...args: any[]) => {
        if (enableLogging) {
            console.log(LOGGER_LABEL, ...args);
            sendToChatLog(`[LOG] ${formatArgs(...args)}`);
        }
    },

    error: (...args: any[]) => {
        if (enableLogging) {
            console.error(LOGGER_LABEL, ...args);
            sendToChatLog(`[ERROR] ${formatArgs(...args)}`);
        }
    },

    warn: (...args: any[]) => {
        if (enableLogging) {
            console.warn(LOGGER_LABEL, ...args);
            sendToChatLog(`[WARN] ${formatArgs(...args)}`);
        }
    },

    info: (...args: any[]) => {
        if (enableLogging) {
            console.info(LOGGER_LABEL, ...args);
            sendToChatLog(`[INFO] ${formatArgs(...args)}`);
        }
    },

    debug: (...args: any[]) => {
        if (enableLogging) {
            console.debug(LOGGER_LABEL, ...args);
            sendToChatLog(`[DEBUG] ${formatArgs(...args)}`);
        }
    },

    table: (...args: any[]) => {
        if (enableLogging) {
            console.table(LOGGER_LABEL, ...args);
        }
    },

    group: (...args: any[]) => {
        if (enableLogging) {
            console.group(LOGGER_LABEL, ...args);
        }
    },

    groupEnd: () => {
        if (enableLogging) {
            console.groupEnd();
        }
    },

    trace: (...args: any[]) => {
        if (enableLogging) {
            console.trace(LOGGER_LABEL, ...args);
        }
    },
};

export default LOGGER;
