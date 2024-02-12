import type { Channel, CommandInteraction, GuildChannel, GuildMember, Role, User } from "discord.js";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { Prisma, PrismaClient } from '@prisma/client';
import { Logger } from "../utils/logger.js";

@Discord()
@SlashGroup({ description: "Command group for roleplay channel managment", name: "channels" })
export class Example {
    @Slash({ description: "Adds a channel to an existing roleplay", name: "create" })
    @SlashGroup("channels")
    async addChannel(
        @SlashOption({
            description: "Name of the channel to be added",
            name: "name",
            required: true,
            maxLength: 33,
            type: ApplicationCommandOptionType.String
        })
        newChannel: string,

        @SlashChoice({ name: "Conversation", value: "conversation" })
        @SlashChoice({ name: "Lore", value: "lore" })
        @SlashChoice({ name: "Character Info", value: "character" })
        @SlashChoice({ name: "Group Chat", value: "character" })
        @SlashOption({
            description: "Type of channel to be added",
            name: "type",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        channelType: string,

        @SlashOption({
            description: "Category of the roleplay the channel is to be added to",
            name: "roleplay",
            required: true,
            type: ApplicationCommandOptionType.Channel
        })
        roleplayInfoChannel: Channel,

        ctx: CommandInteraction,
    ): Promise<void> {
        await ctx.deferReply();

        const category = ctx.client.channels.cache.get(roleplayInfoChannel.id);
        if (category?.type !== 4) {await ctx.editReply({ content: 'Please select the category of the roleplay, not any of the channels inside the roleplay.' }); return}; 

         

        if (channelType === "conversation" || channelType === "lore" || channelType === "character") {
            const RPChannel = await ctx.guild?.channels.create({ name: newChannel, type: ChannelType.GuildText, parent: category?.id, reason: 'Sparkles RP Managment | SCURCHNLCRT' });
            if (!RPChannel) return;

            const prisma = new PrismaClient();
            async function createNewRPChannel(channelName: string, channelId: string, roleplayId: string, channelType: string) {
                await prisma.roleplayChannel.create({
                    data: {
                        channelName,
                        channelId,
                        channelType,
                        roleplayId,
                        hasBillingEnabled: false
                    }
                });
            }
            
            createNewRPChannel(newChannel, RPChannel.id, category.id, channelType)
                .then(async () => {
                    await prisma.$disconnect()
                })
                .catch(async (e) => {
                    Logger.error(e)
                    await prisma.$disconnect()
                    return;
                })

            const NewEmbed = new EmbedBuilder()
                .setTitle(`Channel Added: <#${RPChannel.id}>`)
                .setDescription('To enable billing and backups for this channel, run </manage_channel edit_channel:1206550341483761724> and edit `Backup Status`. Please note that enabling backups will start to use your account credits or a slot on your subscription.\n\nMetadata:')
                .addFields([ {name: "Roleplay", value:`<#${category.id}>`}, { name: "Creator", value: `<@${ctx.member?.user.id}>` }, { name: "Billing Enabled?", value: "No" } ])

            await ctx.editReply({
                embeds: [NewEmbed]
            })
        };
    }

    @Slash({ description: "Removes a channel from an existing roleplay", name: "remove" })
    @SlashGroup("channels")
    async removeChannel(
        @SlashOption({
            description: "Channel to be removed",
            name: "channel",
            required: true,
            type: ApplicationCommandOptionType.Channel
        })
        channel: GuildChannel,
        ctx: CommandInteraction
    ): Promise<void> {
        await ctx.deferReply();

        const prisma = new PrismaClient();
        async function removeRPChannel(channelId: string) {
            try {
                const deletedChannel = await prisma.roleplayChannel.delete({
                    where: {
                      channelId,
                    },
                  })

                  console.log(deletedChannel)
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2025") return "NoChannelStored"
                }
                Logger.error(error);
            }
        };
        

        removeRPChannel(channel.id)
            .then(async (resp) => {
                await prisma.$disconnect()

                if (resp === "NoChannelStored") { await ctx.editReply({ content: 'Sparkles has no metadata stored for this channel. Are you sure this channel is managed by Sparkles?' }); return; }
                else {
                    ctx.channel?.delete('Sparkles RP Managment | SCURCHNLDEL');

                    const NewEmbed = new EmbedBuilder()
                        .setTitle(`Channel Removed: ${channel.name}`)
                        .setDescription('Metadata:')
                        .addFields([ { name: "Actioner", value: `<@${ctx.member?.user.id}>` }, { name: "Backups Enabled?", value: "No" } ])

                    await ctx.editReply({
                        embeds: [NewEmbed]
                    })
                }
            })
            .catch(async (e) => {
                Logger.error(e)
                await prisma.$disconnect()
                return;
            });
    }
}