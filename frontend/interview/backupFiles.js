// preserve file order and greedily fill each day until the next file would exceed the daily limit.
//  When that happens, I start a new day. This works because once order is fixed, 
//  there is no advantage to leaving unused space intentionally;
//  the earliest valid placement is always optimal.
function countBackupDays(files, dailyLimit) {
  if (dailyLimit <= 0) {
    throw new Error("dailyLimit must be positive");
  }

  let days = 0;
  let usedToday = 0;

  for (const size of files) {
    if (size > dailyLimit) {
      throw new Error("A file cannot fit in a single day");
    }

    if (usedToday + size > dailyLimit) {
      days++;
      usedToday = 0;
    }

    usedToday += size;
  }

  return usedToday > 0 ? days + 1 : days;
}

// This is 2nd approach, try to minimize the days
// Use a greedy algorithm to place the largest files first
function minimizeDays(files, dailyLimit) {
  if (dailyLimit <= 0) {
    throw new Error("dailyLimit must be positive");
  }

  const sortedFiles = [...files].sort((a, b) => b - a);

  const days = [];

  for (const fileSize of sortedFiles) {
    if (fileSize > dailyLimit) {
      throw new Error(`File size ${fileSize} exceeds daily limit`);
    }

    let placed = false;

    for (const day of days) {
      if (day.used + fileSize <= dailyLimit) {
        day.files.push(fileSize);
        day.used += fileSize;
        placed = true;
        break;
      }
    }

    if (!placed) {
      days.push({
        files: [fileSize],
        used: fileSize,
      });
    }
  }

  return days.map((day) => day.files);
}

console.log(minimizeDays([4, 8, 1, 4, 2], 10));
// [ [8, 2], [4, 4, 1] ]
// answer = 2