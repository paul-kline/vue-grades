export async function postData(url = "", dat = {}): Promise<any> {
  // Default options are marked with *
  const data = new URLSearchParams();
  for (const key in dat) {
    data.append(key, (dat as any)[key]);
  }
  return fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      //   "Content-Type": "application/json"
      "Content-Type": "application/x-www-form-urlencoded"
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: data // body data type must match "Content-Type" header
  }).then(response => {
    console.log("response:", response);
    return response.json();
  }); // parses JSON response into native JavaScript objects
}
const proxy = "https://utils.pauliankline.com/proxy/proxy.php";
export async function proxyPost(url = "", data = {}) {
  (data as any).csurl = url;
  //   return postData(proxy + "?csurl=" + url, data);

  return postData(proxy, data);
}
