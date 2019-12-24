"use strict";
const { resolve } = require("path");
const { cloneRepoIfNotExists, testRepositorySample } = require("../test-utils");

cloneRepoIfNotExists({
  repoName: "guava",
  repoUrl: "https://github.com/google/guava.git",
  branch: "v27.0.1"
});
testRepositorySample(resolve(__dirname, "../../samples/guava"), "true", []);
