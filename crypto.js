async function unlock() {
  const password = document.getElementById("password").value;

  const res = await fetch("data.enc");
  const encrypted = await res.text();

  try {
    const decrypted = await decrypt(encrypted, password);
    document.getElementById("login").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
    document.getElementById("content").innerHTML = decrypted;
  } catch (e) {
    document.getElementById("error").innerText = "Mot de passe incorrect";
  }
}

async function decrypt(cipherText, password) {
  const enc = new TextEncoder();
  const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const content = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    content
  );

  return new TextDecoder().decode(decrypted);
}
