import { dirname, importx } from "@discordx/importer";
import { ActivityType, IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { Logger } from "./utils/logger.js";
import 'dotenv/config';
export class Main {
    static _client;
    static get Client() {
        return this._client;
    }
    ;
    static async start() {
        this._client = new Client({
            // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.DirectMessages
            ],
            silent: false,
            simpleCommand: { prefix: "**" },
            presence: {
                activities: [{
                        name: 'messages',
                        url: "https://sparkles.whxpop.net",
                        type: ActivityType.Watching
                    }],
                status: 'online'
            }
        });
        this._client.once("ready", async () => {
            await this._client.initApplicationCommands();
            Logger.info(">> sparkles started");
        });
        this._client.on("interactionCreate", (ctx) => {
            this._client.executeInteraction(ctx);
        });
        this._client.on("messageCreate", (msg) => {
            this._client.executeCommand(msg);
        });
        await importx(`${dirname(import.meta.url)}/commands/**/*.{js,ts}`);
        if (!process.env.TOKEN) {
            Logger.error('No token found in env. Terminating...');
        }
        else {
            this._client.login(process.env.TOKEN);
        }
    }
}
Main.start();
//# sourceMappingURL=app.js.map