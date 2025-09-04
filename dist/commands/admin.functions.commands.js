import { downloadMediaMessage } from "baileys";
import { buildText, messageErrorCommandUsage, timestampToDate } from "../utils/general.util.js";
import { UserController } from "../controllers/user.controller.js";
import { GroupController } from "../controllers/group.controller.js";
import { BotController } from "../controllers/bot.controller.js";
import { adminMenu } from "../helpers/menu.builder.helper.js";
import os from 'node:os';
import moment from "moment";
import * as waUtil from "../utils/whatsapp.util.js";
import botTexts from "../helpers/bot.texts.helper.js";
import adminCommands from "./admin.list.commands.js";
import { commandExist, getCommandsByCategory } from "../utils/commands.util.js";
export async function adminCommand(client, botInfo, message, group) {
    await waUtil.replyText(client, message.chat_id, adminMenu(botInfo), message.wa_message, { expiration: message.expiration });
}
export async function sairCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let currentGroups = await groupController.getAllGroups();
    let chosenGroupNumber = Number(message.text_command);
    const indexGroup = chosenGroupNumber - 1;
    if (!chosenGroupNumber || !currentGroups[indexGroup]) {
        throw new Error(adminCommands.sair.msgs.error);
    }
    const replyText = buildText(adminCommands.sair.msgs.reply, currentGroups[indexGroup].name, chosenGroupNumber);
    await waUtil.leaveGroup(client, currentGroups[indexGroup].id);
    if (message.isGroupMsg && currentGroups[indexGroup].id == message.chat_id) {
        await waUtil.sendText(client, message.sender, replyText);
    }
    else {
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
    }
}
export async function gruposCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const currentGroups = await groupController.getAllGroups();
    let replyText = buildText(adminCommands.grupos.msgs.reply_title, currentGroups.length);
    if (!currentGroups.length) {
        throw new Error(adminCommands.grupos.msgs.error);
    }
    for (let group of currentGroups) {
        const groupNumber = currentGroups.indexOf(group) + 1;
        const adminsGroup = await groupController.getAdmins(group.id);
        const participantsGroup = await groupController.getParticipants(group.id);
        const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
        const linkGroupCommand = isBotGroupAdmin ? `${botInfo.prefix}linkgrupo ${groupNumber}` : '----';
        replyText += buildText(adminCommands.grupos.msgs.reply_item, groupNumber, group.name, participantsGroup.length, adminsGroup.length, isBotGroupAdmin ? "Sim" : "Não", linkGroupCommand, groupNumber);
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function sairgruposCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const currentGroups = await groupController.getAllGroups();
    const replyText = buildText(adminCommands.sairgrupos.msgs.reply, currentGroups.length);
    currentGroups.forEach(async (group) => {
        await waUtil.leaveGroup(client, group.id);
    });
    if (message.isGroupMsg) {
        await waUtil.sendText(client, message.sender, replyText);
    }
    else {
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
    }
}
export async function linkgrupoCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let currentGroups = await groupController.getAllGroups();
    let chosenGroupNumber = Number(message.text_command);
    const indexGroup = chosenGroupNumber - 1;
    if (!chosenGroupNumber || !currentGroups[indexGroup]) {
        throw new Error(adminCommands.linkgrupo.msgs.error_not_found);
    }
    else if (!await groupController.isParticipantAdmin(currentGroups[indexGroup].id, botInfo.host_number)) {
        throw new Error(adminCommands.linkgrupo.msgs.error_bot_not_admin);
    }
    const inviteLink = await waUtil.getGroupInviteLink(client, currentGroups[indexGroup].id);
    const replyTextAdmin = buildText(adminCommands.linkgrupo.msgs.reply_admin, currentGroups[indexGroup].name, chosenGroupNumber, inviteLink);
    if (message.isGroupMsg) {
        const replyText = adminCommands.linkgrupo.msgs.reply_group;
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        await waUtil.sendText(client, message.sender, replyTextAdmin);
    }
    else {
        await waUtil.replyText(client, message.chat_id, replyTextAdmin, message.wa_message, { expiration: message.expiration });
    }
}
export async function adminsCommand(client, botInfo, message, group) {
    const userController = new UserController();
    if (!message.isBotOwner) {
        throw new Error(botTexts.permission.owner_bot_only);
    }
    const adminsBot = await userController.getAdmins();
    let replyText = buildText(adminCommands.admins.msgs.reply_title, adminsBot.length);
    adminsBot.forEach((admin) => {
        const adminNumberList = adminsBot.indexOf(admin) + 1;
        const userType = admin.owner ? botTexts.user_types.owner : (admin.admin ? botTexts.user_types.admin : botTexts.user_types.user);
        replyText += buildText(adminCommands.admins.msgs.reply_item, adminNumberList, admin.name, waUtil.removeWhatsappSuffix(admin.id), userType);
    });
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function addadminCommand(client, botInfo, message, group) {
    const userController = new UserController();
    if (!message.isBotOwner) {
        throw new Error(botTexts.permission.owner_bot_only);
    }
    const currentAdmins = await userController.getAdmins();
    const currentAdminsId = currentAdmins.map(user => user.id);
    let targetUserId;
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
    const userData = await userController.getUser(targetUserId);
    if (!userData) {
        throw new Error(adminCommands.addadmin.msgs.error_user_not_found);
    }
    else if (currentAdminsId.includes(userData.id)) {
        throw new Error(adminCommands.addadmin.msgs.error_already_admin);
    }
    await userController.promoteUser(userData.id);
    const replyText = buildText(adminCommands.addadmin.msgs.reply, waUtil.removeWhatsappSuffix(userData.id), userData.name);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function rmadminCommand(client, botInfo, message, group) {
    const userController = new UserController();
    if (!message.isBotOwner) {
        throw new Error(botTexts.permission.owner_bot_only);
    }
    const currentAdmins = await userController.getAdmins();
    const ownerData = await userController.getOwner();
    const currentAdminsId = currentAdmins.map(user => user.id);
    let targetUserId;
    if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage?.sender;
    }
    else if (message.mentioned.length) {
        targetUserId = message.mentioned[0];
    }
    else if (message.args.length == 1 && message.args[0].length <= 3) {
        targetUserId = currentAdmins[parseInt(message.text_command) - 1].id;
    }
    else if (message.args.length) {
        targetUserId = waUtil.addWhatsappSuffix(message.text_command);
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const userData = await userController.getUser(targetUserId);
    if (!userData) {
        throw new Error(adminCommands.rmadmin.msgs.error_user_not_found);
    }
    else if (!currentAdminsId.includes(userData.id)) {
        throw new Error(adminCommands.rmadmin.msgs.error_not_admin);
    }
    else if (ownerData?.id == userData.id) {
        throw new Error(adminCommands.rmadmin.msgs.error_demote_owner);
    }
    await userController.demoteUser(userData.id);
    const replyText = buildText(adminCommands.addadmin.msgs.reply, waUtil.removeWhatsappSuffix(userData.id), userData.name);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function comandospvCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const replyText = botInfo.commands_pv ? adminCommands.comandospv.msgs.reply_off : adminCommands.comandospv.msgs.reply_on;
    botController.setCommandsPv(!botInfo.commands_pv);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function modoadminCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const replyText = botInfo.admin_mode ? adminCommands.modoadmin.msgs.reply_off : adminCommands.modoadmin.msgs.reply_on;
    botController.setAdminMode(!botInfo.admin_mode);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function taxacomandosCommand(client, botInfo, message, group) {
    const botController = new BotController();
    let replyText;
    if (!botInfo.command_rate.status) {
        if (!message.args.length) {
            throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
        }
        let max_commands_minute = Number(message.args[0]);
        let block_time = Number(message.args[1]);
        if (!block_time) {
            block_time = 60;
        }
        else if (block_time < 10) {
            throw new Error(adminCommands.taxacomandos.msgs.error_block_time_invalid);
        }
        else if (!max_commands_minute || max_commands_minute < 3) {
            throw new Error(adminCommands.taxacomandos.msgs.error_max_commands_invalid);
        }
        replyText = buildText(adminCommands.taxacomandos.msgs.reply_on, max_commands_minute, block_time);
        await botController.setCommandRate(true, max_commands_minute, block_time);
    }
    else {
        replyText = adminCommands.taxacomandos.msgs.reply_off;
        await botController.setCommandRate(false);
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function autostickerpvCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const replyText = botInfo.autosticker ? adminCommands.autostickerpv.msgs.reply_off : adminCommands.autostickerpv.msgs.reply_on;
    botController.setAutosticker(!botInfo.autosticker);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function bcmdglobalCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const { prefix } = botInfo;
    let commands = message.args;
    let validCommands = [];
    let blockResponse = adminCommands.bcmdglobal.msgs.reply_title;
    let categories = ['sticker', 'utility', 'download', 'misc'];
    if (!message.args.length) {
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
            if (botInfo.block_cmds.includes(waUtil.removePrefix(prefix, command))) {
                blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_already_blocked, command);
            }
            else {
                validCommands.push(command);
                blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_blocked, command);
            }
        }
        else if (commandExist(prefix, command, 'group') || commandExist(prefix, command, 'admin') || commandExist(prefix, command, 'info')) {
            blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_error, command);
        }
        else {
            blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_not_exist, command);
        }
    }
    botController.setBlockedCommands(prefix, validCommands, 'add');
    await waUtil.replyText(client, message.chat_id, blockResponse, message.wa_message, { expiration: message.expiration });
}
export async function dcmdglobalCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const { prefix } = botInfo;
    let commands = message.args;
    let validCommands = [];
    let unblockResponse = adminCommands.dcmdglobal.msgs.reply_title;
    let categories = ['all', 'sticker', 'utility', 'download', 'misc'];
    if (!message.args.length) {
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
            commands = botInfo.block_cmds.map(command => prefix + command);
        }
        else {
            commands = getCommandsByCategory(prefix, commands[0]);
        }
    }
    for (let command of commands) {
        if (botInfo.block_cmds.includes(waUtil.removePrefix(prefix, command))) {
            validCommands.push(command);
            unblockResponse += buildText(adminCommands.dcmdglobal.msgs.reply_item_unblocked, command);
        }
        else {
            unblockResponse += buildText(adminCommands.dcmdglobal.msgs.reply_item_not_blocked, command);
        }
    }
    botController.setBlockedCommands(prefix, validCommands, 'remove');
    await waUtil.replyText(client, message.chat_id, unblockResponse, message.wa_message, { expiration: message.expiration });
}
export async function entrargrupoCommand(client, botInfo, message, group) {
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const linkGroup = message.text_command;
    const isValidLink = linkGroup.match(/(https:\/\/chat.whatsapp.com)/gi);
    if (!isValidLink) {
        throw new Error(adminCommands.entrargrupo.msgs.error_link_invalid);
    }
    const linkId = linkGroup.replace(/(https:\/\/chat.whatsapp.com\/)/gi, '');
    const groupResponse = await waUtil.joinGroupInviteLink(client, linkId).catch(() => {
        throw new Error(adminCommands.entrargrupo.msgs.error_group);
    });
    if (!groupResponse) {
        await waUtil.replyText(client, message.chat_id, adminCommands.entrargrupo.msgs.reply_pending, message.wa_message, { expiration: message.expiration });
    }
    await waUtil.replyText(client, message.chat_id, adminCommands.entrargrupo.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function bcgruposCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const currentGroups = await groupController.getAllGroups();
    const waitReply = buildText(adminCommands.bcgrupos.msgs.wait, currentGroups.length);
    await waUtil.replyText(client, message.chat_id, waitReply, message.wa_message, { expiration: message.expiration });
    currentGroups.forEach(async (group) => {
        if (!group.restricted) {
            await new Promise((resolve) => {
                setTimeout(async () => {
                    const announceMessage = buildText(adminCommands.bcgrupos.msgs.message, botInfo.name, message.text_command);
                    await waUtil.sendText(client, group.id, announceMessage, { expiration: group.expiration }).catch(() => {
                        //Ignora se não for possível enviar a mensagem para esse grupo
                    });
                    resolve();
                }, 1000);
            });
        }
    });
    await waUtil.replyText(client, message.chat_id, adminCommands.bcgrupos.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function fotobotCommand(client, botInfo, message, group) {
    if (message.type != 'imageMessage' && message.quotedMessage?.type != 'imageMessage') {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const messageData = (message.isQuoted) ? message.quotedMessage?.wa_message : message.wa_message;
    if (!messageData) {
        throw new Error(adminCommands.fotobot.msgs.error_message);
    }
    let imageBuffer = await downloadMediaMessage(messageData, "buffer", {});
    await waUtil.updateProfilePic(client, botInfo.host_number, imageBuffer);
    await waUtil.replyText(client, message.chat_id, adminCommands.fotobot.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function nomebotCommand(client, botInfo, message, group) {
    const botController = new BotController();
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    botController.setName(message.text_command);
    await waUtil.replyText(client, message.chat_id, adminCommands.nomebot.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function prefixoCommand(client, botInfo, message, group) {
    const botController = new BotController();
    const supportedPrefixes = ["!", "#", ".", "*"];
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    else if (!supportedPrefixes.includes(message.text_command)) {
        throw new Error(adminCommands.prefixo.msgs.error_not_supported);
    }
    botController.setPrefix(message.text_command);
    await waUtil.replyText(client, message.chat_id, adminCommands.prefixo.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function listablockCommand(client, botInfo, message, group) {
    const blockedUsers = await waUtil.getBlockedContacts(client);
    if (!blockedUsers.length) {
        throw new Error(adminCommands.listablock.msgs.error);
    }
    let replyText = buildText(adminCommands.listablock.msgs.reply_title, blockedUsers.length);
    for (let userId of blockedUsers) {
        const userPosition = blockedUsers.indexOf(userId) + 1;
        replyText += buildText(adminCommands.listablock.msgs.reply_item, userPosition, waUtil.removeWhatsappSuffix(userId));
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function bloquearCommand(client, botInfo, message, group) {
    const userController = new UserController();
    const adminsId = (await userController.getAdmins()).map(admin => admin.id);
    const blockedUsers = await waUtil.getBlockedContacts(client);
    let targetUserId;
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
    if (adminsId.includes(targetUserId)) {
        throw new Error(buildText(adminCommands.bloquear.msgs.error_block_admin_bot, waUtil.removeWhatsappSuffix(targetUserId)));
    }
    else if (blockedUsers.includes(targetUserId)) {
        throw new Error(buildText(adminCommands.bloquear.msgs.error_already_blocked, waUtil.removeWhatsappSuffix(targetUserId)));
    }
    else {
        const replyText = buildText(adminCommands.bloquear.msgs.reply, waUtil.removeWhatsappSuffix(targetUserId));
        await waUtil.blockContact(client, targetUserId).catch(() => {
            throw new Error(adminCommands.bloquear.msgs.error_block);
        });
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
    }
}
export async function desbloquearCommand(client, botInfo, message, group) {
    const blockedUsers = await waUtil.getBlockedContacts(client);
    let targetUserId;
    if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage?.sender;
    }
    else if (message.mentioned.length) {
        targetUserId = message.mentioned[0];
    }
    else if (message.args.length == 1 && message.args[0].length <= 3 && Number(message.args[0])) {
        targetUserId = blockedUsers[Number(message.args[0]) - 1];
    }
    else if (message.args.length) {
        targetUserId = waUtil.addWhatsappSuffix(message.text_command);
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    if (!blockedUsers.includes(targetUserId)) {
        throw new Error(buildText(adminCommands.desbloquear.msgs.error_already_unblocked, waUtil.removeWhatsappSuffix(targetUserId)));
    }
    else {
        const replyText = buildText(adminCommands.desbloquear.msgs.reply, waUtil.removeWhatsappSuffix(targetUserId));
        await waUtil.unblockContact(client, targetUserId).catch(() => {
            throw new Error(adminCommands.desbloquear.msgs.error_unblock);
        });
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
    }
}
export async function recadoCommand(client, botInfo, message, group) {
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    await waUtil.updateProfileStatus(client, message.text_command);
    const replyText = buildText(adminCommands.recado.msgs.reply, message.text_command);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function usuarioCommand(client, botInfo, message, group) {
    const userController = new UserController();
    let targetUserId;
    if (message.isQuoted && message.quotedMessage) {
        targetUserId = message.quotedMessage.sender;
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
    let userData = await userController.getUser(targetUserId);
    if (!userData) {
        throw new Error(adminCommands.usuario.msgs.error_user_not_found);
    }
    const userType = userData.owner ? botTexts.user_types.owner : (userData.admin ? botTexts.user_types.admin : botTexts.user_types.user);
    const replyText = buildText(adminCommands.usuario.msgs.reply, userData.name || '---', userType, waUtil.removeWhatsappSuffix(userData.id), userData.commands);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function desligarCommand(client, botInfo, message, group) {
    await waUtil.replyText(client, message.chat_id, adminCommands.desligar.msgs.reply, message.wa_message, { expiration: message.expiration }).then(async () => {
        waUtil.shutdownBot(client);
    });
}
export async function pingCommand(client, botInfo, message, group) {
    const userController = new UserController();
    const groupController = new GroupController();
    const replyTime = ((moment.now() / 1000) - message.t).toFixed(2);
    const ramTotal = (os.totalmem() / 1024000000).toFixed(2);
    const ramUsed = ((os.totalmem() - os.freemem()) / 1024000000).toFixed(2);
    const systemName = `${os.type()} ${os.release()}`;
    const cpuName = os.cpus()[0]?.model ?? '---';
    const currentGroups = await groupController.getAllGroups();
    const currentUsers = await userController.getUsers();
    const botStarted = timestampToDate(botInfo.started);
    const replyText = buildText(adminCommands.ping.msgs.reply, systemName, cpuName, ramUsed, ramTotal, replyTime, currentUsers.length, currentGroups.length, botStarted);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
