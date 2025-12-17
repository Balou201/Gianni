async function unlock() {
  const password = document.getElementById("password").value;

  const res = await fetch("data.enc");
  const encryptedB64 = (await res.text()).replace(/\s/g, "");

  const raw = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));

  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const ciphertextWithTag = raw.slice(28); // ciphertext + tag à la fin

  const enc = new TextEncoder();

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
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["decrypt"]
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertextWithTag
    );

    document.getElementById("login").classList.add("hidden");
    const content = document.getElementById("content");
    content.classList.remove("hidden");
    content.innerHTML = new TextDecoder().decode(decrypted);
  } catch {
    document.getElementById("error").innerText = "Mot de passe incorrect";
  }
}
