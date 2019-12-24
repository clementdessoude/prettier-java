/* eslint-disable no-console */
"use strict";
const { resolve } = require("path");
const { cloneRepoIfNotExists, testRepositorySample } = require("../test-utils");

try {
  cloneRepoIfNotExists({
    repoName: "java-design-patterns",
    repoUrl: "https://github.com/iluwatar/java-design-patterns.git",
    branch: "1.20.0"
  });
} catch (exception) {
  console.log(exception);
} finally {
  testRepositorySample(
    resolve(__dirname, "../../samples/java-design-patterns"),
    "true",
    []
  );
}
