const performance = require('perf_hooks').performance;

// Mock syncNoteToCloud taking 100ms
async function syncNoteToCloud(note) {
  return new Promise(resolve => setTimeout(() => resolve(true), 100));
}

const pendingNotes = Array.from({ length: 20 }, (_, i) => ({ id: i }));

async function runSequential() {
  const start = performance.now();
  let successCount = 0;
  for (const note of pendingNotes) {
    const didSync = await syncNoteToCloud(note);
    if (didSync) successCount++;
  }
  const end = performance.now();
  return { time: end - start, successCount };
}

async function runConcurrent() {
  const start = performance.now();
  let successCount = 0;

  const CONCURRENCY_LIMIT = 5;
  let index = 0;
  const worker = async () => {
    while (index < pendingNotes.length) {
      const currentIndex = index++;
      const note = pendingNotes[currentIndex];
      const didSync = await syncNoteToCloud(note);
      if (didSync) {
        successCount += 1;
      }
    }
  };

  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, pendingNotes.length) }, worker);
  await Promise.all(workers);

  const end = performance.now();
  return { time: end - start, successCount };
}

async function runAll() {
  console.log("Running Sequential...");
  const seqRes = await runSequential();
  console.log(`Sequential: ${seqRes.time.toFixed(2)}ms, success: ${seqRes.successCount}`);

  console.log("Running Concurrent...");
  const conRes = await runConcurrent();
  console.log(`Concurrent: ${conRes.time.toFixed(2)}ms, success: ${conRes.successCount}`);
}

runAll();
