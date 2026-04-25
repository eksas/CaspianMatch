const key = "AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

async function test() {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hi" }] }]
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
