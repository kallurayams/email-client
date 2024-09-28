const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { logger } = require("./logger");
const fs = require("fs");
const crypto = require("crypto");
const forge = require('node-forge');
const path = require('path');

module.exports = {
    generateToken: async (data, expiryDate) => {
        try {
            //TODO: remove expiry time from env
            const key = config.jwtSecretKey;
            const expiry = new Date(expiryDate);
            const expiryTimestamp = Math.floor(expiry.getTime() / 1000);
            return jwt.sign({ ...data, exp: expiryTimestamp }, key);
        } catch (error) {
            logger.error(error);
            return false;
        }
    },
    verifyToken: async (token) => {
        try {
            const key = config.jwtSecretKey;
            let decoded = jwt.verify(token, key);
            if (!decoded) {
                return false;
            }
            return decoded;
        } catch (error) {
            logger.error(error);
            return false;
        }
    },
    generateKeys: () => {
        try {
            // Read existing certificate and private key files
            const pemCertificate = fs.readFileSync(path.join(__dirname, '..', 'cert', 'certificate.pem'), 'utf8');
            const pemPrivateKey = fs.readFileSync(path.join(__dirname, '..', 'cert', 'privateKey.pem'), 'utf8');

            // Parse the certificate
            const cert = forge.pki.certificateFromPem(pemCertificate);

            // Return the base64 encoded certificate (without headers and footers)
            return forge.util.encode64(
                forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
            );
            /*
                    const keys = forge.pki.rsa.generateKeyPair(2048);
        
                    // Create a new certificate
                    const cert = forge.pki.createCertificate();
                    cert.publicKey = keys.publicKey;
                  
                    // Self-sign the certificate
                    cert.sign(keys.privateKey);
                  
                    // Convert to PEM format
                    const pemCertificate = forge.pki.certificateToPem(cert);
                    const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);
                  
                    // Save to files (optional, but useful for debugging)
                    fs.writeFileSync(path.join(__dirname + '/../cert/certificate.pem'), pemCertificate);
                    fs.writeFileSync(path.join(__dirname + '/../cert/privateKey.pem'), pemPrivateKey);
                  
                    // Return the base64 encoded certificate (without headers and footers)
                    return forge.util.encode64(
                      forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
                    );*/
        } catch (error) {
            logger.error(error);
            return false;
        }

    },
    decryptNotification: (encryptedContent) => {
        try {
        // Read the private key
        const privateKey = fs.readFileSync(path.join(__dirname + '/../cert/privateKey.pem'), 'utf8');

        // Decrypt the symmetric key
        const symmetricKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha1',
            },
            Buffer.from(encryptedContent.dataKey, 'base64')
        );

        // Extract IV from the first 16 bytes
        const iv = Buffer.alloc(16, 0);
        symmetricKey.copy(iv, 0, 0, 16);

        // Decrypt the content
        const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, iv);
        let decrypted = decipher.update(encryptedContent.data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
        } catch (error) {
            logger.error(error);
            return false;
        }
    }
};