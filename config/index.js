const { join } = require('path')

module.exports = {
  debug: process.env.DEBUG === 'true',
  assets: {
    dirPath: process.env.ASSETS_DIR_PATH || join(__dirname, '..', 'assets')
  },
  styles: {
    name: {
      top: '600px',
      width: '1920px',
      'font-size': '80px',
      'font-family': 'cursive'
    }
  },
  email: {
    // in case it is a provate gmail account: https://myaccount.google.com/lesssecureapps
    credentials: {
      username: process.env.EMAIL_CREDENTIALS_USERNAME,
      password: process.env.EMAIL_CREDENTIALS_PASSWORD
    },
    content: {
      subject: `[${process.env.EVENT_NAME}] Certificado`,
      body: name => `<h1>Obrigado por participar, ${name}!</h1>`,
      attachment: `Certificado ${process.env.EVENT_NAME}.pdf`
    }
  },
  pdf: {
    width: '1920px',
    height: '1280px'
  },
  batch: 10
}
