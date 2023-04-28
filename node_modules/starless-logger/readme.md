# Starless Logger

A simple logging library for Node.js.

## Installation

You can install the package via npm:

```bash
npm install starless-logger
```

## Usage

Import the package and call the `log` function with a message and an optional log level:

```javascript
const { log } = require("starless-logger");

log("Hello, world!"); // logs "[timestamp] [INFO] Hello, world!" in green
log("Warning message", "warn"); // logs "[timestamp] [WARN] Warning message" in yellow
log("Error message", "error"); // logs "[timestamp] [ERROR] Error message" in red
```

The `log` function takes two arguments: `message` (string) and `level` (optional string). If `level` is not provided, the default value is `"info"`. Valid values for `level` are `"info"`, `"warn"`, and `"error"`.

## Examples

```javascript
const { log } = require("starless-logger");

log("Starting server...", "info");
log("Connection lost!", "warn");
log("Failed to authenticate user", "error");
```
