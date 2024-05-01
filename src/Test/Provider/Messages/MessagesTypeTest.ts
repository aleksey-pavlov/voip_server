let text = "tEst         \
test    teSt3      test";
console.log(text.replace(/\s+/gi, "").trim().toLowerCase());

let str = '\t\n\r this  \n \t   \r  is \r a   \n test \t  \r \n';

console.log(str.replace(/\s+/g, ' ').trim().toLowerCase()); // logs: "this is a test"

