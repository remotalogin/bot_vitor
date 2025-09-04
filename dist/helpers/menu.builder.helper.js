// MENU PRINCIPAL
export const mainMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━ ✦ 🔎 *MENU PRINCIPAL* ✦
*|*► *${prefix}menu* 0   ❓ Informação
*|*► *${prefix}menu* 1   🖼️ Figurinhas
*|*► *${prefix}menu* 2   ⚒️ Utilidades
*|*► *${prefix}menu* 3   📥 Downloads
*|*► *${prefix}menu* 4   🧩 Variado
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU PRINCIPAL (GRUPO)
export const mainMenuGroup = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━ ✦ 🔎 *MENU PRINCIPAL* ✦
*|*► *${prefix}menu* 0   ❓ Informação
*|*► *${prefix}menu* 1   🖼️ Figurinhas
*|*► *${prefix}menu* 2   ⚒️ Utilidades
*|*► *${prefix}menu* 3   📥 Downloads
*|*► *${prefix}menu* 4   🧩 Variado
*|*► *${prefix}menu* 5   👨‍👩‍👧‍👦 Grupo
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - STICKER
export const stickerMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|* 
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|* 
*|*━━━━ ✦ 🖼️ *FIGURINHAS* ✦
*|*► *${prefix}s* - Imagem/vídeo para sticker
*|*► *${prefix}s* 1 - Imagem para sticker (circular)
*|*► *${prefix}s* 2 - Imagem para sticker (sem corte)
*|*► *${prefix}snome* pack, autor - Renomeia sticker
*|*► *${prefix}simg* - Sticker para imagem
*|*► *${prefix}ssf* - Imagem para sticker (sem fundo)
*|*► *${prefix}emojimix* 💩+😀 - Emoji para sticker
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - INFO
export const infoMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|* 
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|* 
*|*━━━━ ✦ ❓ *INFO/SUPORTE* ✦
*|*► *${prefix}info* - Informações do bot
*|*► *${prefix}reportar* texto - Reporte um problema
*|*► *${prefix}meusdados* - Exibe seus dados de uso
*|* 
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - DOWNLOAD
export const downloadMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━━━ ✦ 📥 *DOWNLOADS* ✦
*|*► *${prefix}play* nome - Áudio do Youtube
*|*► *${prefix}yt* nome - Vídeo do Youtube
*|*► *${prefix}fb* link - Vídeo do Facebook
*|*► *${prefix}ig* link - Videos/imagens do Instagram
*|*► *${prefix}x* link - Videos/imagens do X
*|*► *${prefix}tk* link - Vídeo do Tiktok
*|*► *${prefix}img* tema - Imagens do Google
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - UTILIDADE
export const utilityMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━━━ ✦ ⚒️ *UTILITÁRIOS* ✦
*|*
*|*━━ ✦ 🔎 *CONSULTAS/TEXTO* ✦
*|*► *${prefix}steamverde* jogo - Pesquisa de jogos "alternativos"
*|*► *${prefix}brasileirao* - Tabela do Brasileirão
*|*► *${prefix}animes* - Últimos lançamentos de animes
*|*► *${prefix}mangas* - Últimos lançamentos de mangás
*|*► *${prefix}filmes* - Tendências atuais de filmes
*|*► *${prefix}series* - Tendências atuais de séries
*|*► *${prefix}encurtar* link - Encurtador de link
*|*► *${prefix}letra* musica - Letra de música
*|*► *${prefix}traduz* idioma texto - Tradutor de texto
*|*► *${prefix}pesquisa* texto - Pesquisa do Google
*|*► *${prefix}clima* cidade - Previsão do tempo
*|*► *${prefix}noticias* - Notícias atuais
*|*► *${prefix}moeda* tipo valor - Conversor de moeda
*|*► *${prefix}calc* expressao - Calculadora
*|*► *${prefix}ddd* - Informação do DDD
*|*► *${prefix}tabela* - Tabela de caracteres
*|*
*|*━━ ✦ 🔊 *AUDIO* ✦
*|*► *${prefix}ouvir* - Áudio para texto
*|*► *${prefix}audio* - Extrai áudio de um video
*|*► *${prefix}efeitoaudio* tipo - Adiciona efeito no áudio
*|*► *${prefix}voz* pt texto - Texto para áudio
*|*
*|*━━ ✦ 🖼️ *IMAGENS* ✦
*|*► *${prefix}upimg* - Upload de imagem
*|*► *${prefix}rbg* - Removedor de fundo
*|*
*|*━━ ✦ ❔ *RECONHECIMENTO* ✦
*|*► *${prefix}qualmusica* - Reconhecimento de música
*|*► *${prefix}qualanime* - Reconhecimento de anime
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - GRUPO
export const groupMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━━━ ✦ 👨‍👩‍👧‍👦 *GRUPO* ✦
*|*
*|*━━ ✦ 🛠️ *GERAL* ✦
*|*► *${prefix}grupo* - Dados do grupo
*|*► *${prefix}adms* - Lista de administradores
*|*► *${prefix}dono* - Dono do grupo
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - GRUPO (ADMINISTRADOR)
export const groupAdminMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━━━ ✦ 👨‍👩‍👧‍👦 *GRUPO* ✦
*|*
*|*━━ ✦ 🛠️ *GERAL* ✦
*|*► *${prefix}grupo* - Dados do grupo
*|*► *${prefix}adms* - Lista de administradores
*|*► *${prefix}fotogrupo* - Altera foto do grupo
*|*► *${prefix}mt* texto - Marca membros/admins com uma mensagem
*|*► *${prefix}mm* texto - Marca membros com uma mensagem
*|*► *${prefix}dono* - Dono do grupo
*|*
*|*━━ ✦ 👤 *MEMBROS* ✦
*|*► *${prefix}membro* @membro - Mostra os dados do membro
*|*► *${prefix}topativos* - Marca os 10 membros mais ativos
*|*► *${prefix}inativos* numero - Marca os membros com menos de um determinado número de mensagens
*|*
*|*━━ ✦ ⌨️ *ADMINISTRATIVO* ✦
*|*► *${prefix}add* +55 219xxxxxxxx - Adiciona ao grupo
*|*► *${prefix}ban* @membro - Bane do grupo
*|*► *${prefix}aviso* @membro - Adiciona um aviso a um membro
*|*► *${prefix}rmaviso* @membro - Remove 1 aviso de um membro
*|*► *${prefix}zeraravisos* - Zera avisos de todos os membros
*|*► *${prefix}restrito* - Abre/feche o grupo só para admin
*|*► *${prefix}promover* @membro - Promove a admin
*|*► *${prefix}rebaixar* @admin - Rebaixa a membro
*|*► *${prefix}link* - Link do grupo
*|*► *${prefix}rlink* - Redefine o link do grupo
*|*► *${prefix}apg* - Apaga mensagem
*|*
*|*━━━━  ✦ 🧰 *RECURSOS* ✦ 
*|*
*|*━━ ✦ ✉️ *BEM VINDO* ✦ 
*|*► *${prefix}bemvindo* - Ativa/desativa a mensagem de bem-vindo
*|*
*|*━━ ✦ 🤫 *MUTAR GRUPO* ✦ 
*|*► *${prefix}mutar* - Ativa/desativa o uso de comandos somente para admins
*|*
*|*━━ ✦ 🏞️ *STICKER AUTOMATICO* ✦ 
*|*► *${prefix}autosticker* - Ativa/desativa a criação automática de stickers
*|*
*|*━━ ✦ 🚫 *ANTI-LINK* ✦ 
*|*► *${prefix}antilink* - Ativa/desativa o anti-link
*|*► *${prefix}addexlink* - Adiciona links as exceções do anti-link
*|*► *${prefix}rmexlink* - Remove links das exceções do anti-link
*|*
*|*━━ ✦ 🚫 *ANTI-FAKE* ✦ 
*|*► *${prefix}antifake* - Ativa/desativa o anti-fake
*|*► *${prefix}addexfake* - Adiciona prefixos/numeros as exceções do anti-fake
*|*► *${prefix}rmexfake* - Remove prefixos/numeros as exceções do anti-fake
*|*
*|*━━ ✦ 🚫 *ANTI-FLOOD* ✦ 
*|*► *${prefix}antiflood* - Ativa/desativa o anti-flood
*|*
*|*━━ ✦ 🤖 *RESPOSTA AUTOMÁTICA* ✦
*|*► *${prefix}autoresp* - Ativa/desativa as respostas automáticas
*|*► *${prefix}respostas* - Exibe as respostas configuradas
*|*► *${prefix}addresp* palavra resposta - Adiciona uma resposta a palavra
*|*► *${prefix}rmresp* palavra - Remove a resposta para essa palavra
*|*
*|*━━ ✦ 🔒 *BLOQUEIO DE COMANDOS* ✦
*|*► *${prefix}bcmd* !cmd1 !cmd2 - Bloqueia os comandos
*|*► *${prefix}dcmd* !cmd1 !cmd2 - Desbloqueia os comandos
*|*
*|*━━ ✦ 🗒️ *LISTA NEGRA* ✦
*|*► *${prefix}listanegra* - Exibe a lista negra
*|*► *${prefix}addlista* +55 219xxxxxxxx - Adiciona a lista negra
*|*► *${prefix}rmlista* +55 219xxxxxxxx - Remove da lista negra
*|*
*|*━━ ✦ 🚫 *FILTRO DE PALAVRAS* ✦
*|*► *${prefix}addfiltros* palavra - Adiciona palavras ao filtro
*|*► *${prefix}rmfiltros* palavra - Remove palavras do filtro
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - VARIADO
export const miscMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━ ✦ 🕹️ *JOGOS* ✦
*|*► *${prefix}ppt* opção - Joga pedra, papel e tesoura
*|*► *${prefix}caracoroa* - Joga cara ou coroa
*|*► *${prefix}roletarussa* - Joga roleta russa
*|*
*|*━━ ✦ 🎲 *SORTEIO* ✦
*|*► *${prefix}sorteio* numero - Sorteia um número até esse valor.
*|*
*|*━━ ✦ 🧩 *ENTRETENIMENTO* ✦
*|*► *${prefix}mascote* - Onipotente e onipresente WhatsApp Jr
*|*► *${prefix}frase* - Frase dúvidosa do WhatsApp Jr
*|*► *${prefix}chance* texto - Chance de algo acontecer
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - VARIADO (GRUPO)
export const miscGroupMenu = (botInfo) => {
    let { name, prefix } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━ ✦ 🕹️ *JOGOS* ✦
*|*► *${prefix}ppt* opcão - Joga pedra, papel e tesoura
*|*► *${prefix}caracoroa* - Joga cara ou coroa
*|*► *${prefix}roletarussa* - Joga roleta russa
*|*
*|*━━ ✦ 🎲 *SORTEIO* ✦
*|*► *${prefix}sorteio* numero - Sorteia um número até esse valor.
*|*► *${prefix}sorteiomembro* - Sorteia um membro do grupo.
*|*
*|*━━ ✦ 🧩 *ENTRETENIMENTO* ✦
*|*► *${prefix}mascote* - Onipotente e onipresente WhatsApp Jr
*|*► *${prefix}frase* - Frase dúvidosa do WhatsApp Jr
*|*► *${prefix}viadometro* - Nível de viadagem
*|*► *${prefix}detector* - Detector de mentira
*|*► *${prefix}casal* - Escolhe um casal
*|*► *${prefix}gadometro* - Nível de gado
*|*► *${prefix}chance* texto - Chance de algo acontecer
*|*► *${prefix}bafometro* - Nível de álcool
*|*► *${prefix}top5* tema - Ranking de top 5
*|*► *${prefix}par* @pessoa1 @pessoa2 - Nível de compatibilidade
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
// MENU - ADMIN
export const adminMenu = (botInfo) => {
    let { prefix, name } = botInfo;
    return `*|*━━━ ✦ *🤖 ${name?.trim()}* ✦
*|*
*|*━━━━ Guia ❔: *${prefix}comando* guia
*|*
*|*━━━━ ✦ ⚙️ *ADMINISTRAÇÃO* ✦
*|*
*|*━━ ✦ 🛠️ *GERAL* ✦
*|*► *${prefix}info* - Informação do bot
*|*► *${prefix}ping* - Informação do sistema
*|*► *${prefix}bloquear* @usuario  - Bloqueia o usuário
*|*► *${prefix}desbloquear* @usuario  - Desbloqueia o usuário
*|*► *${prefix}listablock*  - Lista de usuários bloqueados
*|*► *${prefix}bcgrupos* texto - Mensagem para todos os grupos
*|*► *${prefix}desligar* - Desliga o bot
*|*
*|*━━ ✦ 🎨 *CUSTOMIZAÇÃO* ✦
*|*► *${prefix}nomebot* nome - Altera nome do bot
*|*► *${prefix}prefixo* simbolo - Altera o prefixo dos comandos
*|*► *${prefix}fotobot* - Altera foto do bot
*|*► *${prefix}recado* texto - Altera o texto do recado/status
*|*
*|*━━ ✦ 👨‍👩‍👧‍👦 *GRUPOS* ✦
*|*► *${prefix}grupos* - Dados dos grupos atuais
*|*► *${prefix}entrargrupo* link - Entra no grupo
*|*
*|*━━ ✦ 👤 *USUÁRIOS* ✦
*|*► *${prefix}usuario* @usuario - Dados do usuário
*|*
*|*━━ ✦ ⭐ *ADMINS* ✦
*|*► *${prefix}admins* - Administradores do bot
*|*► *${prefix}addadmin* - Promove a admin do bot
*|*► *${prefix}rmadmin* - Rebaixa a usuário do bot
*|*
*|*━━━━ ✦ 🧰  *RECURSOS* ✦
*|*
*|*━ ✦ 🏞️  *AUTO-STICKER PRIVADO* ✦
*|*► *${prefix}autostickerpv* - Ativa/desativa a criação automática de stickers no privado
*|*
*|*━ ✦ 🔒 *BLOQUEIO DE COMANDOS* ✦
*|*► *${prefix}bcmdglobal* !cmd1 !cmd2 - Bloqueia os comandos globalmente
*|*► *${prefix}dcmdglobal* !cmd1 !cmd2 - Desbloqueia os comandos globalmente
*|*
*|*━ ✦ ⭐ *MODO ADMIN* ✦
*|*► *${prefix}modoadmin* - Ativa/desativa o modo para apenas admins do bot usarem comandos
*|*
*|*━ ✦ ⏳ *TAXA DE COMANDOS* ✦
*|*► *${prefix}taxacomandos* numero - Ativa/desativa a taxa de comandos por minuto
*|*
*|*━ ✦ 📩 *MENSAGENS PRIVADAS* ✦
*|*► *${prefix}comandospv* - Ativa/desativa os comandos em mensagens privadas
*|*
*|*━━✦༻ _*Feito por: Leal*_ ༺✦`;
};
