import type { Channel, CommandInteraction, GuildChannel, GuildMember, User } from "discord.js";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, TextChannel } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { PrismaClient, Prisma } from '@prisma/client'
import { Logger } from "../utils/logger.js";

@Discord()
@SlashGroup({ description: "Roleplay managment", name: "roleplays" })
export class Example {
    @Slash({ description: "Creates a new roleplay", name: "create" })
    @SlashGroup("roleplays")
    async addChannel(
        @SlashOption({
            description: "Name of the new roleplay",
            name: "name",
            required: true,
            maxLength: 32,
            type: ApplicationCommandOptionType.String
        })
        name: string,

        @SlashOption({
            description: "The person who is the DM/oversees the organisation and managment of the roleplay",
            name: "admin",
            required: true,
            type: ApplicationCommandOptionType.User
        })
        adminUser: GuildMember | User,

        @SlashOption({
            description: "Choose if to enable backups/billing be default on each channel",
            name: 'billing',
            required: false,
            type: ApplicationCommandOptionType.Boolean
        })
        billingEnabled: boolean,

        ctx: CommandInteraction,
    ): Promise<void> {
            await ctx.deferReply();

            if (!ctx.guild) return;

            const newCat = await ctx.guild?.channels.create({ name, type: ChannelType.GuildCategory, reason: "Sparkles RP Managment | SC.UR.CTGRY.CRT" });
            if (!newCat) {await ctx.editReply({ content: "There was an error while creating the roleplay. Please try again." }); Logger.warn('error while creating category'); return;}

            const prisma = new PrismaClient();
            async function createNewRoleplay(roleplayName: string, roleplayId: string, roleplayAdmin: string, guildId: string) {
                await prisma.roleplayMetadata.create({
                    data: {
                        roleplayName,
                        roleplayAdmin,
                        roleplayId,
                        guildId
                    }
                });
            }
            
            createNewRoleplay(name, newCat.id, adminUser.id, ctx.guild.id)
                .then(async () => {})
                .catch(async (e) => {
                    Logger.error(e)
                    await prisma.$disconnect()
                    return;
                })

            const RPChannel = await ctx.guild?.channels.create({ name: "info", type: ChannelType.GuildText, parent: newCat.id, reason: 'Sparkles RP Managment | SC.UR.CHNL.CRT' });
            if (!RPChannel) return;

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
            
            createNewRPChannel("info", RPChannel.id, newCat.id, "lore")
                .then(async () => {
                    await prisma.$disconnect()
                })
                .catch(async (e) => {
                    Logger.error(e)
                    await prisma.$disconnect()
                    return;
                })

            const NewEmbed = new EmbedBuilder()
                .setTitle(`Roleplay Created: <#${newCat.id}>`)
                .setDescription(`Your new roleplay has successfully been created. To help you get started, a channel (<#${RPChannel.id}>) has been added and some additional info will be sent shortly.\n\nTo remove this channel, run the command </channels remove:1206591256332079186> and select the info channel just created.\nTo add a channel, run the slash command </channels create:1206591256332079186> and specify the parameters.\n\nMore info on channel managment can be found in <#${RPChannel.id}>.\n\nHave fun!`)

            await ctx.editReply({
                embeds: [NewEmbed]
            })

            const InfoEmbed1 = new EmbedBuilder()
                .setTitle('Channel Managment')
                .addFields([
                    { name: 'Add Channels', value: '`/channels create name: <Name of the new channel> type: <Type of channel to be added> roleplay: <The CATEGORY of the roleplay to be added to>`' },
                    { name: 'Remove Channels', value: '`/channels remove channel: <Channel to be removed>`\n*Note: This does not cause message backups to be deleted. But this does start the 2 year non-activity waiting period.*' }
                ])

            const InfoEmbed2 = new EmbedBuilder()
                .setTitle("Roleplay Managment")
                .addFields([
                    { name: 'Remove a Roleplay', value: '`/roleplays remove name: <Category of the roleplay to be removed>`\n*Note: This does not cause message backups to be deleted. But this does start the 2 year non-activity waiting period.*' }
                ])

            await RPChannel.send({ embeds: [InfoEmbed1, InfoEmbed2] })
        };
    }

    // @Slash({ description: "Removes a channel from an existing roleplay", name: "remove_channel" })
    // @SlashGroup("manage_channel")
    // removeChannel(
    //     @SlashOption({
    //         description: "Channel to be removed",
    //         name: "channel",
    //         required: true,
    //         type: ApplicationCommandOptionType.Channel
    //     })
    //     channel: GuildChannel | Channel,
    //     ctx: CommandInteraction
    // ): void {
    //     ctx.reply(`${channel}`)
    // }
