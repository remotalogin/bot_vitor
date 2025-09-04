import * as waUtil from "../utils/whatsapp.util.js";
import { buildText, getCurrentBotVersion, messageErrorCommandUsage, timestampToDate } from "../utils/general.util.js";
import { UserController } from "../controllers/user.controller.js";
import * as menu from "../helpers/menu.builder.helper.js";
import infoCommands from "./info.list.commands.js";
import botTexts from "../helpers/bot.texts.helper.js";
export async function infoCommand(client, botInfo, message, group) {
    const userController = new UserController();
    const blockedUsers = await waUtil.getBlockedContacts(client);
    const adminsBot = await userController.getAdmins();
    const adminsBotContacts = adminsBot.map(admin => `- wa.me/${waUtil.removeWhatsappSuffix(admin.id)}\n`);
    let version = getCurrentBotVersion();
    let botStartedAt = timestampToDate(botInfo.started);
    let replyText = buildText(infoCommands.info.msgs.reply_title, botInfo.name?.trim(), botStartedAt, version, botInfo.executed_cmds, adminsBotContacts);
    if (message.isBotAdmin) {
        replyText += infoCommands.info.msgs.reply_title_resources;
        // MODO ADMIN
        replyText += (botInfo.admin_mode) ? infoCommands.info.msgs.reply_item_adminmode_on : infoCommands.info.msgs.reply_item_adminmode_off;
        // AUTO-STICKER
        replyText += (botInfo.autosticker) ? infoCommands.info.msgs.reply_item_autosticker_on : infoCommands.info.msgs.reply_item_autosticker_off;
        // PV LIBERADO
        replyText += (botInfo.commands_pv) ? infoCommands.info.msgs.reply_item_commandspv_on : infoCommands.info.msgs.reply_item_commandspv_off;
        // TAXA DE COMANDOS POR MINUTO
        replyText += (botInfo.command_rate.status) ? buildText(infoCommands.info.msgs.reply_item_commandsrate_on, botInfo.command_rate.max_cmds_minute, botInfo.command_rate.block_time) : infoCommands.info.msgs.reply_item_commandsrate_off;
        // BLOQUEIO DE COMANDOS
        let blockedCommands = [];
        for (let commandName of botInfo.block_cmds) {
            blockedCommands.push(botInfo.prefix + commandName);
        }
        replyText += (botInfo.block_cmds.length != 0) ? buildText(infoCommands.info.msgs.reply_item_blockcmds_on, blockedCommands.toString()) : infoCommands.info.msgs.reply_item_blockcmds_off;
        //USUARIOS BLOQUEADOS
        replyText += buildText(infoCommands.info.msgs.reply_item_blocked_count, blockedUsers.length);
    }
    //RESPOSTA
    await waUtil.getProfilePicUrl(client, botInfo.host_number).then(async (pic) => {
        if (pic) {
            await waUtil.replyFileFromUrl(client, message.chat_id, 'imageMessage', pic, replyText, message.wa_message, { expiration: message.expiration });
        }
        else {
            await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        }
    }).catch(async () => {
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
    });
}
export async function reportarCommand(client, botInfo, message, group) {
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const admins = await new UserController().getAdmins();
    if (!admins.length) {
        throw new Error(infoCommands.reportar.msgs.error);
    }
    admins.forEach(async (admin) => {
        let replyAdmin = buildText(infoCommands.reportar.msgs.reply_admin, message.pushname, waUtil.removeWhatsappSuffix(message.sender), message.text_command);
        await waUtil.sendText(client, admin.id, replyAdmin);
    });
    await waUtil.replyText(client, message.chat_id, infoCommands.reportar.msgs.reply, message.wa_message, { expiration: message.expiration });
}
export async function meusdadosCommand(client, botInfo, message, group) {
    const userData = await new UserController().getUser(message.sender);
    if (!userData) {
        throw new Error(infoCommands.meusdados.msgs.error_not_found);
    }
    const userName = userData.name || '---';
    const userType = userData.owner ? botTexts.user_types.owner : (userData.admin ? botTexts.user_types.admin : botTexts.user_types.user);
    let replyText = buildText(infoCommands.meusdados.msgs.reply, userType, userName, userData.commands);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function menuCommand(client, botInfo, message, group) {
    const userData = await new UserController().getUser(message.sender);
    if (!userData) {
        throw new Error(infoCommands.menu.msgs.error_user_not_found);
    }
    const userType = userData.owner ? botTexts.user_types.owner : (userData.admin ? botTexts.user_types.admin : botTexts.user_types.user);
    let replyText = buildText(infoCommands.menu.msgs.reply, userData.name, userType, userData.commands);
    if (!message.args.length) {
        replyText += message.isGroupMsg ? menu.mainMenuGroup(botInfo) : menu.mainMenu(botInfo);
    }
    else {
        const commandText = message.text_command.trim();
        switch (commandText) {
            case "0":
                replyText += menu.infoMenu(botInfo);
                break;
            case "1":
                replyText += menu.stickerMenu(botInfo);
                break;
            case "2":
                replyText += menu.utilityMenu(botInfo);
                break;
            case "3":
                replyText += menu.downloadMenu(botInfo);
                break;
            case "4":
                if (message.isGroupMsg) {
                    replyText += menu.miscGroupMenu(botInfo);
                }
                else {
                    replyText += menu.miscMenu(botInfo);
                }
                break;
            case "5":
                if (!message.isGroupMsg) {
                    throw new Error(botTexts.permission.group);
                }
                else if (message.isGroupAdmin) {
                    replyText += menu.groupAdminMenu(botInfo);
                }
                else {
                    replyText += menu.groupMenu(botInfo);
                }
                break;
            default:
                throw new Error(infoCommands.menu.msgs.error_invalid_option);
        }
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
