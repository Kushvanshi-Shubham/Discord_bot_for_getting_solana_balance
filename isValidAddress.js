// Import required modules
const { PublicKey } = require("@solana/web3.js");

/**
 * Validates if the provided address is a valid Solana address.
 * @param {string} address - The Solana address to validate.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
function isValidAddress(address) {
  try {
    return PublicKey.isOnCurve(new PublicKey(address));
  } catch (error) {
    return false;
  }
}

// Export the isValidAddress function
module.exports = isValidAddress;
