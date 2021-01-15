module.exports = {
  mongoDbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL,
};
