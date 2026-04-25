const key = "AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function list() {
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
list();
