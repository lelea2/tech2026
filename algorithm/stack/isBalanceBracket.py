# O(n) time
# O(n) space

def is_balanced_brackets(s: str) -> bool:
  opening_brackets = "([{"
  closing_brackets = ")]}"

  matching_brackets = {
    ")": "(",
    "]": "[",
    "}": "{",
  }

  # Use a stack to track opening brackets
  stack = []

  for char in s:
    # Push opening brackets onto stack
    if char in opening_brackets:
      stack.append(char)
    # Process closing brackets
    elif char in closing_brackets:
      # No matching opening bracket
      if len(stack) == 0:
        return False

      # Top of stack matches expected opening bracket
      if stack[-1] == matching_brackets[char]:
        stack.pop()
      else:
        return False

  # Valid if no unmatched opening brackets remain
  return len(stack) == 0