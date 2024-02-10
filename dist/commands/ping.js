import { __decorate } from "tslib";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";
let Ping = class Ping {
    async ping(ctx) {
        await ctx.deferReply();
        const getLatencyButton = new ButtonBuilder()
            .setLabel("Get Latency")
            .setEmoji("🏓")
            .setStyle(ButtonStyle.Success)
            .setCustomId('latency-button');
        const actionRow = new ActionRowBuilder().addComponents(getLatencyButton);
        await ctx.editReply({
            components: [actionRow],
            content: "Pong!"
        });
    }
    async getLatencyButton(ctx) {
        await ctx.reply(`🏓 Current latency is ${Date.now() - ctx.createdTimestamp}ms. API latency is ${Math.round(ctx.client.ws.ping)}ms.`);
    }
};
__decorate([
    Slash({ name: "ping", description: "says pong!" })
], Ping.prototype, "ping", null);
__decorate([
    ButtonComponent({ id: "latency-button" })
], Ping.prototype, "getLatencyButton", null);
Ping = __decorate([
    Discord()
], Ping);
export { Ping };
//# sourceMappingURL=ping.js.map