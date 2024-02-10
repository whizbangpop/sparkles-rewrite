import type { ButtonInteraction, CommandInteraction, MessageActionRowComponentBuilder } from "discord.js";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { generateRSAKeys, loadPublicKey } from "../utils/keyHandler.js"; 
import { Logger } from "../utils/logger"; 
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from 'form-data';

@Discord()
export class Key {
    @Slash({ name: "generate_keys", description: "Generates new server encryption keys" })
    async gen_keys(
        @SlashOption({
            description: "Passphrase used to encrypt and decrypt message backups",
            name: "passphrase",
            required: true,
            type: ApplicationCommandOptionType.String
        })
        passphrase: string,
        ctx: CommandInteraction
    ): Promise<void> {
        await ctx.deferReply();

        const ExistingKeys = loadPublicKey(ctx.guild!.id);
        if (ExistingKeys) {
            const KeysEmbed1 = new EmbedBuilder()
                .setTitle("Existing Keys")
                .setDescription(`We already have an existing set of encryption keys for this server.
                If you have lost your passphrase, while we cannot recover your messages, we can reset your keys and let you start from fresh.
                
                If you need a reset, please open a ticket in the support server.`);

            const KeysButton1 = new ButtonBuilder()
                .setLabel("Understood")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('dismiss_message');

            const ActionRow1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(KeysButton1);

            await ctx.editReply({
                components: [ActionRow1],
                embeds: [KeysEmbed1]
            });

            return;
        }
    }

    @ButtonComponent({ id: "dismiss_message" })
    async getLatencyButton(ctx: ButtonInteraction): Promise<void> {
        await ctx.message.delete();
    }
}