/* eslint-disable no-unused-expressions */

import axios from 'axios';

const baseUrl = "http://localhost:8080/api/";

const Requests_API = async ({method = "GET", sub_url = "", params = {}, body = {}, headers = {}, timeout = 3000}) => {
  let raw_config = {
    baseURL: baseUrl + sub_url,
    method: method,
    params: params,
    headers: headers,
    timeout: timeout
  }

  if (method === "POST" || method === "PUT" || method === "DELETE"){ raw_config['data'] = body; }
  
  return axios(raw_config).then((res) => {
    return {
      type: "ok",
      code: res.status,
      data: res.data
    };
  }).catch(function (error) {
    if (error.response) {
      return {
        type: "error",
        code: error.response.status,
        details: error.response.data
      };
    }
    else{
      return {
        type: "error",
        code: 0, // time limit error
        details: error
      }
    }
  });
}

export default Requests_API;