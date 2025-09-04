import { DisconnectReason } from 'baileys';
import { Boom } from '@hapi/boom';
import { BotController } from '../controllers/bot.controller.js';
import { buildText, showConsoleError, colorText, askQuestion } from '../utils/general.util.js';
import botTexts from '../helpers/bot.texts.helper.js';
import { UserController } from '../controllers/user.controller.js';
import { getHostNumber } from '../utils/whatsapp.util.js';
import qrcode from 'qrcode-terminal';
import { cleanCreds } from '../helpers/session.auth.helper.js';
export async function connectionQr(qr) {
    if (qr) {
        await new Promise(resolve => {
            qrcode.generate(qr, { small: true }, (qrcode) => {
                console.log(qrcode);
                resolve();
            });
        });
    }
}
export async function connectionPairingCode(client) {
    const answerNumber = await askQuestion(botTexts.input_phone_number);
    const code = await client.requestPairingCode(answerNumber.replace(/\W+/g, ""));
    console.log(colorText(buildText(botTexts.show_pairing_code, code)));
}
export async function connectionOpen(client) {
    try {
        const botController = new BotController();
        botController.startBot(getHostNumber(client));
        console.log(colorText(botTexts.bot_data));
        await checkOwnerRegister();
    }
    catch (err) {
        showConsoleError(err, "CONNECTION");
        client.end(new Error("fatal_error"));
    }
}
export async function connectionClose(connectionState) {
    try {
        const { lastDisconnect } = connectionState;
        let needReconnect = false;
        const errorCode = (new Boom(lastDisconnect?.error)).output.statusCode;
        if (lastDisconnect?.error?.message == "admin_command") {
            showConsoleError(new Error(botTexts.disconnected.command), 'CONNECTION');
        }
        else if (lastDisconnect?.error?.message == "fatal_error") {
            showConsoleError(new Error(botTexts.disconnected.fatal_error), 'CONNECTION');
        }
        else {
            needReconnect = true;
            if (errorCode == DisconnectReason?.loggedOut) {
                await cleanCreds();
                showConsoleError(new Error(botTexts.disconnected.logout), 'CONNECTION');
            }
            else if (errorCode == 405) {
                await cleanCreds();
            }
            else if (errorCode == DisconnectReason?.restartRequired) {
                showConsoleError(new Error(botTexts.disconnected.restart), 'CONNECTION');
            }
            else {
                showConsoleError(new Error(buildText(botTexts.disconnected.bad_connection, errorCode.toString(), lastDisconnect?.error?.message)), 'CONNECTION');
            }
        }
        return needReconnect;
    }
    catch {
        return false;
    }
}
async function checkOwnerRegister() {
    const owner = await new UserController().getOwner();
    if (!owner) {
        console.log(colorText(botTexts.owner_not_found, "#d63e3e"));
    }
    else {
        console.log(colorText(botTexts.owner_registered));
    }
}
