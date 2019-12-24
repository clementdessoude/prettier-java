"use strict";
const { resolve } = require("path");
const { cloneRepoIfNotExists, testRepositorySample } = require("../test-utils");

cloneRepoIfNotExists({
  repoName: "spring-boot",
  repoUrl: "https://github.com/spring-projects/spring-boot.git",
  branch: "v2.1.0.RELEASE"
});
testRepositorySample(
  resolve(__dirname, "../../samples/spring-boot"),
  "true",
  []
);
