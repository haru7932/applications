require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function gerarNomeAleatorio(letras) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let nome = "";

  for (let i = 0; i < letras; i++) {
    nome += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("gera_nm")
    .setDescription("Comando para gerar nomes")
    .addIntegerOption(option =>
      option
        .setName("letras")
        .setDescription("Quantidade de letras do nome")
        .setRequired(true)
        .setMinValue(3)
        .setMaxValue(20)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Comando registrado.");
  } catch (err) {
    console.error(err);
  }
})();

client.on("ready", () => {
  console.log(`Online como ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === "gera_nm") {
    const letras = interaction.options.getInteger("letras");
    const nome = gerarNomeAleatorio(letras);

    const embed = new EmbedBuilder()
      .setTitle("✨ Gerador de Nomes")
      .setDescription(`**Nome Gerado:** \`${nome}\`\n**Letras:** ${letras}`)
      .setFooter({ text: "Clique no botão para gerar novamente" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`regen_${letras}`)
        .setLabel("🔄 Gerar Novamente")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (interaction.isButton() && interaction.customId.startsWith("regen_")) {
    const letras = parseInt(interaction.customId.split("_")[1], 10);
    const nome = gerarNomeAleatorio(letras);

    const embed = new EmbedBuilder()
      .setTitle("✨ Gerador de Nomes")
      .setDescription(`**Nome Gerado:** \`${nome}\`\n**Letras:** ${letras}`)
      .setFooter({ text: "Clique no botão para gerar novamente" })
      .setTimestamp();

    await interaction.update({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
