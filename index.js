const dotenv = require("dotenv");
dotenv.config();

const isValidAddress = require("./isValidAddress");

const { Client, Events, GatewayIntentBits } = require("discord.js");
const { getBalanceSolana } = require("./logic");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN environment variable is not set.");
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error("Error: CHANNEL_ID environment variable is not set.");
  process.exit(1);
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(BOT_TOKEN).catch((error) => {
  console.error("Failed to log in:", error.message);
  process.exit(1);
});

client.on("ready", () => {
  console.log("Connected to Discord and ready!");
  console.log("Bot is running as:", client.user.tag);
  console.log(`Monitoring channel ID: ${CHANNEL_ID}`);

  // Send a greeting message to the channel
  client.channels.cache
    .get(CHANNEL_ID)
    .send(`🤖 ${client.user.tag}  WalletWatcher is online!`);
  const greetingMessage =
    "🎉 I'm here to help you track Solana wallets Balance. Type `!balance <address>` to see your balance.";
  client.channels.cache.get(CHANNEL_ID).send(greetingMessage);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "!balance") {
    const solanaAddress = args[0];
    const tokenMint = args[1] || null;

    if (!solanaAddress || !isValidAddress(solanaAddress)) {
      return message.channel.send("Please provide a valid Solana address.");
    }

    try {
      const isSol = tokenMint ? false : true;
      const balance = await getBalanceSolana(solanaAddress, tokenMint, isSol);

      if (isSol) {
        message.channel.send(
          `Solana balance for address ${solanaAddress}: ${balance}`
        );
      } else {
        message.channel.send(
          `${
            tokenMint ? tokenMint : "USDT"
          } balance for address ${solanaAddress}: ${balance}`
        );
      }
    } catch (error) {
      console.error(error);
      message.channel.send(
        "Error getting balance, please ensure a valid Solana address is provided."
      );
    }
  }
});

