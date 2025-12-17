const fs = require("fs");
const crypto = require("crypto");

const password = "Gianni"; // mot de passe pour ta famille
const content = `<h1>Infos familiales</h1><p>Texte privé ici</p>`;

// Génération du sel et du IV
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

// Génération de la clé avec PBKDF2
crypto.pbkdf2(password, salt, 100000, 32, "sha256", (err, key) => {
  if (err) throw err;

  // Chiffrement AES-256-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(content, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Concaténation : salt + iv + tag + ciphertext
  const output = Buffer.concat([salt, iv, tag, encrypted]);

  // Conversion Base64 sur UNE seule ligne
  fs.writeFileSync("data.enc", output.toString("base64").replace(/\n/g, ''), { encoding: "utf8" });

  console.log("✅ data.enc généré (Base64 sur une seule ligne)");
});
