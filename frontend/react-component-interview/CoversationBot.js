/**
 * ============================================================
 * VERSION 1: Clean OOD without EventBus
 * ============================================================
 *
 * Goal:
 * Refactor messy global Slack-style command logic into:
 *
 * - parseCommand()
 * - Conversation
 * - Bot classes
 *
 * Supported commands:
 *   /away <message>
 *   /meet <person>
 *   /givetaco <person>
 */

/**
 * ============================================================
 * STEP 1: Command parser
 * ============================================================
 */

function parseCommand(input) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const [name, ...args] = trimmed.slice(1).split(/\s+/);

  return {
    name,
    args, // args is message
    raw: input,
  };
}

/**
 * ============================================================
 * STEP 2: Conversation owns state
 * ============================================================
 *
 * Conversation owns:
 * - current user
 * - users
 * - messages
 * - bots
 *
 * Bots do not own global state.
 */

class Conversation {
  constructor({ currentUser, bots = [] }) {
    this.currentUser = currentUser;
    this.bots = bots;
    this.users = new Map();
    this.messages = [];

    this.addUser(currentUser);
  }

  addUser(name) {
    if (!this.users.has(name)) {
      this.users.set(name, {
        name,
        awayMessage: null,
        tacos: 0,
      });
    }

    return this.users.get(name);
  }

  addMessage(message) {
    this.messages.push(message);
  }

  send(input) {
    const command = parseCommand(input);

    if (!command) { // not start with /
      this.addMessage({
        type: "message",
        from: this.currentUser,
        text: input,
      });

      return this.snapshot();
    }

    const bot = this.bots.find((bot) => bot.canHandle(command.name));

    if (!bot) {
      this.addMessage({
        type: "error",
        text: `Unknown command: /${command.name}`,
      });

      return this.snapshot();
    }

    bot.handle(command, this);

    return this.snapshot();
  }

  snapshot() {
    return {
      currentUser: this.currentUser,
      users: Array.from(this.users.values()),
      messages: [...this.messages],
    };
  }
}

/**
 * ============================================================
 * STEP 3: Bot classes
 * ============================================================
 *
 * Each bot owns one command.
 * This avoids one giant if/else command processor.
 */

class AwayBot {
  canHandle(commandName) {
    return commandName === "away";
  }

  handle(command, conversation) {
    const awayMessage = command.args.join(" ") || "away";

    const user = conversation.addUser(conversation.currentUser);
    user.awayMessage = awayMessage;

    conversation.addMessage({
      type: "bot",
      bot: "AwayBot",
      text: `${conversation.currentUser} is away: ${awayMessage}`,
    });
  }
}

class MeetBot {
  canHandle(commandName) {
    return commandName === "meet";
  }

  handle(command, conversation) {
    const person = command.args[0];

    if (!person) {
      conversation.addMessage({
        type: "error",
        text: "Usage: /meet <person>",
      });
      return;
    }

    conversation.addUser(person);

    conversation.addMessage({
      type: "bot",
      bot: "MeetBot",
      text: `Meeting scheduled with ${person}`,
    });
  }
}

class TacoBot {
  canHandle(commandName) {
    return commandName === "givetaco";
  }

  handle(command, conversation) {
    const person = command.args[0];

    if (!person) {
      conversation.addMessage({
        type: "error",
        text: "Usage: /givetaco <person>",
      });
      return;
    }

    const user = conversation.addUser(person);
    user.tacos += 1;

    conversation.addMessage({
      type: "bot",
      bot: "TacoBot",
      text: `${person} received a taco 🌮`,
    });
  }
}

/**
 * ============================================================
 * STEP 4: Test helpers
 * ============================================================
 */

function assertEqual(actual, expected, label) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);

  if (!pass) {
    console.error(`❌ ${label}`);
    console.error("Expected:", expected);
    console.error("Actual:", actual);
    return;
  }

  console.log(`✅ ${label}`);
}

function assert(condition, label) {
  if (!condition) {
    console.error(`❌ ${label}`);
    return;
  }

  console.log(`✅ ${label}`);
}

/**
 * ============================================================
 * STEP 5: Tests for Version 1
 * ============================================================
 */

function runVersion1Tests() {
  console.log("\nRunning Version 1 tests...\n");

  const conversation = new Conversation({
    currentUser: "Khanh",
    bots: [new AwayBot(), new MeetBot(), new TacoBot()],
  });

  assertEqual(
    parseCommand("/away lunch"),
    {
      name: "away",
      args: ["lunch"],
      raw: "/away lunch",
    },
    "parseCommand parses /away"
  );

  let state = conversation.send("hello");

  assertEqual(
    state.messages.at(-1),
    {
      type: "message",
      from: "Khanh",
      text: "hello",
    },
    "normal message is added"
  );

  state = conversation.send("/away lunch");

  assertEqual(
    state.users.find((user) => user.name === "Khanh").awayMessage,
    "lunch",
    "/away sets away message"
  );

  assertEqual(
    state.messages.at(-1).text,
    "Khanh is away: lunch",
    "/away adds bot message"
  );

  state = conversation.send("/meet Sarah");

  assert(
    state.users.some((user) => user.name === "Sarah"),
    "/meet creates user if missing"
  );

  assertEqual(
    state.messages.at(-1).text,
    "Meeting scheduled with Sarah",
    "/meet adds meeting message"
  );

  state = conversation.send("/meet");

  assertEqual(
    state.messages.at(-1).text,
    "Usage: /meet <person>",
    "/meet validates missing person"
  );

  state = conversation.send("/givetaco Sarah");

  assertEqual(
    state.users.find((user) => user.name === "Sarah").tacos,
    1,
    "/givetaco increments tacos"
  );

  state = conversation.send("/unknown test");

  assertEqual(
    state.messages.at(-1).text,
    "Unknown command: /unknown",
    "unknown command shows error"
  );
}

runVersion1Tests();