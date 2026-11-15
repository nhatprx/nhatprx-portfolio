// Helpers for the resume upload flow.
//
// The S3 key and the Content-Disposition header both carry the file name, so
// the name has to be stripped of anything that could change the meaning of
// either one. A file name with a quote in it would otherwise break out of
// the header value.

/**
 * Strips path separators and anything that is not safe in an S3 key or a
 * header value.
 *
 * @param {string} fileName
 * @returns {string}
 */
export function safeResumeName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

/**
 * The Content-Disposition the presigned URL signs and the browser sends.
 * `attachment` makes the file download instead of rendering inline on the S3
 * domain.
 *
 * @param {string} safeName the output of safeResumeName
 * @returns {string}
 */
export function resumeContentDisposition(safeName) {
  return `attachment; filename="${safeName}"`
}
