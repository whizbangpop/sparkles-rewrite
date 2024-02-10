import type { ButtonInteraction, CommandInteraction, MessageActionRowComponentBuilder } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";

@Discord()
export class Ping {
    @Slash({ name: "ping", description: "says pong!" })
    async ping(
        ctx: CommandInteraction
    ): Promise<void> {
        await ctx.deferReply();

        const getLatencyButton = new ButtonBuilder()
            .setLabel("Get Latency")
            .setEmoji("🏓")
            .setStyle(ButtonStyle.Success)
            .setCustomId('latency-button');
        const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(getLatencyButton);

        await ctx.editReply({
            components: [actionRow],
            content: "Pong!"
        });
    }

    @ButtonComponent({ id: "latency-button" })
    async getLatencyButton(ctx: ButtonInteraction): Promise<void> {
        await ctx.reply(`🏓 Current latency is ${Date.now() - ctx.createdTimestamp}ms. API latency is ${Math.round(ctx.client.ws.ping)}ms.`);
    }
}