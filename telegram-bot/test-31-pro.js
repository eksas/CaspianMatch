const key = "AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0";
const model = "gemini-3.1-pro-preview";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

async function test() {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hello" }] }]
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
