import { __decorate, __param } from "tslib";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { loadPublicKey } from "../utils/keyHandler.js";
let Key = class Key {
    async gen_keys(passphrase, ctx) {
        await ctx.deferReply();
        const ExistingKeys = loadPublicKey(ctx.guild.id);
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
            const ActionRow1 = new ActionRowBuilder().addComponents(KeysButton1);
            await ctx.editReply({
                components: [ActionRow1],
                embeds: [KeysEmbed1]
            });
            return;
        }
    }
    async getLatencyButton(ctx) {
        await ctx.message.delete();
    }
};
__decorate([
    Slash({ name: "generate_keys", description: "Generates new server encryption keys" }),
    __param(0, SlashOption({
        description: "Passphrase used to encrypt and decrypt message backups",
        name: "passphrase",
        required: true,
        type: ApplicationCommandOptionType.String
    }))
], Key.prototype, "gen_keys", null);
__decorate([
    ButtonComponent({ id: "dismiss_message" })
], Key.prototype, "getLatencyButton", null);
Key = __decorate([
    Discord()
], Key);
export { Key };
//# sourceMappingURL=generateKeys.js.map