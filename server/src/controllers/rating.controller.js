import * as ratingService from "../services/rating.service.js";

export const createRating = async (req, res) => {
  const response = await ratingService.createRatingService(req.body);
  return res.status(response.statusCode).json(response);
};

export const updateRating = async (req, res) => {
  const response = await ratingService.updateRatingService(
    req.params.id,
    req.body,
    "cmknyr7sc00005zku6ti238bw"
    // req.user.id // assuming auth middleware
  );
  return res.status(response.statusCode).json(response);
};

export const deleteRating = async (req, res) => {
  const response = await ratingService.deleteRatingService(
    req.params.id,
    // req.user.id
    "cmknyr7sc00005zku6ti238bw"
  );
  return res.status(response.statusCode).json(response);
};

export const getStationRatings = async (req, res) => {
  const response = await ratingService.getRatingsByStationService(req.params.id);
  return res.status(response.statusCode).json(response);
};

export const getUserRatings = async (req, res) => {
  const response = await ratingService.getRatingsByUserService(req.params.id);
  return res.status(response.statusCode).json(response);
};