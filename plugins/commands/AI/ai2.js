import axios from 'axios';

const config = {
    name: "ai2",
    aliases: ["chat", "gpt"],
    description: "Interact with GPT-4 via API",
    usage: "[query]",
    cooldown: 8,
    permissions: [0], // General users can access
    isAbsolute: false,
    isHidden: false,
    credits: "Jonell Magallanes",
};

const langData = {
    "lang_1": {
        "message": "Please provide a prompt to interact with the AI.",
    },
    "lang_2": {
        "message": "Kailangan mo magbigay ng prompt para makipag-ugnayan sa AI.",
    }
};

async function handleReply({ api, event, handleReply }) {
    const { messageID, threadID } = event;
    const id = event.senderID;

    const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${encodeURIComponent(event.body)}&id=${id}`;

    try {
        const lad = await api.sendMessage("🔍 Searching for an answer. Please wait...", threadID, messageID);
        const response = await axios.get(apiUrl);
        const { response: result } = response.data;

        const responseMessage = `🧠 AI Response\n────────────\n${result}\n────────────\n`;
        api.editMessage(responseMessage, lad.messageID, threadID, messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
}

async function onCall({ api, event, args, getLang, data, userPermissions, prefix }) {
    const { messageID, threadID } = event;
    const id = event.senderID;

    if (!args[0]) return api.sendMessage(getLang("message"), threadID, messageID);

    const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${encodeURIComponent(args.join(" "))}&id=${id}`;

    const lad = await api.sendMessage("🔍 Searching for an answer. Please wait...", threadID, messageID);

    try {
        if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments[0]) {
            const attachment = event.messageReply.attachments[0];

            if (attachment.type === "photo") {
                const imageURL = attachment.url;

                const geminiUrl = `https://joncll.serv00.net/chat.php?ask=${encodeURIComponent(args.join(" "))}&imgurl=${encodeURIComponent(imageURL)}`;
                const response = await axios.get(geminiUrl);
                const { vision } = response.data;

                if (vision) {
                    return api.editMessage(`🧠 AI Vision\n────────────\n${vision}\n────────────\n`, lad.messageID, event.threadID, event.messageID);
                } else {
                    return api.sendMessage("Unable to identify the image. ❌", threadID, messageID);
                }
            }
        }

        const response = await axios.get(apiUrl);
        const { response: result } = response.data;

        const responseMessage = `🧠 AI Response\n────────────\n${result}\n────────────\n`;
        api.editMessage(responseMessage, lad.messageID, event.threadID, event.messageID);
        global.client.handleReply.push({
            name: config.name,
            messageID: lad.messageID,
            author: event.senderID
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
}

export default {
    config,
    langData,
    handleReply,
    onCall
};
