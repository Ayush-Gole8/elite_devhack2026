const sanitizeHtml = require('sanitize-html');
const crypto = require('crypto');

/**
 * sanitizeDescription
 *
 * Accepts raw HTML or plain text from a problem's description field and returns
 * a cleaned string that allows only a safe subset of tags. Scripts, event
 * handlers (on*), and all unknown tags/attributes are stripped.
 *
 * @param {string} htmlOrText - Raw input (may contain HTML markup)
 * @returns {string} Sanitized string safe for client rendering
 */
function sanitizeDescription(htmlOrText) {
  if (typeof htmlOrText !== 'string') return '';

  return sanitizeHtml(htmlOrText, {
    allowedTags: ['pre', 'code', 'p', 'ul', 'ol', 'li', 'br', 'strong', 'em'],
    allowedAttributes: {}, // no attributes on any tag
    disallowedTagsMode: 'discard',
    // Ensure <script> and anything with on* attributes is always stripped
    exclusiveFilter: (frame) => {
      const tag = frame.tag;
      if (tag === 'script' || tag === 'style') return true;
      return false;
    },
  });
}

/**
 * normalizeIO
 *
 * Normalises a raw test-case input or output string:
 *   1. Guarantees the value is a string (coerces non-strings to '')
 *   2. Normalises Windows line endings (\r\n) to Unix (\n)
 *   3. Trims trailing whitespace from every individual line
 *   4. Removes trailing blank lines from the end of the string
 *
 * @param {*} text - Raw input/output value
 * @returns {string} Normalized string
 */
function normalizeIO(text) {
  if (typeof text !== 'string') {
    text = text != null ? String(text) : '';
  }

  // Normalise line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Trim trailing whitespace on each line
  const lines = text.split('\n').map((line) => line.trimEnd());

  // Drop trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

/**
 * computeSha256
 *
 * Returns the SHA-256 hex digest of the given string.
 * Used for content-hash deduplication of problem files and descriptions.
 *
 * @param {string} str - Input string to hash
 * @returns {string} 64-character lowercase hex digest
 */
function computeSha256(str) {
  if (typeof str !== 'string') {
    str = str != null ? String(str) : '';
  }
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

module.exports = { sanitizeDescription, normalizeIO, computeSha256 };
