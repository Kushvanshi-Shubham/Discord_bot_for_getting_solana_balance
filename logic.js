const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { Token, Account } = require("@solana/spl-token");

const solanaAddress = process.env.ADDRESS;

const commitmentLevel = "processed";
const endpoint = clusterApiUrl("devnet");
const connection = new Connection(endpoint, commitmentLevel);

async function getBalanceSolana(address, tokenMint = null, isSol = false) {
  try {
    const publicKey = new PublicKey(address);
    const connection = new Connection(endpoint, commitmentLevel);

    if (isSol) {
      if (tokenMint) {
        console.error("Error: isSol is true, but a tokenMint is provided.");
        return null;
      }
      const balance = await connection.getBalance(publicKey);
      return formatNumberWithDecimals(balance, 9);
    } else {
      const tokenAccount = await connection.getTokenAccountsByOwner(publicKey, {
      });
      const tokenAccountInfo = tokenAccount.value.find(
        (acc) => acc.account.data.toString() === "00"
      );

      if (tokenAccountInfo) {
        const tokenAccountData = Token.AccountLayout.decode(
          tokenAccountInfo.account.data
        );
        const balance = tokenAccountData.amount;
        return formatNumberWithDecimals(balance, 6);
      } else {
        return 0;
      }
    }
  } catch (error) {
    return null;
  }
}
(async () => {
  const balance = await getBalanceSolana(solanaAddress, null, true);
  console.log(`Solana balance for address ${solanaAddress}: ${balance}`);
})();

// Usage example for USDT balance:
(async () => {
  const tokenMint = "Es9vMFrzaCERmJgZkBou7gTWU6TJ3jTu7bNKBGSjqWg6"; // USDT mint address on Solana
  const balance = await getBalanceSolana(solanaAddress, tokenMint);
  console.log(`USDT balance for address ${solanaAddress}: ${balance}`);
})();

function formatNumberWithDecimals(number, decimals = 0) {
  const numberWithDecimals = parseFloat(number / 10 ** decimals).toFixed(
    decimals
  );
  return Number(numberWithDecimals).toLocaleString();
}
module.exports = { getBalanceSolana };
