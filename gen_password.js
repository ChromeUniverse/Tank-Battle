const bcrypt = require('bcrypt');

const input = 'pass-word';

bcrypt.genSalt(12).then(salt => {
        bcrypt.hash(input, salt).then(hash => {
            console.log("here is the salt: ", salt);
            console.log("hashed password: ", hash);
            bcrypt.compare(input, hash).then(result => console.log(result));
        });
});