"use strict";
const { resolve } = require("path");
const { cloneRepoIfNotExists, testRepositorySample } = require("../test-utils");

cloneRepoIfNotExists({
  repoName: "elasticsearch",
  repoUrl: "https://github.com/elastic/elasticsearch.git",
  branch: "v7.5.1"
});
testRepositorySample(
  resolve(__dirname, "../../samples/elasticsearch"),
  "true",
  []
);
