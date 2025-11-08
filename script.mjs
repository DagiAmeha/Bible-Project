import bcrypt from "bcrypt";

const password = "yourpassword123"; // change this
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log("Hashed password:", hash);
});
