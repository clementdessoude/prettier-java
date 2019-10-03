"use strict";
const _ = require("lodash");

/**
 * Search where is the position of the comment in the token array by
 * using dichotomic search.
 * @param {*} tokens ordered array of tokens
 * @param {*} comment comment token
 * @return the position of the token next to the comment
 */
function findUpperBoundToken(tokens, comment) {
  let diff;
  let i;
  let current;

  let len = tokens.length;
  i = 0;

  while (len) {
    diff = len >>> 1;
    current = i + diff;
    if (tokens[current].startOffset > comment.startOffset) {
      len = diff;
    } else {
      i = current + 1;
      len -= diff + 1;
    }
  }
  return i;
}

/**
 * Extends each comments offsets to the left and the right in order to match the
 * previous and next token offset. This allow to directly match the prettier-ignore
 * comment to the correct CSTNode.
 * @param {*} tokens ordered array of tokens
 * @param {*} comments array of prettier-ignore comments
 * @return prettier-ignore comment array with extended location
 */
function extendCommentRange(tokens, comments) {
  const ignoreComments = [...comments];
  let position;
  ignoreComments.forEach(comment => {
    position = findUpperBoundToken(tokens, comment);
    comment.extendedRange = {};
    comment.extendedRange.startOffset =
      position - 1 < 0 ? comment.startOffset : tokens[position - 1].endOffset;
    comment.extendedRange.endOffset =
      position == tokens.length
        ? comment.endOffset
        : tokens[position].startOffset;
  });
  return ignoreComments;
}

function filterPrettierIgnore(comments) {
  return [...comments].filter(comment =>
    comment.image.match(
      /(\/\/(\s*)prettier-ignore(\s*))|(\/\*(\s*)prettier-ignore(\s*)\*\/)/gm
    )
  );
}

function shouldIgnore(node, comments, ignoredNodes) {
  const matchingComment = _.find(
    comments,
    comment => comment.extendedRange.endOffset === node.location.startOffset
  );
  if (matchingComment) {
    ignoredNodes[matchingComment.startOffset] = node;
  }
}

function attachIgnoreNodes(ignoreComments, ignoredNodes) {
  ignoreComments.forEach(comment => {
    if (ignoredNodes[comment.startOffset]) {
      ignoredNodes[comment.startOffset].ignore = true;
    }
  });
}

function ignoredComments(tokens, comments) {
  return extendCommentRange(tokens, filterPrettierIgnore(comments));
}

function pretraitement(tokens, comments) {
  const commentsEndOffset = {};
  const commentsStartOffset = {};

  let position;
  comments.forEach(comment => {
    position = findUpperBoundToken(tokens, comment);
    const startOffset =
      position - 1 < 0 ? comment.startOffset : tokens[position - 1].endOffset;
    const endOffset =
      position == tokens.length
        ? comment.endOffset
        : tokens[position].startOffset;

    if (commentsEndOffset[endOffset] === undefined) {
      commentsEndOffset[endOffset] = [comment];
    } else {
      commentsEndOffset[endOffset].push(comment);
    }

    if (commentsStartOffset[startOffset] === undefined) {
      commentsStartOffset[startOffset] = [comment];
    } else {
      commentsStartOffset[startOffset].push(comment);
    }
  });

  return { commentsEndOffset, commentsStartOffset };
}

function attachComments(tokens, comments, parser) {
  const { commentsStartOffset, commentsEndOffset } = pretraitement(
    tokens,
    comments
  );
  const commentsToAttach = new Set(comments);

  Object.keys(parser.leadingComments).forEach(startOffset => {
    if (commentsEndOffset[startOffset] !== undefined) {
      parser.leadingComments[startOffset].leadingComments =
        commentsEndOffset[startOffset];

      commentsEndOffset[startOffset].forEach(comment => {
        commentsToAttach.delete(comment);
      });
    }
  });

  Object.keys(parser.trailingComments).forEach(endOffset => {
    if (commentsStartOffset[endOffset] !== undefined) {
      const nodeTrailingComments = commentsStartOffset[endOffset].filter(
        comment => commentsToAttach.has(comment)
      );

      if (nodeTrailingComments.length > 0) {
        parser.trailingComments[
          endOffset
        ].trailingComments = nodeTrailingComments;
      }
    }
  });
}

module.exports = {
  attachComments,
  shouldIgnore,
  ignoredComments,
  attachIgnoreNodes
};
