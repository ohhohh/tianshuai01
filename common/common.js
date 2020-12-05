const md5 = require('md5');


function setMd5(password, salt){
    return md5(md5(password) + salt);
}
function getRandomNumber(min, max){
    return Math.round(Math.random()*8999 + 1000);
}
module.exports = {
    setMd5: setMd5,
    getRandomNumber:getRandomNumber
}