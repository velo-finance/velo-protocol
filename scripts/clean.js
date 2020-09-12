var fs = require('fs');

// Loop through all the files in the temp directory
fs.readdir("./build/contracts", function (err, files) {
    console.log(files)

    files.forEach((value) => {
        const source = require(`../build/contracts/${value}`);
        const clean = {};

        clean.abi = source.abi;
        clean.networks = source.networks;

        fs.writeFile(`./clean_build/contracts/${value}`, JSON.stringify(clean, null, 4), console.log);
    });
})