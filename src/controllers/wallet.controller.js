import { walletService } from "../services/wallet.service.js";

export const WalletController = {
  async getMyWallet(req, res) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.user.id);
      res.json(wallet);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deposit(req, res) {
    try {
      const { amount } = req.body;

      const result = await walletService.depositViaExternal(
        req.user.id,
        amount,
        "MANUAL_TOPUP"
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async transactions(req, res) {
    try {
      const txs = await walletService.getTransactions(req.user.id);
      res.json(txs);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};
