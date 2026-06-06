
async function test() {
  const url = "https://umtawwfqlbuvqlqndzuq.supabase.co";
  console.log(`Fetching from ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
  } catch (e) {
    console.error(`Fetch failed: ${e.message}`);
  }
}
test();
