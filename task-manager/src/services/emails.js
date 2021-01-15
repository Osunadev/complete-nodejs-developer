const sgMail = require('@sendgrid/mail');
const { sendgridApiKey, fromEmail } = require('../config');

sgMail.setApiKey(sendgridApiKey);

function sendWelcomeEmail(email, name) {
  return sgMail.send({
    to: email,
    from: fromEmail,
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}.`,
  });
}

function sendCancelEmail(email, name) {
  return sgMail.send({
    to: email,
    from: fromEmail,
    subject: 'Account Cancelation',
    text: `Sorry to say Goodbye :(, we hope to see you soon again, ${name}.`,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail,
};
