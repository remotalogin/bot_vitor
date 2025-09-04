import { UserController } from "../controllers/user.controller.js";
import botTexts from "../helpers/bot.texts.helper.js";
import { GroupController } from "../controllers/group.controller.js";
import { buildText, removeFormatting } from "../utils/general.util.js";
import { BotController } from "../controllers/bot.controller.js";
import * as waUtil from "../utils/whatsapp.util.js";
import moment from "moment";
const userController = new UserController();
const botController = new BotController();
const groupController = new GroupController();
export async function isUserBlocked(client, message) {
    const blockedContacts = await waUtil.getBlockedContacts(client);
    return blockedContacts.includes(message.sender);
}
export async function isOwnerRegister(client, botInfo, message) {
    const admins = await userController.getAdmins();
    if (!admins.length && message.command == `${botInfo.prefix}admin`) {
        await userController.registerOwner(message.sender);
        await waUtil.replyText(client, message.chat_id, buildText(botTexts.admin_registered), message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function incrementParticipantActivity(message, isCommand) {
    await groupController.incrementParticipantActivity(message.chat_id, message.sender, message.type, isCommand);
}
export async function incrementUserCommandsCount(message) {
    await userController.increaseUserCommandsCount(message.sender);
}
export function incrementBotCommandsCount() {
    botController.incrementExecutedCommands();
}
export async function incrementGroupCommandsCount(group) {
    await groupController.incrementGroupCommands(group.id);
}
export function isIgnoredByPvAllowed(botInfo, message) {
    return (!message.isBotAdmin && !botInfo.commands_pv);
}
export function isIgnoredByGroupMuted(group, message) {
    return (group.muted && !message.isGroupAdmin);
}
export function isIgnoredByAdminMode(bot, message) {
    return (bot.admin_mode && !message.isBotAdmin);
}
export async function isBotLimitedByGroupRestricted(group, botInfo) {
    const isBotGroupAdmin = await groupController.isParticipantAdmin(group.id, botInfo.host_number);
    return (group.restricted && !isBotGroupAdmin);
}
export async function sendPrivateWelcome(client, botInfo, message) {
    const user = await userController.getUser(message.sender);
    if (user && !user.receivedWelcome) {
        const replyText = buildText(botTexts.new_user, botInfo.name, message.pushname);
        await waUtil.sendText(client, message.chat_id, replyText, { expiration: message.expiration });
        await userController.setReceivedWelcome(user.id, true);
    }
}
export async function readUserMessage(client, message) {
    await waUtil.readMessage(client, message.chat_id, message.sender, message.message_id);
}
export async function updateUserName(message) {
    if (message.pushname) {
        await userController.setName(message.sender, message.pushname);
    }
}
export async function isUserLimitedByCommandRate(client, botInfo, message) {
    if (botInfo.command_rate.status) {
        const currentTimestamp = Math.round(moment.now() / 1000);
        const { isBotAdmin } = message;
        const user = await userController.getUser(message.sender);
        if (isBotAdmin)
            return false;
        if (user) {
            let isUserLimited;
            if (user.command_rate.limited) {
                const hasExpiredLimited = currentTimestamp > user.command_rate.expire_limited;
                if (hasExpiredLimited)
                    await userController.setLimitedUser(user.id, false, botInfo, currentTimestamp);
                isUserLimited = hasExpiredLimited ? false : true;
            }
            else {
                const hasExpiredCommands = currentTimestamp > user.command_rate.expire_cmds;
                if (hasExpiredCommands)
                    await userController.expireCommandsRate(user.id, currentTimestamp);
                else
                    await userController.incrementCommandRate(user.id);
                if (!hasExpiredCommands && user.command_rate.cmds >= botInfo.command_rate.max_cmds_minute) {
                    await userController.setLimitedUser(user.id, true, botInfo, currentTimestamp);
                    isUserLimited = true;
                }
                else {
                    isUserLimited = false;
                }
            }
            if (isUserLimited) {
                const replyText = buildText(botTexts.command_rate_limited_message, botInfo.command_rate.block_time);
                await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
                return true;
            }
        }
        else {
            await userController.registerUser(message.sender, message.pushname);
        }
    }
    return false;
}
export async function isCommandBlockedGlobally(client, botInfo, message) {
    const commandBlocked = botInfo.block_cmds.includes(waUtil.removePrefix(botInfo.prefix, message.command));
    if (commandBlocked && !message.isBotAdmin) {
        const replyText = buildText(botTexts.globally_blocked_command, message.command);
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function isCommandBlockedGroup(client, group, botInfo, message) {
    const commandBlocked = group.block_cmds.includes(waUtil.removePrefix(botInfo.prefix, message.command));
    if (commandBlocked && !message.isGroupAdmin) {
        const replyText = buildText(botTexts.group_blocked_command, message.command);
        await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function isDetectedByWordFilter(client, botInfo, group, message) {
    const { isGroupAdmin, body, caption } = message;
    const groupAdmins = await groupController.getAdminsIds(group.id);
    const isBotAdmin = groupAdmins.includes(botInfo.host_number);
    const userText = body || caption;
    const userTextNoFormatting = removeFormatting(userText);
    const userWords = userTextNoFormatting.split(' ');
    const wordsFiltered = userWords.filter(userWord => group.word_filter.includes(removeFormatting(userWord.toLowerCase())) == true);
    if (wordsFiltered.length && isBotAdmin && !isGroupAdmin) {
        await waUtil.deleteMessage(client, message.wa_message, false);
        return true;
    }
    return false;
}
export async function autoReply(client, botInfo, group, message) {
    if (group.auto_reply.status) {
        const { body, caption } = message;
        const groupAdmins = await groupController.getAdminsIds(group.id);
        const isBotGroupAdmin = groupAdmins.includes(botInfo.host_number);
        const userText = body || caption;
        const userTextNoFormatting = removeFormatting(userText);
        const userWords = userTextNoFormatting.split(' ').map(word => word.toLowerCase());
        const wordsDetected = userWords.filter(userWord => group.auto_reply.config.find(config => config.word == userWord));
        if (wordsDetected.length && isBotGroupAdmin) {
            const configWord = group.auto_reply.config.find(config => config.word == wordsDetected[0]);
            if (configWord) {
                await waUtil.replyText(client, message.chat_id, configWord?.reply, message.wa_message, { expiration: message.expiration });
            }
        }
    }
}
export async function isDetectedByAntiLink(client, botInfo, group, message) {
    const { body, caption, isGroupAdmin } = message;
    const userText = body || caption;
    const groupAdmins = await groupController.getAdminsIds(group.id);
    const isBotAdmin = groupAdmins.includes(botInfo.host_number);
    if (group.antilink.status && !isBotAdmin) {
        await groupController.setAntiLink(group.id, false);
    }
    else if (group.antilink.status && !isGroupAdmin) {
        const detectedURLS = userText.match(new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?/img));
        if (detectedURLS) {
            let needDeleteMessage = false;
            if (group.antilink.exceptions.length) {
                const allowedURLS = detectedURLS.map(url => url.toLowerCase()).filter(url => group.antilink.exceptions.filter(exception => url.includes(exception.toLowerCase())).length);
                needDeleteMessage = detectedURLS.length != allowedURLS.length;
            }
            else {
                needDeleteMessage = true;
            }
            if (needDeleteMessage) {
                const replyText = buildText(botTexts.detected_link, waUtil.removeWhatsappSuffix(message.sender));
                await waUtil.deleteMessage(client, message.wa_message, false);
                await waUtil.sendTextWithMentions(client, message.chat_id, replyText, [message.sender], { expiration: message.expiration });
                return true;
            }
        }
    }
    return false;
}
export async function isDetectedByAntiFlood(client, botInfo, group, message) {
    const currentTimestamp = Math.round(moment.now() / 1000);
    const { isGroupAdmin } = message;
    const participant = await groupController.getParticipant(group.id, message.sender);
    if (!participant || isGroupAdmin || !group.antiflood.status)
        return false;
    const hasExpiredMessages = currentTimestamp > participant.antiflood.expire;
    if (hasExpiredMessages) {
        const expireTimestamp = currentTimestamp + group.antiflood.interval;
        await groupController.expireParticipantAntiFlood(group.id, message.sender, expireTimestamp);
    }
    else {
        await groupController.incrementAntiFloodMessage(group.id, message.sender);
    }
    if (!hasExpiredMessages && participant.antiflood.msgs >= group.antiflood.max_messages) {
        const replyText = buildText(botTexts.antiflood_ban_messages, waUtil.removeWhatsappSuffix(message.sender), botInfo.name);
        await waUtil.removeParticipant(client, message.chat_id, message.sender);
        await waUtil.sendTextWithMentions(client, message.chat_id, replyText, [message.sender], { expiration: message.expiration });
        return true;
    }
    else {
        return false;
    }
}
