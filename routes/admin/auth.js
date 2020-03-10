const express = require("express");
const { check } = require("express-validator");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [check("email").isEmail(), check("password"), check("passwordConfirmation")],
  async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    const existingUser = await usersRepo.getOneBy({ email });
    if (existingUser) {
      return res.send("Email in use");
    }
    if (password !== passwordConfirmation) {
      return res.send("Passwords must match");
    }

    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.send(`
          Account Created.
      
      `);
  }
);

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate());
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });
  if (!user) {
    return res.send("email not found");
  }

  const validPassword = await usersRepo.comparePassword(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send("Invalid password");
  }
  req.session.userId = user.id;

  res.send("you are signed in");
});

module.exports = router;
