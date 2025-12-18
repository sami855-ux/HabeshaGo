import { walletService } from "../services/wallet.service.js";

export const WalletController = {
  async create(req, res) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.body.userId);
      res.json(wallet);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deposit(req, res) {
    try {
      const result = await walletService.depositViaExternal(
        req.body.userId,
        req.body.amount,
        req.body.reference
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.params.userId);
      res.json(wallet);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async transactions(req, res) {
    try {
      const txs = await walletService.getTransactions(req.params.userId);
      res.json(txs);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
