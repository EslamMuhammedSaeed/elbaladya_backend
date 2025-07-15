const bycrypt = require("bcrypt");

const generatePassword = (password) => {
  const salt = bycrypt.genSaltSync(10);
  const hash = bycrypt.hashSync(password, salt);

  return hash;
};

const validatePassword = (password, hash) => {
  return bycrypt.compareSync(password, hash);
};

module.exports = {
  generatePassword,
  validatePassword,
};
