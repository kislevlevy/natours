const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `Kislev Levy <${process.env.EMAIL_FROM}>`;
  }

  _newTransport() {
    if (process.env.NODE_ENV === 'production') return 1;

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async _send(tamplate, subject) {
    const html = pug.renderFile(`${__dirname}/../views/emails/${tamplate}.pug`, {
      name: this.name,
      url: this.url,
      subject,
    });

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.convert(html, { wordwrap: 130 }),
    };
    await this._newTransport().sendMail(emailOptions);
  }

  async welcome() {
    await this._send('welcome', 'Welcome to the Natours family!');
  }

  async resetPassword() {
    await this._send(
      'resetPassword',
      'Reset your Natours account password - (valid for 10 minutes)',
    );
  }
};
