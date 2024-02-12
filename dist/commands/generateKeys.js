import { __decorate, __param } from "tslib";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { generateRSAKeys, loadPublicKey } from "../utils/keyHandler.js";
import { Logger } from "../utils/logger.js";
import { RedisClient } from "../database/redis.js";
import { DecryptMessage, EncryptMessage } from "../utils/encryptionHandler.js";
import "dotenv/config";
const SparklesDecryptKey = process.env.AUTO_KEY;
let Key = class Key {
    async gen_keys(passphrase, ctx) {
        await ctx.deferReply({ ephemeral: true });
        if (!ctx.guild?.id)
            return;
        if (ctx.guild?.ownerId !== ctx.member?.user.id)
            return;
        const ExistingKeys = loadPublicKey(ctx.guild.id);
        console.log(ExistingKeys);
        if (ExistingKeys) {
            const KeysEmbed1 = new EmbedBuilder()
                .setTitle("Existing Keys")
                .setDescription(`We already have an existing set of encryption keys for this server.
                If you have lost your passphrase, while we cannot recover your messages, we can reset your keys and let you start from fresh.
                
                If you need a reset, please open a ticket in the support server.`);
            await ctx.editReply({
                embeds: [KeysEmbed1]
            });
            return;
        }
        if (!ExistingKeys) {
            const KeysEmbed1 = new EmbedBuilder()
                .setTitle('Generate Encryption Keys?')
                .setDescription(`Please make sure you have taken a **secure** note of your passphrase. Once you click "Go Ahead", you will no longer be able to access your passphrase.
                We are unable to recover any backed up messages if you loose this key. This also means you cannot view or recover any messages if you loose this key.
                
                Once you have taken a backup of your passphrase (in something like a password manager), click "Go Ahead". If you aren't sure, you can just hit cancel and nothing will happen.`);
            const KeysButton1 = new ButtonBuilder()
                .setLabel("Go Ahead")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
                .setCustomId('keys_gen_go_ahead');
            const KeysButton2 = new ButtonBuilder()
                .setLabel("Cancel")
                .setEmoji("❎")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('keys_gen_cancel');
            const ActionRow1 = new ActionRowBuilder().addComponents(KeysButton1, KeysButton2);
            await ctx.editReply({
                components: [ActionRow1],
                embeds: [KeysEmbed1]
            });
            RedisClient.set(`tempkeystore-${ctx.guild?.id}`, String(EncryptMessage('999999999999999999', passphrase)));
        }
    }
    async cancel(ctx) {
        await ctx.deferReply({ ephemeral: true });
        const Embed1 = new EmbedBuilder()
            .setDescription("Operation cancelled. These messages can be dismissed.");
        RedisClient.del(`tempkeystore-${ctx.guild.id}`);
        await ctx.editReply({ embeds: [Embed1] });
    }
    ;
    async go_ahead(ctx) {
        await ctx.deferReply({ ephemeral: true });
        await ctx.editReply({
            content: 'Please wait... Generating keys.'
        });
        let passphrase;
        RedisClient.get(`tempkeystore-${ctx.guild?.id}`).then((res) => { passphrase = res; });
        Logger.debug(`Generating new keys`, { guildId: ctx.guild.id });
        const NewKeys = generateRSAKeys(ctx.guild.id, String(DecryptMessage(String(passphrase), String(SparklesDecryptKey), "999999999999999999")) || "");
        const Embed2 = new EmbedBuilder();
        Embed2.setTitle("Public Key");
        Embed2.setDescription(`${NewKeys.PublicKey}`);
        const Embed3 = new EmbedBuilder();
        Embed3.setTitle("Private Key");
        Embed3.setDescription(`${NewKeys.PrivateKey}`);
        await ctx.editReply({
            embeds: [Embed2],
            content: "You will be send your server private key in a DM. We reccomend making a note of your public and private key as they can be used to verify ownership and control over a server, even if you loose access to your account."
        });
        await ctx.user.send({ embeds: [Embed3], content: 'Please take note of this key and keep it safe as this can be used to transfer super-admin control of your server in the event you loose access to your account.' });
        RedisClient.del(`tempkeystore-${ctx.guild.id}`);
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
    ButtonComponent({ id: "keys_gen_cancel" })
], Key.prototype, "cancel", null);
__decorate([
    ButtonComponent({ id: "keys_gen_go_ahead" })
], Key.prototype, "go_ahead", null);
Key = __decorate([
    Discord()
], Key);
export { Key };
//# sourceMappingURL=generateKeys.js.map