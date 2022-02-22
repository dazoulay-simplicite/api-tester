const unirest = require('unirest');

const url = process.env.TEST_SIMPLICITE_URL;
console.log(`URL: ${url}`);
const username = process.env.TEST_SIMPLICITE_ADMIN_USERNAME;
console.log(`Username: ${username}`);
const password = process.env.TEST_SIMPLICITE_ADMIN_PASSWORD;
const debug = false;

const headers = { 'Accept': 'application/json' };
let token;

async function health() {
    const res = await unirest.get(`${url}/health?_output=json`).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function login(pwd) {
    const res = await unirest.get(`${url}/api/login?_output=json`).headers(headers).auth(username, pwd || password);
    token = res.body.authtoken;
    headers['Authorization'] = `Bearer ${token}`;
    return new Promise((resolve, reject) => resolve(res.body));
}

async function search(code) {
    const res = await unirest.get(`${url}/api/rest/SystemParam`).query({ sys_code: code }).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function get(id) {
    const res = await unirest.get(`${url}/api/rest/SystemParam/${id}`).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function create(code, value) {
    const res = await unirest.post(`${url}/api/rest/SystemParam`).query({ sys_code: code, sys_value: value }).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function update(id, value) {
    const res = await unirest.put(`${url}/api/rest/SystemParam/${id}`).query({ sys_value: value }).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function del(id) {
    const res = await unirest.delete(`${url}/api/rest/SystemParam/${id}`).headers(headers);
    return new Promise((resolve, reject) => resolve(res.body));
}

async function logout() {
    const res = await unirest.get(`${url}/api/logout?_output=json`).headers(headers);
    token = undefined;
    headers['Authorization'] = undefined;
    return new Promise((resolve, reject) => resolve(res.body));
}

(async function main() {
    const h = await health();
    if (debug) console.log(h);
    console.log(`Status: ${h.platform.status}`);

    const e = await login('_bad_password_');
    if (debug) console.log(e);

    const l = await login();
    if (debug) console.log(l);
    console.log(`Hello ${l.login}`);

    let res = await search('VERSION');
    if (debug) console.log(res);
    console.log(`Version: ${res[0].sys_value}`);

    res = await create(`TEST-${new Date().getTime()}`, 'Test');
    if (debug) console.log(res);
    console.log(`Created: ${res.sys_code} = ${res.sys_value}`);
    const id = res.row_id;

    res = await get(id);
    if (debug) console.log(res);
    console.log(`Get after create: ${res.sys_code} = ${res.sys_value}`);

    res = await update(id, 'Test updated');
    if (debug) console.log(res);
    console.log(`Updated: ${res.sys_code} = ${res.sys_value}`);

    res = await get(id);
    if (debug) console.log(res);
    console.log(`Get after update: ${res.sys_code} = ${res.sys_value}`);

    res = await del(id);
    if (debug) console.log(res);
    console.log(`Deleted: ${res.row_id}`);

    const lo = await logout();
    if (debug) console.log(lo);
    console.log(`Bye ${l.login}`);
})();

