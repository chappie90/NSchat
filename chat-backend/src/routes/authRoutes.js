const express = require('express');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  res.send({email, password});
});

module.exports = router;