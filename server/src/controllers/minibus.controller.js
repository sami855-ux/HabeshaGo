import minibusService from "../services/minibus.service.js";
import {
  createMinibusSchema,
  updateMinibusSchema,
} from "../schemas/minibus.schema.js";

class MinibusController {
  async create(req, res, next) {
    try {
      const data = createMinibusSchema.parse(req.body);
      const minibus = await minibusService.create(data);
      res.json(minibus);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const minibuses = await minibusService.getAll();
      res.json(minibuses);
    } catch (err) {
      next(err);
    }
  }

  async get(req, res, next) {
    try {
      const minibus = await minibusService.getById(req.params.id);
      res.json(minibus);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = updateMinibusSchema.parse(req.body);
      const updated = await minibusService.update(req.params.id, data);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await minibusService.delete(req.params.id);
      res.json({ message: "Minibus deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

export default new MinibusController();
