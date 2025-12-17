async function unlock() {
const password = document.getElementById("password").value;
const res = await fetch("data.enc");
const encryptedB64 = (await res.text()).replace(/\s/g, ''); // supprime les espaces et retours
const data = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));

const salt = data.slice(0, 16);
const iv = data.slice(16, 28);
const tag = data.slice(28, 44);
const content = data.slice(44);

const enc = new TextEncoder();
const keyMaterial = await crypto.subtle.importKey(
"raw",
enc.encode(password),
"PBKDF2",
false,
["deriveKey"]
);

const key = await crypto.subtle.deriveKey(
{ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
keyMaterial,
{ name: "AES-GCM", length: 256 },
false,
["decrypt"]
);

try {
const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tag }, key, content);
document.getElementById("login").classList.add("hidden");
const contentDiv = document.getElementById("content");
contentDiv.classList.remove("hidden");
contentDiv.innerHTML = new TextDecoder().decode(decrypted);
} catch (e) {
document.getElementById("error").innerText = "Mot de passe incorrect";
}
}
