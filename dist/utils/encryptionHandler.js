import { Logger } from "./logger";
import { loadPrivateKey, loadPublicKey } from "./keyHandler.js";
import * as crypto from 'crypto';
export class ClearableMap {
    map;
    intervalDuration;
    clearIntervalId;
    constructor(intervalDuration = 24 * 60 * 60 * 1000) {
        this.map = new Map();
        this.intervalDuration = intervalDuration;
        this.clearIntervalId = null;
        this.startClearing();
    }
    clearMap() {
        Logger.debug('Clearing key map...');
        this.map.clear();
        // Schedule the next clearing after intervalDuration
        this.clearIntervalId = setTimeout(() => {
            this.clearMap();
        }, this.intervalDuration);
    }
    startClearing() {
        this.clearMap();
    }
    stopClearing() {
        if (this.clearIntervalId) {
            clearTimeout(this.clearIntervalId);
            this.clearIntervalId = null;
        }
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        return this.map.get(key);
    }
    has(key) {
        return this.map.has(key);
    }
    getAll() {
        return this.map;
    }
}
export const KeyMap = new ClearableMap();
/**
 * Encrypts a message using the public key associated with the provided guild ID.
 * @param {string} GuildId - The ID of the guild associated with the public key.
 * @param {string} Message - The message to encrypt.
 * @returns {string | null} The encrypted message as a base64-encoded string, or null if encryption fails.
 */
export function EncryptMessage(GuildId, Message) {
    if (KeyMap.has(GuildId)) {
        const publicKey = KeyMap.get(GuildId);
        const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(Message));
        return encryptedData.toString('base64');
    }
    else {
        const publicKey = loadPublicKey(GuildId);
        if (publicKey === null) {
            return null;
        }
        KeyMap.set(GuildId, publicKey);
        const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(Message));
        return encryptedData.toString('base64');
    }
}
/**
 * Decrypts an encrypted string using the provided private key and passphrase.
 * @param {string} encryptedString - The string to decrypt (base64-encoded).
 * @param {string} passkey - The passphrase associated with the private key.
 * @param {string} guildId - The guild ID associated with the private key.
 * @returns {string | null} The decrypted string, or null if decryption fails.
 */
function DecryptMessage(encryptedString, passkey, guildId) {
    if (!loadPrivateKey(guildId))
        return null;
    const privateKey = loadPrivateKey(guildId);
    try {
        const decryptedData = crypto.privateDecrypt({
            key: privateKey,
            passphrase: passkey
        }, Buffer.from(encryptedString, 'base64'));
        return decryptedData.toString();
    }
    catch (error) {
        Logger.error('Decryption failed:', error);
        return null;
    }
}
//# sourceMappingURL=encryptionHandler.js.map