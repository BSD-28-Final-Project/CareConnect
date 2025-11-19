// Validation middleware for activity controller

// Generic validation helper
export const validate = (validationFn) => {
  return (req, res, next) => {
    const errors = validationFn(req.body, req.params, req.query);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
};

// Validate activity creation payload
export function validateActivityPayload(body) {
  const errors = [];
  if (!body) return ["Request body is required"];
  if (!body.title || typeof body.title !== "string")
    errors.push("title is required and must be a string");
  if (!body.description || typeof body.description !== "string")
    errors.push("description is required and must be a string");
  if (body.location && (typeof body.location !== "object" || body.location === null))
    errors.push("location must be an object");
  if (body.category && typeof body.category !== "string")
    errors.push("category must be a string");
  if (body.targetMoney && typeof body.targetMoney !== "number")
    errors.push("targetMoney must be a number");
  return errors;
}

// Validate volunteer registration payload
export function validateVolunteerPayload(body) {
  const errors = [];
  if (!body) return ["Request body is required"];
  if (!body.userId || typeof body.userId !== "string")
    errors.push("userId is required and must be a string");
  if (!body.name || typeof body.name !== "string")
    errors.push("name is required and must be a string");
  return errors;
}



// Generic error handler (can be expanded for other types)
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  // Optionally log the error details to a file or monitoring service here
  // For example: logErrorToFile(err);
  res.status(status).json({ message, error: err });
};
