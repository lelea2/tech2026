function includes(str, target) {
  if (target === "") return true;
  if (target.length > str.length) return false;

  for (let i = 0; i <= str.length - target.length; i++) {
    let matched = true;

    for (let j = 0; j < target.length; j++) {
      if (str[i + j] !== target[j]) {
        matched = false;
        break;
      }
    }

    if (matched) return true;
  }

  return false;
}