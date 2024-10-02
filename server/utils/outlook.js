const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const forge = require("node-forge");
const { logger } = require("./logger");

const CERT_DIR = path.join(__dirname, "..", "cert", "outlook");

const readFile = (filename) =>
  fs.readFileSync(path.join(CERT_DIR, filename), "utf8");

const decryptNotification = (encryptedContent) => {
  try {
    const privateKey = readFile("privateKey.pem");
    const symmetricKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha1",
      },
      Buffer.from(encryptedContent.dataKey, "base64")
    );

    const iv = Buffer.alloc(16, 0);
    symmetricKey.copy(iv, 0, 0, 16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", symmetricKey, iv);
    let decrypted = decipher.update(encryptedContent.data, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    logger.error("Error decrypting notification:", error);
    return null;
  }
};

const generateKeys = () => {
  const pemCertificate = readFile("certificate.pem");
  const cert = forge.pki.certificateFromPem(pemCertificate);
  return forge.util.encode64(
    forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
  );
};

module.exports = {
  decryptNotification,
  generateKeys,
};
