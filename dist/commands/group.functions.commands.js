import { downloadMediaMessage } from "baileys";
import * as waUtil from "../utils/whatsapp.util.js";
import { buildText, messageErrorCommandUsage, removeFormatting } from "../utils/general.util.js";
import { UserController } from "../controllers/user.controller.js";
import { GroupController } from "../controllers/group.controller.js";
import groupCommands from "./group.list.commands.js";
import botTexts from "../helpers/bot.texts.helper.js";
import { commandExist, getCommandsByCategory } from "../utils/commands.util.js";
export async function grupoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const currentParticipants = await groupController.getParticipants(group.id);
    const currentAdmins = await groupController.getAdmins(group.id);
    let replyText = buildText(groupCommands.grupo.msgs.reply_title, group.name, currentParticipants.length, currentAdmins.length, group.description || '---', group.commands_executed);
    if (message.isGroupAdmin) {
        replyText += groupCommands.grupo.msgs.reply_resource_title;
        //Bem-vindo
        replyText += (group.welcome.status) ? groupCommands.grupo.msgs.reply_item_welcome_on : groupCommands.grupo.msgs.reply_item_welcome_off;
        //Mutar
        replyText += (group.muted) ? groupCommands.grupo.msgs.reply_item_mute_on : groupCommands.grupo.msgs.reply_item_mute_off;
        //Auto-Sticker
        replyText += (group.autosticker) ? groupCommands.grupo.msgs.reply_item_autosticker_on : groupCommands.grupo.msgs.reply_item_autosticker_off;
        //Anti-Link
        replyText += (group.antilink.status) ? buildText(groupCommands.grupo.msgs.reply_item_antilink_on, group.antilink.exceptions.toString() || '---') : groupCommands.grupo.msgs.reply_item_antilink_off;
        //Anti-Fake
        replyText += (group.antifake.status) ? buildText(groupCommands.grupo.msgs.reply_item_antifake_on, group.antifake.exceptions.prefixes.toString(), group.antifake.exceptions.numbers.toString() || '---') : groupCommands.grupo.msgs.reply_item_antifake_off;
        //Anti-Flood
        replyText += (group.antiflood.status) ? buildText(groupCommands.grupo.msgs.reply_item_antiflood_on, group.antiflood.max_messages, group.antiflood.interval) : groupCommands.grupo.msgs.reply_item_antiflood_off;
        //Resposta automática
        replyText += (group.auto_reply.status) ? buildText(groupCommands.grupo.msgs.reply_item_autoreply_on) : groupCommands.grupo.msgs.reply_item_autoreply_off;
        //Bloqueio de CMDS
        replyText += (group.block_cmds.length) ? buildText(groupCommands.grupo.msgs.reply_item_blockcmds_on, group.block_cmds.map(command => botInfo.prefix + command).toString()) : groupCommands.grupo.msgs.reply_item_blockcmds_off;
        //Filtro de palavras
        replyText += (group.word_filter.length) ? buildText(groupCommands.grupo.msgs.reply_item_filter_on, group.word_filter.toString()) : groupCommands.grupo.msgs.reply_item_filter_off;
        //Lista Negra
        replyText += buildText(groupCommands.grupo.msgs.reply_item_blacklist, group.blacklist.length);
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function avisoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    let targetUserId;
    let replyText;
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    if (message.mentioned.length) {
        targetUserId = message.mentioned[0];
    }
    else if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage.sender;
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const isBotTarget = botInfo.host_number == targetUserId;
    const isAdminTarget = await groupController.isParticipantAdmin(group.id, targetUserId);
    if (isBotTarget) {
        throw new Error(groupCommands.aviso.msgs.error_warning_bot);
    }
    else if (isAdminTarget) {
        throw new Error(groupCommands.aviso.msgs.error_warning_admin);
    }
    await groupController.addParticipantWarning(group.id, targetUserId);
    const participant = await groupController.getParticipant(group.id, targetUserId);
    if (!participant) {
        throw new Error(groupCommands.aviso.msgs.error_not_registered);
    }
    if (participant.warnings < 3) {
        replyText = buildText(groupCommands.aviso.msgs.reply, waUtil.removeWhatsappSuffix(targetUserId), participant.warnings);
        await waUtil.sendTextWithMentions(client, message.chat_id, replyText, [targetUserId], { expiration: message.expiration });
    }
    else {
        replyText = buildText(groupCommands.aviso.msgs.reply_max_warning, waUtil.removeWhatsappSuffix(targetUserId));
        await waUtil.sendTextWithMentions(client, message.chat_id, replyText, [targetUserId], { expiration: message.expiration });
        await groupController.setBlacklist(group.id, targetUserId, 'add');
        await waUtil.removeParticipant(client, group.id, targetUserId);
    }
}
export async function rmavisoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    let targetUserId;
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    if (message.mentioned.length) {
        targetUserId = message.mentioned[0];
    }
    else if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage.sender;
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const participant = await groupController.getParticipant(group.id, targetUserId);
    if (!participant) {
        throw new Error(groupCommands.rmaviso.msgs.error_not_registered);
    }
    else if (participant.warnings < 1) {
        throw new Error(groupCommands.rmaviso.msgs.error_no_warning);
    }
    else {
        const currentWarnings = participant.warnings;
        const newWarningCount = participant.warnings - 1;
        await groupController.removeParticipantWarning(group.id, targetUserId, currentWarnings);
        const replyText = buildText(groupCommands.rmaviso.msgs.reply, waUtil.removeWhatsappSuffix(targetUserId), newWarningCount);
        await waUtil.replyWithMentions(client, message.chat_id, replyText, [targetUserId], message.wa_message, { expiration: message.expiration });
    }
}
export async function zeraravisosCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    await groupController.removeParticipantsWarnings(group.id);
    const replyText = groupCommands.zeraravisos.msgs.reply;
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addfiltrosCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let replyText = groupCommands.addfiltros.msgs.reply_title;
    for (let word of message.args) {
        if (group.word_filter.includes(word.toLowerCase())) {
            replyText += buildText(groupCommands.addfiltros.msgs.reply_item_error, word);
        }
        else {
            await groupController.setWordFilter(group.id, word.toLowerCase(), 'add');
            replyText += buildText(groupCommands.addfiltros.msgs.reply_item_success, word);
        }
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function rmfiltrosCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let replyText = groupCommands.rmfiltros.msgs.reply_title;
    for (let word of message.args) {
        if (!group.word_filter.includes(word.toLowerCase())) {
            replyText += buildText(groupCommands.rmfiltros.msgs.reply_item_error, word);
        }
        else {
            await groupController.setWordFilter(group.id, word.toLowerCase(), 'remove');
            replyText += buildText(groupCommands.rmfiltros.msgs.reply_item_success, word);
        }
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function fotogrupoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (message.type != 'imageMessage' && message.quotedMessage?.type != 'imageMessage') {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let imageBuffer;
    if (message.isQuoted && message.quotedMessage) {
        imageBuffer = await downloadMediaMessage(message.quotedMessage?.wa_message, "buffer", {});
    }
    else {
        imageBuffer = await downloadMediaMessage(message.wa_message, "buffer", {});
    }
    await waUtil.updateProfilePic(client, group.id, imageBuffer);
    await waUtil.replyText(client, group.id, groupCommands.fotogrupo.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function addlistaCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    let targetUserId;
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage?.sender;
    }
    else if (message.mentioned.length) {
        targetUserId = message.mentioned[0];
    }
    else if (message.args.length) {
        targetUserId = waUtil.addWhatsappSuffix(message.text_command);
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    if (targetUserId == botInfo.host_number) {
        throw new Error(groupCommands.addlista.msgs.error_add_bot);
    }
    else if (await groupController.isParticipantAdmin(group.id, targetUserId)) {
        throw new Error(groupCommands.addlista.msgs.error_add_admin);
    }
    const currentBlacklist = group.blacklist;
    if (currentBlacklist.includes(targetUserId)) {
        throw new Error(groupCommands.addlista.msgs.error_already_listed);
    }
    await groupController.setBlacklist(group.id, targetUserId, 'add');
    await waUtil.replyText(client, message.chat_id, groupCommands.addlista.msgs.reply, message.wa_message, { expiration: message.expiration });
    if (await groupController.isParticipant(group.id, targetUserId)) {
        await waUtil.removeParticipant(client, group.id, targetUserId);
    }
}
export async function rmlistaCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    let targetUserId;
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const currentBlacklist = group.blacklist;
    if (message.args.length == 1 && message.args[0].length <= 3) {
        targetUserId = currentBlacklist[parseInt(message.text_command) - 1];
    }
    else {
        targetUserId = waUtil.addWhatsappSuffix(message.text_command);
    }
    if (!currentBlacklist.includes(targetUserId)) {
        throw new Error(groupCommands.rmlista.msgs.error_not_listed);
    }
    await groupController.setBlacklist(group.id, targetUserId, 'remove');
    await waUtil.replyText(client, message.chat_id, groupCommands.rmlista.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function listanegraCommand(client, botInfo, message, group) {
    const userController = new UserController();
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    const currentBlacklist = group.blacklist;
    let replyText = buildText(groupCommands.listanegra.msgs.reply_title, currentBlacklist.length);
    if (!currentBlacklist.length) {
        throw new Error(groupCommands.listanegra.msgs.error_empty_list);
    }
    for (let userId of currentBlacklist) {
        const userData = await userController.getUser(userId);
        const userNumberList = currentBlacklist.indexOf(userId) + 1;
        replyText += buildText(groupCommands.listanegra.msgs.reply_item, userNumberList, userData?.name || '---', waUtil.removeWhatsappSuffix(userId));
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let userId = waUtil.addWhatsappSuffix(message.text_command.trim());
    if (!Number(waUtil.removeWhatsappSuffix(userId))) {
        throw new Error(groupCommands.add.msgs.error_input);
    }
    let addResponse = await waUtil.addParticipant(client, group.id, userId).catch((err) => {
        throw new Error(buildText(groupCommands.add.msgs.error_invalid_number, waUtil.removeWhatsappSuffix(userId)));
    });
    if (addResponse.status != "200") {
        throw new Error(buildText(groupCommands.add.msgs.error_add, waUtil.removeWhatsappSuffix(userId)));
    }
    const replyText = buildText(groupCommands.add.msgs.reply, waUtil.removeWhatsappSuffix(userId));
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function banCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    let targetUsers = [];
    if (!message.mentioned.length && message.isQuoted && message.quotedMessage) {
        targetUsers.push(message.quotedMessage?.sender);
    }
    else if (message.mentioned.length) {
        targetUsers = message.mentioned;
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let replyText = groupCommands.ban.msgs.reply_title;
    for (let userId of targetUsers) {
        if (await groupController.isParticipant(group.id, userId)) {
            if (!await groupController.isParticipantAdmin(group.id, userId)) {
                await waUtil.removeParticipant(client, group.id, userId);
                replyText += buildText(groupCommands.ban.msgs.reply_item_success, waUtil.removeWhatsappSuffix(userId));
            }
            else {
                replyText += buildText(groupCommands.ban.msgs.reply_item_ban_admin, waUtil.removeWhatsappSuffix(userId));
            }
        }
        else {
            replyText += buildText(groupCommands.ban.msgs.reply_item_not_found, waUtil.removeWhatsappSuffix(userId));
        }
    }
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function promoverCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    let targetUsers = [];
    let replyText = groupCommands.promover.msgs.reply_title;
    if (message.mentioned.length) {
        targetUsers = message.mentioned;
    }
    else if (message.isQuoted && message.quotedMessage) {
        targetUsers.push(message.quotedMessage.sender);
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    for (let userId of targetUsers) {
        if (!await groupController.isParticipantAdmin(group.id, userId)) {
            await waUtil.promoteParticipant(client, group.id, userId);
            replyText += buildText(groupCommands.promover.msgs.reply_item_success, waUtil.removeWhatsappSuffix(userId));
        }
        else {
            replyText += buildText(groupCommands.promover.msgs.reply_item_error, waUtil.removeWhatsappSuffix(userId));
        }
    }
    await waUtil.replyWithMentions(client, group.id, replyText, targetUsers, message.wa_message, { expiration: message.expiration });
}
export async function rebaixarCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    let targetUsers = [];
    let replyText = groupCommands.rebaixar.msgs.reply_title;
    if (message.mentioned.length > 0) {
        targetUsers = message.mentioned;
    }
    else if (message.isQuoted && message.quotedMessage) {
        targetUsers.push(message.quotedMessage.sender);
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    for (let userId of targetUsers) {
        if (userId == botInfo.host_number || userId == group.owner) {
            replyText += buildText(groupCommands.rebaixar.msgs.reply_item_error, waUtil.removeWhatsappSuffix(userId));
        }
        else if (await groupController.isParticipantAdmin(group.id, userId)) {
            replyText += buildText(groupCommands.rebaixar.msgs.reply_item_success, waUtil.removeWhatsappSuffix(userId));
            await waUtil.demoteParticipant(client, group.id, userId);
        }
        else {
            replyText += buildText(groupCommands.rebaixar.msgs.reply_item_error_is_member, waUtil.removeWhatsappSuffix(userId));
        }
    }
    await waUtil.replyWithMentions(client, message.chat_id, replyText, targetUsers, message.wa_message, { expiration: message.expiration });
}
export async function mtCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    let replyMention;
    if (message.args.length) {
        replyMention = buildText(groupCommands.mt.msgs.reply_with_message, currentParticipantsIds.length, message.text_command);
    }
    else {
        replyMention = buildText(groupCommands.mt.msgs.reply, currentParticipantsIds.length);
    }
    await waUtil.replyWithMentions(client, message.chat_id, replyMention, currentParticipantsIds, message.wa_message, { expiration: message.expiration });
}
export async function mmCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    let replyText;
    if (!message.isGroupAdmin)
        throw new Error(botTexts.permission.admin_group_only);
    const currentParticipants = await groupController.getParticipants(group.id);
    const participantsNotAdmins = currentParticipants.filter(participant => participant.admin == false).map(participant => participant.user_id);
    if (!participantsNotAdmins.length) {
        throw new Error(groupCommands.mm.msgs.error_no_members);
    }
    if (message.args.length) {
        replyText = buildText(groupCommands.mm.msgs.reply_with_message, participantsNotAdmins.length, message.text_command);
    }
    else {
        replyText = buildText(groupCommands.mm.msgs.reply, participantsNotAdmins.length);
    }
    await waUtil.replyWithMentions(client, message.chat_id, replyText, participantsNotAdmins, message.wa_message, { expiration: message.expiration });
}
export async function admsCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const adminsIds = await groupController.getAdminsIds(group.id);
    let replyText;
    if (message.args.length) {
        replyText = buildText(groupCommands.adms.msgs.reply_with_message, adminsIds.length, message.text_command);
    }
    else {
        replyText = buildText(groupCommands.adms.msgs.reply, adminsIds.length);
    }
    const messageToReply = (message.isQuoted && message.quotedMessage) ? message.quotedMessage.wa_message : message.wa_message;
    await waUtil.replyWithMentions(client, message.chat_id, replyText, adminsIds, messageToReply, { expiration: message.expiration });
}
export async function donoCommand(client, botInfo, message, group) {
    if (!group.owner) {
        throw new Error(groupCommands.dono.msgs.error);
    }
    const replyText = buildText(groupCommands.dono.msgs.reply, waUtil.removeWhatsappSuffix(group.owner));
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function mutarCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    let replyText = group.muted ? groupCommands.mutar.msgs.reply_off : groupCommands.mutar.msgs.reply_on;
    await groupController.setMuted(group.id, !group.muted);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function linkCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    let inviteLink = await waUtil.getGroupInviteLink(client, group.id);
    const replyText = buildText(groupCommands.link.msgs.reply, group.name, inviteLink);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function rlinkCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    await waUtil.revokeGroupInvite(client, group.id).catch(() => {
        throw new Error(groupCommands.rlink.msgs.error);
    });
    const replyText = groupCommands.rlink.msgs.reply;
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function restritoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    await waUtil.updateGroupRestriction(client, group.id, !group.restricted);
    const replyText = (group.restricted) ? groupCommands.restrito.msgs.reply_off : groupCommands.restrito.msgs.reply_on;
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function autorespCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    const replyText = group.auto_reply.status ? groupCommands.autoresp.msgs.reply_off : groupCommands.autoresp.msgs.reply_on;
    await groupController.setAutoReply(group.id, !group.auto_reply.status);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function respostasCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    if (!group.auto_reply.config.length)
        throw new Error(buildText(groupCommands.respostas.msgs.error_empty));
    let replyText = groupCommands.respostas.msgs.reply_title;
    group.auto_reply.config.forEach(config => {
        replyText += buildText(groupCommands.respostas.msgs.reply_item, config.word, config.reply);
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addrespCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (message.args.length < 2) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let word = removeFormatting(message.args[0]).toLowerCase().trim();
    let reply = message.args.slice(1).join(" ");
    const wordRegistered = group.auto_reply.config.find(config => config.word == word) ? true : false;
    if (wordRegistered) {
        throw new Error(buildText(groupCommands.addresp.msgs.error_already_added, word));
    }
    else {
        await groupController.setReplyConfig(group.id, word, reply.trim(), 'add');
        const replyText = buildText(groupCommands.addresp.msgs.reply_added, word, reply.trim());
        await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
    }
}
export async function rmrespCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const words = message.args.map(word => removeFormatting(word).toLowerCase().trim());
    let replyText = groupCommands.rmresp.msgs.reply_title;
    words.forEach(async (word) => {
        const wordRegistered = group.auto_reply.config.find(config => config.word == word);
        if (wordRegistered) {
            replyText += buildText(groupCommands.rmresp.msgs.reply_item_success, word);
            await groupController.setReplyConfig(group.id, wordRegistered.word, wordRegistered.reply, 'remove');
        }
        else {
            replyText += buildText(groupCommands.rmresp.msgs.reply_item_error, word);
        }
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function antilinkCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    const replyText = group.antilink.status ? groupCommands.antilink.msgs.reply_off : groupCommands.antilink.msgs.reply_on;
    await groupController.setAntiLink(group.id, !group.antilink.status);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addexlinkCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let replyText = groupCommands.addexlink.msgs.reply_title;
    message.args.forEach(async (exception) => {
        exception = exception.trim();
        if (!group.antilink.exceptions.includes(exception)) {
            replyText += buildText(groupCommands.addexlink.msgs.reply_item_added, exception);
            await groupController.setLinkException(group.id, exception, 'add');
        }
        else {
            replyText += buildText(groupCommands.addexlink.msgs.reply_item_already_added, exception);
        }
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function rmexlinkCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let replyText = groupCommands.rmexlink.msgs.reply_title;
    message.args.forEach(async (exception) => {
        exception = exception.trim();
        if (group.antilink.exceptions.includes(exception)) {
            replyText += buildText(groupCommands.rmexlink.msgs.reply_item_removed, exception);
            await groupController.setLinkException(group.id, exception, 'remove');
        }
        else {
            replyText += buildText(groupCommands.rmexlink.msgs.reply_item_not_exist, exception);
        }
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function autostickerCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    const replyText = group.autosticker ? groupCommands.autosticker.msgs.reply_off : groupCommands.autosticker.msgs.reply_on;
    await groupController.setAutoSticker(group.id, !group.autosticker);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function bemvindoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    const replyText = group.welcome.status ? groupCommands.bemvindo.msgs.reply_off : groupCommands.bemvindo.msgs.reply_on;
    await groupController.setWelcome(group.id, !group.welcome.status, message.text_command || undefined);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function antifakeCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    const replyText = group.antifake.status ? groupCommands.antifake.msgs.reply_off : groupCommands.antifake.msgs.reply_on;
    await groupController.setAntiFake(group.id, !group.antifake.status);
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addexfakeCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const exceptions = message.text_command.split(',').filter(exception => exception.trim() != '');
    if (!exceptions.length)
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    let replyText = groupCommands.addexfake.msgs.reply_title;
    exceptions.forEach(async (exception) => {
        exception = exception.replace(/\W+/g, "");
        if (exception.length <= 3) {
            if (group.antifake.exceptions.prefixes.includes(exception)) {
                replyText += buildText(groupCommands.addexfake.msgs.reply_prefix_already_added, exception);
            }
            else {
                replyText += buildText(groupCommands.addexfake.msgs.reply_item_added_prefix, exception);
                await groupController.setFakePrefixException(group.id, exception, 'add');
            }
        }
        else {
            if (group.antifake.exceptions.numbers.includes(exception)) {
                replyText += buildText(groupCommands.addexfake.msgs.reply_number_already_added, exception);
            }
            else {
                replyText += buildText(groupCommands.addexfake.msgs.reply_item_added_number, exception);
                await groupController.setFakeNumberException(group.id, exception, 'add');
            }
        }
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function rmexfakeCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const exceptions = message.text_command.split(',');
    if (!exceptions.length)
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    let replyText = groupCommands.rmexfake.msgs.reply_title;
    exceptions.forEach(async (exception) => {
        exception = exception.replace(/\W+/g, "");
        if (exception == '55') {
            replyText += groupCommands.rmexfake.msgs.reply_not_removable;
        }
        else if (exception.length <= 3) {
            if (!group.antifake.exceptions.prefixes.includes(exception)) {
                replyText += buildText(groupCommands.rmexfake.msgs.reply_prefix_not_exist, exception);
            }
            else {
                replyText += buildText(groupCommands.rmexfake.msgs.reply_item_removed_prefix, exception);
                await groupController.setFakePrefixException(group.id, exception, 'remove');
            }
        }
        else {
            if (!group.antifake.exceptions.numbers.includes(exception)) {
                replyText += buildText(groupCommands.rmexfake.msgs.reply_number_not_exist, exception);
            }
            else {
                replyText += buildText(groupCommands.rmexfake.msgs.reply_item_removed_number, exception);
                await groupController.setFakeNumberException(group.id, exception, 'remove');
            }
        }
    });
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function antifloodCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    let interval = '10';
    let maxMessage = '10';
    if (message.args.length == 2) {
        [maxMessage, interval] = message.args;
    }
    else if (message.args.length == 1) {
        [maxMessage] = message.args;
    }
    if (!Number(interval) || Number(interval) < 10 || Number(interval) > 60) {
        throw new Error(groupCommands.antiflood.msgs.error_value_interval);
    }
    if (!Number(maxMessage) || Number(maxMessage) < 5 || Number(maxMessage) > 20) {
        throw new Error(groupCommands.antiflood.msgs.error_value_message);
    }
    const replyText = group.antiflood.status ? groupCommands.antiflood.msgs.reply_off : buildText(groupCommands.antiflood.msgs.reply_on, maxMessage, interval);
    await groupController.setAntiFlood(group.id, !group.antiflood.status, Number(maxMessage), Number(interval));
    await waUtil.replyText(client, group.id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function apgCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!isBotGroupAdmin) {
        throw new Error(botTexts.permission.bot_group_admin);
    }
    else if (!message.isQuoted || !message.quotedMessage) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    await waUtil.deleteMessage(client, message.wa_message, true);
}
export async function topativosCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    let qtyRanking = 10;
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    if (Number(message.text_command)) {
        qtyRanking = Number(message.text_command);
    }
    if (qtyRanking < 1 || qtyRanking > 50) {
        throw new Error(groupCommands.topativos.msgs.error_value_limit);
    }
    const usersRanking = await groupController.getParticipantsActivityRanking(group, qtyRanking);
    let mentionedUsers = [];
    let replyText = buildText(groupCommands.topativos.msgs.reply_title, qtyRanking);
    for (let i = 0; i < usersRanking.length; i++) {
        let icon;
        let positionRanking = i + 1;
        switch (positionRanking) {
            case 1:
                icon = '🥇';
                break;
            case 2:
                icon = '🥈';
                break;
            case 3:
                icon = '🥉';
                break;
            default:
                icon = '';
        }
        replyText += buildText(groupCommands.topativos.msgs.reply_item, icon, positionRanking, waUtil.removeWhatsappSuffix(usersRanking[i].user_id), usersRanking[i].msgs);
        mentionedUsers.push(usersRanking[i].user_id);
    }
    await waUtil.replyWithMentions(client, message.chat_id, replyText, mentionedUsers, message.wa_message, { expiration: message.expiration });
}
export async function membroCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const userController = new UserController();
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    let targetUserId;
    if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage.sender;
    }
    else if (message.mentioned.length === 1) {
        targetUserId = message.mentioned[0];
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let participant = await groupController.getParticipant(group.id, targetUserId);
    if (!participant) {
        throw new Error(groupCommands.membro.msgs.error_not_member);
    }
    const userData = await userController.getUser(targetUserId);
    const replyText = buildText(groupCommands.membro.msgs.reply, userData?.name || '---', waUtil.removeWhatsappSuffix(targetUserId), participant.warnings, participant.registered_since, participant.commands, participant.msgs, participant.text, participant.image, participant.video, participant.sticker, participant.audio, participant.other);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function inativosCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const qtyMessage = Number(message.text_command);
    if (!qtyMessage) {
        throw new Error(groupCommands.inativos.msgs.error_value_invalid);
    }
    else if (qtyMessage < 1) {
        throw new Error(groupCommands.inativos.msgs.error_value_limit);
    }
    const inactiveUsers = await groupController.getParticipantsActivityLowerThan(group, qtyMessage);
    const inactiveUsersIds = inactiveUsers.map(user => user.user_id);
    if (!inactiveUsers.length) {
        throw new Error(groupCommands.inativos.msgs.error_no_inactives);
    }
    let replyText = buildText(groupCommands.inativos.msgs.reply_title, inactiveUsers.length, qtyMessage);
    for (let user of inactiveUsers) {
        replyText += buildText(groupCommands.inativos.msgs.reply_item, waUtil.removeWhatsappSuffix(user.user_id), user.msgs);
    }
    await waUtil.replyWithMentions(client, group.id, replyText, inactiveUsersIds, message.wa_message, { expiration: message.expiration });
}
export async function bcmdCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const { prefix } = botInfo;
    let commands = message.args;
    let validCommands = [];
    let blockResponse = groupCommands.bcmd.msgs.reply_title;
    const categories = ['sticker', 'utility', 'download', 'misc'];
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    if (commands[0] == 'variado') {
        commands[0] = 'misc';
    }
    else if (commands[0] == 'utilidade') {
        commands[0] = 'utility';
    }
    if (categories.includes(commands[0])) {
        commands = getCommandsByCategory(prefix, commands[0]);
    }
    for (let command of commands) {
        if (commandExist(prefix, command, 'utility') || commandExist(prefix, command, 'misc') || commandExist(prefix, command, 'sticker') || commandExist(prefix, command, 'download')) {
            if (group.block_cmds.includes(waUtil.removePrefix(prefix, command))) {
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_already_blocked, command);
            }
            else {
                validCommands.push(command);
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_blocked, command);
            }
        }
        else if (commandExist(prefix, command, 'group') || commandExist(prefix, command, 'admin') || commandExist(prefix, command, 'info')) {
            blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_error, command);
        }
        else {
            blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_not_exist, command);
        }
    }
    await groupController.setBlockedCommands(group.id, prefix, validCommands, 'add');
    await waUtil.replyText(client, message.chat_id, blockResponse, message.wa_message, { expiration: message.expiration });
}
export async function dcmdCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const { prefix } = botInfo;
    let commands = message.args;
    let validCommands = [];
    let unblockResponse = groupCommands.dcmd.msgs.reply_title;
    let categories = ['all', 'sticker', 'utility', 'download', 'misc'];
    if (!message.isGroupAdmin) {
        throw new Error(botTexts.permission.admin_group_only);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    if (commands[0] == 'todos') {
        commands[0] = 'all';
    }
    else if (commands[0] == 'utilidade') {
        commands[0] = 'utility';
    }
    else if (commands[0] == 'variado') {
        commands[0] = 'misc';
    }
    if (categories.includes(commands[0])) {
        if (commands[0] === 'all') {
            commands = group.block_cmds.map(command => prefix + command);
        }
        else {
            commands = getCommandsByCategory(prefix, commands[0]);
        }
    }
    for (let command of commands) {
        if (group.block_cmds.includes(waUtil.removePrefix(prefix, command))) {
            validCommands.push(command);
            unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_unblocked, command);
        }
        else {
            unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_not_blocked, command);
        }
    }
    await groupController.setBlockedCommands(group.id, prefix, validCommands, 'remove');
    await waUtil.replyText(client, message.chat_id, unblockResponse, message.wa_message, { expiration: message.expiration });
}
