const fs = require('fs');
const path = require('path');

const env = () :string=> {
    let dotenvPath :string = path.resolve(process.cwd(), '.env');
    let data :string;
    try {        
        data = fs.readFileSync(dotenvPath, 'utf8');
    }
    catch (err) {
        return 'Couldn\'t load .env file.';
    }
    importEnv(data);
    return 'Found .env file. OK';
}

const importEnv = (data :string) :void => {
    data.split('\n').forEach(variable => {
        let keyVal = variable.trim().split('=');
        let value;
        value = keyVal[1]
        process.env[keyVal[0]] = value;
    });
}

export default env;