const { join } = require('path')

module.exports = {
  assets: {
    dirPath: process.env.ASSETS_DIR_PATH || join(__dirname, '..', 'assets')
  },
  styles: {
    name: {
      top: '765px',
      width: '1890px',
      'font-size': '100px'
    }
  },
  email: {
    credentials: {
      username: process.env.EMAIL_CREDENTIALS_USERNAME,
      password: process.env.EMAIL_CREDENTIALS_PASSWORD
    },
    content: {
      subject: `[${process.env.EVENT_NAME}] Certificado`,
      body: name => `<h1>Obrigado pro participar ${name}!</h1>`,
      attachment: `Certificado ${process.env.EVENT_NAME}.pdf`
    }
  },
  pdf: {
    width: '1890px',
    height: '1417px'
  },
  batch: 10
}
