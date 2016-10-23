import axios from 'axios';

var instance = axios.create({
    baseURL: 'http://188.166.18.245:8081/',
});

export default (method, params = null, errorHandler = null) => {
    if(errorHandler) {
        instance.interceptors.response.use(undefined, err => {
            errorHandler(err.response.data.error.message);
            throw err;
        });
    }

    let prepareParams = function(obj, prefix) {
        let str = [], value, newKey;
        for (let key in obj) {
            value = obj[key];
            if(value === "") continue;
            newKey = prefix ? prefix + "[" + key + "]" : key;
            str.push(typeof value == "object" ? prepareParams(value, newKey) : encodeURIComponent(newKey) + "=" + encodeURIComponent(value));
        }
        return str.join("&");
    }

    let url = method;
    if(params) url += '?' + prepareParams(params);

    return {
        get() {
            return instance.get(url);
        }
    };
};