const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const authMiddleware = require('../middleware/auth')
const crypto = require('crypto');
const mailer = require('../modules/mailer')


const { User } = require('../models');

const router = express.Router();


function generateToken(params = {}) {
  return jwt.sign({ params }, authConfig.secret, {
    expiresIn: 86400
  });
}



router.post('/register', async (req, res) => {

  const emailSearch = req.body.email;

  try {

    if (await User.findOne({ where: { email: emailSearch } })) {
      return res.status(400).send({ error: 'User Already exists' });
    }


    const user = await User.create(req.body);
    user.password = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    return res.status(200).send({
      user,
      token: generateToken({ id: user.id }),
    });

  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ where: { email: email } });

    if (!user)
      return res.status(400).send({ error: 'User not found!' });

    if (!await bcrypt.compare(password, user.password))
      return res.status(400).send({ error: 'Invalid password' })

    user.password = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });

  } catch (err) {
    return res.status(400).send({ error: 'Authenticate failed' });
  }
});


router.post('/forgot_pass', async (req, res) => {

  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user)
      return res.status(400).send({ error: 'User not found!' });

    const token = crypto.randomBytes(20).toString('hex');

    user.passwordResetToken = token;
    user.passwordResetExpires = new Date().getHours() + 1;

    user.save();

    mailer.sendMail({
      to: email,
      from: 'erick.adlima@gmail.com',
      template: 'forgot_pass',
      context: { token },
    }, (err) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ error: 'Cannot send forgot password email' + email });
      }

      return res.status(200).send({ sucess: 'Email send to ' + email });

    })


  } catch (error) {
    return res.status(400).send({ error: 'Erro on forgot password, try again' });
  }
});

router.post('/reset_pass', async (req, res) => {

  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user)
      return res.status(400).send({ error: 'User not found!' });


    if(token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token invalid!' });

    const now = new Date();

    if(now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expired, generae a new one!' });
    
    user.password = password;
    user.save();    

    return res.status(200).send({ sucess: 'Pass changed' });

  } catch (error) {
    return res.status(400).send({ error: 'Erro on reset password, try again' });
  }
});



module.exports = router;
