const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const usersRepo = require("./repositories/users");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    keys: ["asdjhlahdfhalskfhaskfha398203u42"]
  })
);

app.get("/signup", (req, res) => {
  res.send(`
    <div> 
        Your id is: ${req.session.userId}
        <form method="POST">
            <input name="email" placeholder="email" /> 
            <input name="password" placeholder="password" /> 
            <input name="passwordConfirmation" placeholder="password confirmation" /> 
            <button>Sign Up </button>
        </form>
    </div>
  `);
});

app.post("/signup", async (req, res) => {
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
});

app.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out");
});

app.get('/signin', (req, res) => {
  res.send(`
  <div> 
        <form method="POST">
            <input name="email" placeholder="email" /> 
            <input name="password" placeholder="password" /> 
            <button>Sign In </button>
        </form>
    </div>
  
  `);
});

app.post('/signin', async (req,res) => {
  const {email, password} = req.body;
  const user = await usersRepo.getOneBy({email});
  if(!user){
    return res.send('email not found');
  }

  const validPassword = await usersRepo.comparePassword(
    user.password, password
  );
  if(!validPassword){
    return res.send('Invalid password');
  }
  req.session.userId = user.id;

  res.send('you are signed in');
})
app.listen(3000, () => {
  console.log("Listening");
});
